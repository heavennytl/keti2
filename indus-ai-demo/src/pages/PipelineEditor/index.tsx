import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Row, Col, Statistic, Table, Tag, Button, message, Drawer, Select, InputNumber, Modal, Progress, Tooltip } from 'antd';
import { ApartmentOutlined, PlusOutlined, DeleteOutlined, PlayCircleOutlined, StopOutlined, ThunderboltOutlined, SwapOutlined, SaveOutlined, ClearOutlined, UndoOutlined } from '@ant-design/icons';
import { Graph, Shape } from '@antv/x6';
import { usePipelineStore } from '@/stores/usePipelineStore';
import LoadingState from '@/components/LoadingState';
import ErrorState from '@/components/ErrorState';

// 推理链数据
const pipelines = [
  { key: '1', name: '焊接质量检测链', nodes: 5, status: 'running', models: ['WeldDetect-v2', 'DefectClassify-v1'], latency: 120, throughput: 85 },
  { key: '2', name: '装配精度检测链', nodes: 4, status: 'running', models: ['AssemblyCheck-v1', 'AlignCheck-v2'], latency: 95, throughput: 110 },
  { key: '3', name: '表面缺陷检测链', nodes: 6, status: 'stopped', models: ['SurfaceDefect-v3', 'PolishingCheck-v1'], latency: 0, throughput: 0 },
  { key: '4', name: '综合质检链', nodes: 7, status: 'running', models: ['QualityCheck-v2', 'DimensionCheck-v1', 'AppearanceCheck-v2'], latency: 180, throughput: 55 },
];

const templates = [
  { key: '1', name: '视觉检测标准链', nodes: ['图像采集', '预处理', 'AI推理', '结果判定', '输出'], description: '适用于通用视觉检测场景' },
  { key: '2', name: '多模型融合链', nodes: ['图像采集', '模型A推理', '模型B推理', '融合分析', '结果输出'], description: '适用于多模型协同推理场景' },
  { key: '3', name: '端到端质检链', nodes: ['信号采集', '预处理', 'AI推理', '逻辑判定', '执行控制', '结果反馈'], description: '适用于完整质检流程' },
];

// 画布节点类型配置
const nodeTypeConfig = {
  input: { label: '输入', color: '#1677ff', icon: '📥' },
  process: { label: '处理', color: '#52c41a', icon: '⚙️' },
  model: { label: '模型', color: '#722ed1', icon: '🧠' },
  decision: { label: '判定', color: '#faad14', icon: '🔍' },
  output: { label: '输出', color: '#ff4d4f', icon: '📤' },
};

// 适配关联数据
const adaptLinkData: Record<string, { adapted: boolean; score: number; link: string }> = {
  'WeldDetect-v2': { adapted: true, score: 94, link: '/model-adapt' },
  'DefectClassify-v1': { adapted: true, score: 88, link: '/model-adapt' },
  'AssemblyCheck-v1': { adapted: false, score: 72, link: '/model-adapt' },
  'AlignCheck-v2': { adapted: true, score: 91, link: '/model-adapt' },
  'SurfaceDefect-v3': { adapted: false, score: 65, link: '/model-adapt' },
  'PolishingCheck-v1': { adapted: false, score: 58, link: '/model-adapt' },
  'QualityCheck-v2': { adapted: true, score: 95, link: '/model-adapt' },
  'DimensionCheck-v1': { adapted: true, score: 87, link: '/model-adapt' },
  'AppearanceCheck-v2': { adapted: false, score: 70, link: '/model-adapt' },
};

export default function PipelineEditor() {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const graphRef = useRef<Graph | null>(null);
  const [selectedCell, setSelectedCell] = useState<any>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [canvasPipelines, setCanvasPipelines] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [runProgress, setRunProgress] = useState(0);
  const [highlightedNodeId, setHighlightedNodeId] = useState<string | null>(null);
  const [adaptModalOpen, setAdaptModalOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [saveName, setSaveName] = useState('');
  const runIntervalRef = useRef<number | null>(null);
  const undoStackRef = useRef<string[]>([]);

  const { pipelines: storePipelines, loading, error, fetchPipelines, fetchTemplates, savePipeline, clearCanvas } = usePipelineStore();

  useEffect(() => {
    fetchPipelines();
    fetchTemplates();
  }, [fetchPipelines, fetchTemplates]);

  // 初始化画布
  useEffect(() => {
    if (!containerRef.current || graphRef.current) return;

    const graph = new Graph({
      container: containerRef.current,
      width: containerRef.current.clientWidth,
      height: 480,
      background: { color: '#0d0d0d' },
      grid: { visible: true, size: 20, type: 'dot', args: { color: '#1a1a1a', thickness: 1 } },
      panning: { enabled: true },
      mousewheel: { enabled: true, zoomAtMousePosition: true },
      connecting: {
        router: 'manhattan',
        connector: { name: 'rounded' },
        allowBlank: false,
        snap: true,
        createEdge() {
          return new Shape.Edge({
            attrs: {
              line: { stroke: '#434343', strokeWidth: 2, targetMarker: { name: 'classic', size: 8 } },
            },
            labels: [{ attrs: { label: { text: '数据流', fill: '#666', fontSize: 10 } } }],
          });
        },
      },
      highlighting: {
        magnetAdsorbed: { name: 'stroke', args: { attrs: { fill: '#1677ff', stroke: '#1677ff' } } },
      },
    });

    graph.on('cell:click', ({ cell }) => {
      setSelectedCell(cell);
      if (cell.isNode()) {
        setDrawerOpen(true);
      }
    });

    graph.on('blank:click', () => {
      setSelectedCell(null);
      setDrawerOpen(false);
    });

    // 保存撤销快照
    graph.on('cell:added', () => { saveUndoSnapshot(graph); });
    graph.on('cell:removed', () => { saveUndoSnapshot(graph); });
    graph.on('cell:change:position', () => { saveUndoSnapshot(graph); });

    graphRef.current = graph;
    addSamplePipeline(graph);

    return () => {
      if (runIntervalRef.current) clearInterval(runIntervalRef.current);
      graph.dispose();
      graphRef.current = null;
    };
  }, []);

  const saveUndoSnapshot = (graph: Graph) => {
    undoStackRef.current.push(JSON.stringify(graph.toJSON()));
    if (undoStackRef.current.length > 20) undoStackRef.current.shift();
  };

  const handleUndo = useCallback(() => {
    const graph = graphRef.current;
    if (!graph || undoStackRef.current.length < 2) {
      message.info('没有可撤销的操作');
      return;
    }
    undoStackRef.current.pop(); // 当前状态
    const prevState = undoStackRef.current[undoStackRef.current.length - 1];
    if (prevState) {
      graph.fromJSON(JSON.parse(prevState));
      message.success('已撤销');
    }
  }, []);

  const addSamplePipeline = (graph: Graph) => {
    const nodes = [
      { id: '1', x: 80, y: 200, type: 'input', label: '图像采集' },
      { id: '2', x: 240, y: 200, type: 'process', label: '图像预处理' },
      { id: '3', x: 400, y: 160, type: 'model', label: 'WeldDetect-v2' },
      { id: '4', x: 400, y: 280, type: 'model', label: 'DefectClassify-v1' },
      { id: '5', x: 560, y: 220, type: 'decision', label: '结果判定' },
      { id: '6', x: 720, y: 220, type: 'output', label: '输出结果' },
    ];

    nodes.forEach((n) => {
      const config = nodeTypeConfig[n.type as keyof typeof nodeTypeConfig];
      graph.addNode({
        id: n.id,
        x: n.x,
        y: n.y,
        width: 120,
        height: 50,
        attrs: {
          body: { rx: 8, ry: 8, fill: `${config.color}15`, stroke: config.color, strokeWidth: 1.5 },
          label: { text: `${config.icon} ${n.label}`, fill: '#e5e5e5', fontSize: 12, fontWeight: 600 },
        },
        data: { type: n.type, label: n.label },
      });
    });

    const edges = [
      { source: '1', target: '2', label: '图像数据' },
      { source: '2', target: '3', label: '预处理后' },
      { source: '2', target: '4', label: '预处理后' },
      { source: '3', target: '5', label: '检测结果' },
      { source: '4', target: '5', label: '分类结果' },
      { source: '5', target: '6', label: '最终结果' },
    ];

    edges.forEach((e) => {
      graph.addEdge({
        source: e.source,
        target: e.target,
        attrs: {
          line: { stroke: '#434343', strokeWidth: 2, targetMarker: { name: 'classic', size: 8 } },
        },
        labels: [{ attrs: { label: { text: e.label, fill: '#666', fontSize: 10 } } }],
      });
    });
  };

  // 运行动画
  const runPipeline = useCallback(() => {
    const graph = graphRef.current;
    if (!graph || isRunning) return;

    setIsRunning(true);
    setRunProgress(0);
    const nodeIds = ['1', '2', '3', '4', '5', '6'];
    let currentIndex = 0;

    nodeIds.forEach((id) => {
      const node = graph.getCellById(id);
      if (node) {
        const type = node.getData()?.type || 'process';
        const config = nodeTypeConfig[type as keyof typeof nodeTypeConfig];
        node.attr('body/fill', `${config.color}15`);
        node.attr('body/stroke', config.color);
        node.attr('body/strokeWidth', 1.5);
      }
    });

    graph.getEdges().forEach((edge) => {
      edge.attr('line/stroke', '#434343');
      edge.attr('line/strokeWidth', 2);
    });

    runIntervalRef.current = window.setInterval(() => {
      if (currentIndex >= nodeIds.length) {
        if (runIntervalRef.current) clearInterval(runIntervalRef.current);
        runIntervalRef.current = null;
        setIsRunning(false);
        setRunProgress(100);
        message.success('推理链执行完成！');
        return;
      }

      const id = nodeIds[currentIndex];
      const node = graph.getCellById(id);
      if (node) {
        node.attr('body/fill', 'rgba(22, 119, 255, 0.3)');
        node.attr('body/stroke', '#1677ff');
        node.attr('body/strokeWidth', 3);
        setHighlightedNodeId(id);

        if (currentIndex > 0) {
          const prevId = nodeIds[currentIndex - 1];
          graph.getEdges().forEach((edge) => {
            const source = edge.getSourceCell();
            const target = edge.getTargetCell();
            if (source?.id === prevId && target?.id === id) {
              edge.attr('line/stroke', '#1677ff');
              edge.attr('line/strokeWidth', 3);
            }
          });
        }

        setRunProgress(Math.round(((currentIndex + 1) / nodeIds.length) * 100));
      }
      currentIndex++;
    }, 800);
  }, [isRunning]);

  const stopPipeline = useCallback(() => {
    if (runIntervalRef.current) {
      clearInterval(runIntervalRef.current);
      runIntervalRef.current = null;
    }
    setIsRunning(false);
    message.info('推理链已停止');
  }, []);

  const addNode = useCallback((type: string) => {
    const graph = graphRef.current;
    if (!graph) return;
    const config = nodeTypeConfig[type as keyof typeof nodeTypeConfig];
    const id = `node-${Date.now()}`;
    graph.addNode({
      id,
      x: 80 + Math.random() * 300,
      y: 80 + Math.random() * 300,
      width: 120,
      height: 50,
      attrs: {
        body: { rx: 8, ry: 8, fill: `${config.color}15`, stroke: config.color, strokeWidth: 1.5 },
        label: { text: `${config.icon} 新${config.label}节点`, fill: '#e5e5e5', fontSize: 12, fontWeight: 600 },
      },
      data: { type, label: `新${config.label}节点` },
    });
    message.success(`已添加${config.label}节点`);
  }, []);

  const deleteSelected = useCallback(() => {
    const graph = graphRef.current;
    if (!graph || !selectedCell) return;
    graph.removeCell(selectedCell);
    setSelectedCell(null);
    setDrawerOpen(false);
    message.success('已删除');
  }, [selectedCell]);

  const handleSave = useCallback(() => {
    const graph = graphRef.current;
    if (!graph) return;
    const name = saveName.trim() || `推理链_${Date.now()}`;
    savePipeline(name);
    setCanvasPipelines(prev => [...prev, name]);
    setSaveName('');
    message.success(`推理链「${name}」已保存`);
  }, [saveName, savePipeline]);

  const handleClear = useCallback(() => {
    const graph = graphRef.current;
    if (!graph) return;
    Modal.confirm({
      title: '确认清空画布？',
      content: '清空后当前所有节点和连线将被删除',
      onOk: () => {
        graph.clearCells();
        clearCanvas();
        setCanvasPipelines([]);
        setSelectedCell(null);
        setDrawerOpen(false);
        message.success('画布已清空');
      },
    });
  }, [clearCanvas]);

  const useTemplate = useCallback((template: typeof templates[0]) => {
    const graph = graphRef.current;
    if (!graph) return;
    graph.clearCells();
    template.nodes.forEach((nodeName, i) => {
      let type = 'process';
      if (i === 0) type = 'input';
      else if (i === template.nodes.length - 1) type = 'output';
      else if (nodeName.includes('推理') || nodeName.includes('模型')) type = 'model';
      else if (nodeName.includes('判定') || nodeName.includes('融合')) type = 'decision';
      const config = nodeTypeConfig[type as keyof typeof nodeTypeConfig];
      graph.addNode({
        id: `t-${i}`,
        x: 80 + i * 140,
        y: 200,
        width: 120,
        height: 50,
        attrs: {
          body: { rx: 8, ry: 8, fill: `${config.color}15`, stroke: config.color, strokeWidth: 1.5 },
          label: { text: `${config.icon} ${nodeName}`, fill: '#e5e5e5', fontSize: 12, fontWeight: 600 },
        },
        data: { type, label: nodeName },
      });
    });
    for (let i = 0; i < template.nodes.length - 1; i++) {
      graph.addEdge({
        source: `t-${i}`,
        target: `t-${i + 1}`,
        attrs: { line: { stroke: '#434343', strokeWidth: 2, targetMarker: { name: 'classic', size: 8 } } },
      });
    }
    message.success(`已加载模板: ${template.name}`);
  }, []);

  const handleAdaptLink = (modelName: string) => {
    setSelectedModel(modelName);
    setAdaptModalOpen(true);
  };

  if (loading) return <LoadingState tip="加载推理链数据..." fullPage />;
  if (error) return <ErrorState message={error} onRetry={fetchPipelines} />;

  return (
    <div>
      <Row gutter={[16, 16]}>
        <Col span={4}><Card><Statistic title="推理链总数" value={storePipelines.length || 6} /></Card></Col>
        <Col span={4}><Card><Statistic title="运行中" value={storePipelines.filter(p => p.status === 'running').length || 3} valueStyle={{ color: '#52c41a' }} /></Card></Col>
        <Col span={4}><Card><Statistic title="总节点数" value={32} /></Card></Col>
        <Col span={4}><Card><Statistic title="平均延迟" value={132} suffix="ms" /></Card></Col>
        <Col span={4}><Card><Statistic title="总吞吐量" value={250} suffix="FPS" /></Card></Col>
        <Col span={4}>
          <Card>
            <Statistic title="操作" />
            <Button type="primary" icon={<ApartmentOutlined />} style={{ marginTop: 8 }}>新建推理链</Button>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col span={16}>
          <Card
            title="推理链画布"
            extra={
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                {isRunning && <Progress percent={runProgress} size="small" style={{ width: 120 }} />}
                <Button size="small" icon={<PlusOutlined />} onClick={() => addNode('input')}>输入</Button>
                <Button size="small" icon={<PlusOutlined />} onClick={() => addNode('process')}>处理</Button>
                <Button size="small" icon={<PlusOutlined />} onClick={() => addNode('model')}>模型</Button>
                <Button size="small" icon={<PlusOutlined />} onClick={() => addNode('decision')}>判定</Button>
                <Button size="small" icon={<PlusOutlined />} onClick={() => addNode('output')}>输出</Button>
                <div className="ant-divider" style={{ height: 20, margin: '0 4px' }} />
                <Tooltip title="保存当前画布">
                  <Button size="small" icon={<SaveOutlined />} onClick={handleSave}>保存</Button>
                </Tooltip>
                <Tooltip title="撤销上一步操作">
                  <Button size="small" icon={<UndoOutlined />} onClick={handleUndo}>撤销</Button>
                </Tooltip>
                <Tooltip title="清空画布">
                  <Button size="small" icon={<ClearOutlined />} onClick={handleClear}>清空</Button>
                </Tooltip>
                <div className="ant-divider" style={{ height: 20, margin: '0 4px' }} />
                {!isRunning ? (
                  <Button size="small" type="primary" icon={<PlayCircleOutlined />} onClick={runPipeline}>运行</Button>
                ) : (
                  <Button size="small" danger icon={<StopOutlined />} onClick={stopPipeline}>停止</Button>
                )}
                {selectedCell && (
                  <Button size="small" danger icon={<DeleteOutlined />} onClick={deleteSelected}>删除</Button>
                )}
              </div>
            }
          >
            <div ref={containerRef} style={{ width: '100%', height: 480, borderRadius: 8, overflow: 'hidden' }} />
            <div style={{ marginTop: 8, fontSize: 12, color: '#a0a0a0', display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              <span>🖱️ 拖拽节点连线</span>
              <span>🔍 滚轮缩放</span>
              <span>✋ 拖拽平移画布</span>
              <span>👆 点击节点编辑属性</span>
              {highlightedNodeId && <span style={{ color: '#1677ff' }}>▶ 当前执行: {highlightedNodeId}</span>}
              {canvasPipelines.length > 0 && <span style={{ color: '#52c41a' }}>💾 已保存: {canvasPipelines.join(', ')}</span>}
            </div>
          </Card>
        </Col>
        <Col span={8}>
          <Card title="推理链模板">
            {templates.map(t => (
              <div key={t.key} style={{ border: '1px solid #303030', borderRadius: 8, padding: 12, marginBottom: 12, background: '#1a1a1a' }}>
                <div style={{ fontWeight: 600, marginBottom: 4 }}>{t.name}</div>
                <div style={{ fontSize: 12, color: '#a0a0a0', marginBottom: 8 }}>{t.description}</div>
                <div style={{ fontSize: 12, color: '#a0a0a0', marginBottom: 8 }}>节点: {t.nodes.join(' → ')}</div>
                <Button size="small" type="primary" onClick={() => useTemplate(t)}>使用模板</Button>
              </div>
            ))}
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col span={24}>
          <Card title="推理链列表">
            <Table
              dataSource={pipelines}
              columns={[
                { title: '推理链名称', dataIndex: 'name', key: 'name' },
                { title: '节点数', dataIndex: 'nodes', key: 'nodes' },
                { title: '状态', dataIndex: 'status', key: 'status', render: (s: string) => (
                  <Tag color={s === 'running' ? 'success' : 'default'}>{s === 'running' ? '运行中' : '已停止'}</Tag>
                )},
                {
                  title: '包含模型', dataIndex: 'models', key: 'models',
                  render: (models: string[]) => models.map(m => {
                    const adaptInfo = adaptLinkData[m];
                    return (
                      <Tag key={m} style={{ marginBottom: 2, cursor: adaptInfo ? 'pointer' : 'default' }}
                        color={adaptInfo?.adapted ? 'success' : 'warning'}
                        onClick={() => adaptInfo && handleAdaptLink(m)}>
                        {m} {adaptInfo?.adapted ? '✓' : '⚠'}
                      </Tag>
                    );
                  }),
                },
                { title: '延迟(ms)', dataIndex: 'latency', key: 'latency', render: (v: number) => v > 0 ? v : '-' },
                { title: '吞吐量(FPS)', dataIndex: 'throughput', key: 'throughput', render: (v: number) => v > 0 ? v : '-' },
                {
                  title: '操作', key: 'action', render: (_: any, record: typeof pipelines[0]) => (
                    <div style={{ display: 'flex', gap: 4 }}>
                      <Button type="link" size="small" icon={record.status === 'running' ? <StopOutlined /> : <PlayCircleOutlined />}>
                        {record.status === 'running' ? '停止' : '启动'}
                      </Button>
                      <Button type="link" size="small" icon={<SwapOutlined />} onClick={() => navigate('/model-adapt')}>
                        适配关联
                      </Button>
                    </div>
                  ),
                },
              ]}
              rowKey="key"
              size="small"
            />
          </Card>
        </Col>
      </Row>

      {/* 节点属性编辑抽屉 */}
      <Drawer title="节点属性" placement="right" width={320} onClose={() => setDrawerOpen(false)} open={drawerOpen}>
        {selectedCell?.isNode() && (
          <div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 13, color: '#a0a0a0', marginBottom: 4 }}>节点名称</div>
              <Select value={selectedCell.getData()?.type || 'process'} style={{ width: '100%' }}
                onChange={(val) => {
                  const config = nodeTypeConfig[val as keyof typeof nodeTypeConfig];
                  selectedCell.setData({ ...selectedCell.getData(), type: val });
                  selectedCell.attr('body/fill', `${config.color}15`);
                  selectedCell.attr('body/stroke', config.color);
                }}
                options={Object.entries(nodeTypeConfig).map(([key, cfg]) => ({ value: key, label: `${cfg.icon} ${cfg.label}` }))} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 13, color: '#a0a0a0', marginBottom: 4 }}>显示标签</div>
              <Select value={selectedCell.getData()?.label || ''} style={{ width: '100%' }}
                onChange={(val) => {
                  const nodeType = (selectedCell.getData()?.type || 'process') as keyof typeof nodeTypeConfig;
                  const config = nodeTypeConfig[nodeType];
                  selectedCell.setData({ ...selectedCell.getData(), label: val });
                  selectedCell.attr('label/text', `${config.icon} ${val}`);
                }}
                options={[
                  { value: '图像采集', label: '图像采集' }, { value: '图像预处理', label: '图像预处理' },
                  { value: 'AI推理', label: 'AI推理' }, { value: '结果判定', label: '结果判定' },
                  { value: '输出结果', label: '输出结果' }, { value: '模型A推理', label: '模型A推理' },
                  { value: '模型B推理', label: '模型B推理' }, { value: '融合分析', label: '融合分析' },
                  { value: '信号采集', label: '信号采集' }, { value: '逻辑判定', label: '逻辑判定' },
                  { value: '执行控制', label: '执行控制' }, { value: '结果反馈', label: '结果反馈' },
                ]} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 13, color: '#a0a0a0', marginBottom: 4 }}>超时时间 (ms)</div>
              <InputNumber style={{ width: '100%' }} min={100} max={60000} defaultValue={5000} step={100} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 13, color: '#a0a0a0', marginBottom: 4 }}>重试次数</div>
              <InputNumber style={{ width: '100%' }} min={0} max={10} defaultValue={3} />
            </div>
            <Button danger block icon={<DeleteOutlined />} onClick={deleteSelected}>删除此节点</Button>
          </div>
        )}
      </Drawer>

      {/* 适配关联弹窗 */}
      <Modal title="模型适配状态" open={adaptModalOpen} onCancel={() => setAdaptModalOpen(false)}
        footer={[
          <Button key="close" onClick={() => setAdaptModalOpen(false)}>关闭</Button>,
          <Button key="goto" type="primary" onClick={() => { setAdaptModalOpen(false); navigate('/model-adapt'); }}>
            前往适配中心
          </Button>,
        ]}>
        {selectedModel && adaptLinkData[selectedModel] && (
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>{selectedModel}</div>
            <div style={{ marginBottom: 16 }}>
              <Progress type="circle" percent={adaptLinkData[selectedModel].score}
                strokeColor={adaptLinkData[selectedModel].score >= 80 ? '#52c41a' : adaptLinkData[selectedModel].score >= 60 ? '#faad14' : '#ff4d4f'}
                format={(p) => `${p}分`} size={100} />
            </div>
            <div style={{ color: '#a0a0a0', fontSize: 13 }}>
              <div>适配状态: {adaptLinkData[selectedModel].adapted ? <Tag color="success">已适配</Tag> : <Tag color="warning">未适配</Tag>}</div>
              <div style={{ marginTop: 8 }}>兼容性评分: {adaptLinkData[selectedModel].score}%</div>
              {!adaptLinkData[selectedModel].adapted && (
                <div style={{ marginTop: 8, color: '#faad14' }}>
                  <ThunderboltOutlined style={{ marginRight: 4 }} />建议前往适配中心完成适配后再部署
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
