import { useEffect, useRef, useState, useCallback } from 'react';
import { Card, Row, Col, Statistic, Table, Tag, Button, message, Drawer, Select, InputNumber } from 'antd';
import { ApartmentOutlined, PlusOutlined, DeleteOutlined, PlayCircleOutlined, StopOutlined } from '@ant-design/icons';
import { Graph, Shape } from '@antv/x6';

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

export default function PipelineEditor() {
  const containerRef = useRef<HTMLDivElement>(null);
  const graphRef = useRef<Graph | null>(null);
  const [selectedCell, setSelectedCell] = useState<any>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [canvasPipelines, setCanvasPipelines] = useState<string[]>([]);

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

    // 节点点击事件
    graph.on('cell:click', ({ cell }) => {
      setSelectedCell(cell);
      if (cell.isNode()) {
        setDrawerOpen(true);
      }
    });

    // 空白区域点击取消选中
    graph.on('blank:click', () => {
      setSelectedCell(null);
      setDrawerOpen(false);
    });

    graphRef.current = graph;

    // 添加默认示例节点
    addSamplePipeline(graph);

    return () => {
      graph.dispose();
      graphRef.current = null;
    };
  }, []);

  // 添加示例推理链
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
          body: {
            rx: 8,
            ry: 8,
            fill: `${config.color}15`,
            stroke: config.color,
            strokeWidth: 1.5,
          },
          label: {
            text: `${config.icon} ${n.label}`,
            fill: '#e5e5e5',
            fontSize: 12,
            fontWeight: 600,
          },
        },
        data: { type: n.type, label: n.label },
      });
    });

    // 添加连线
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

  // 添加节点
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
        body: {
          rx: 8,
          ry: 8,
          fill: `${config.color}15`,
          stroke: config.color,
          strokeWidth: 1.5,
        },
        label: {
          text: `${config.icon} 新${config.label}节点`,
          fill: '#e5e5e5',
          fontSize: 12,
          fontWeight: 600,
        },
      },
      data: { type, label: `新${config.label}节点` },
    });
    message.success(`已添加${config.label}节点`);
  }, []);

  // 删除选中节点
  const deleteSelected = useCallback(() => {
    const graph = graphRef.current;
    if (!graph || !selectedCell) return;
    graph.removeCell(selectedCell);
    setSelectedCell(null);
    setDrawerOpen(false);
    message.success('已删除');
  }, [selectedCell]);

  // 使用模板
  const useTemplate = useCallback((template: typeof templates[0]) => {
    const graph = graphRef.current;
    if (!graph) return;

    // 清空画布
    graph.clearCells();

    // 根据模板创建节点
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
          body: {
            rx: 8,
            ry: 8,
            fill: `${config.color}15`,
            stroke: config.color,
            strokeWidth: 1.5,
          },
          label: {
            text: `${config.icon} ${nodeName}`,
            fill: '#e5e5e5',
            fontSize: 12,
            fontWeight: 600,
          },
        },
        data: { type, label: nodeName },
      });
    });

    // 添加连线
    for (let i = 0; i < template.nodes.length - 1; i++) {
      graph.addEdge({
        source: `t-${i}`,
        target: `t-${i + 1}`,
        attrs: {
          line: { stroke: '#434343', strokeWidth: 2, targetMarker: { name: 'classic', size: 8 } },
        },
      });
    }

    message.success(`已加载模板: ${template.name}`);
  }, []);

  return (
    <div>
      <Row gutter={[16, 16]}>
        <Col span={4}><Card><Statistic title="推理链总数" value={6} /></Card></Col>
        <Col span={4}><Card><Statistic title="运行中" value={3} valueStyle={{ color: '#52c41a' }} /></Card></Col>
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
              <div style={{ display: 'flex', gap: 8 }}>
                <Button size="small" icon={<PlusOutlined />} onClick={() => addNode('input')}>输入</Button>
                <Button size="small" icon={<PlusOutlined />} onClick={() => addNode('process')}>处理</Button>
                <Button size="small" icon={<PlusOutlined />} onClick={() => addNode('model')}>模型</Button>
                <Button size="small" icon={<PlusOutlined />} onClick={() => addNode('decision')}>判定</Button>
                <Button size="small" icon={<PlusOutlined />} onClick={() => addNode('output')}>输出</Button>
                {selectedCell && (
                  <Button size="small" danger icon={<DeleteOutlined />} onClick={deleteSelected}>删除</Button>
                )}
              </div>
            }
          >
            <div
              ref={containerRef}
              style={{ width: '100%', height: 480, borderRadius: 8, overflow: 'hidden' }}
            />
            <div style={{ marginTop: 8, fontSize: 12, color: '#a0a0a0', display: 'flex', gap: 16 }}>
              <span>🖱️ 拖拽节点连线</span>
              <span>🔍 滚轮缩放</span>
              <span>✋ 拖拽平移画布</span>
              <span>👆 点击节点编辑属性</span>
            </div>
          </Card>
        </Col>
        <Col span={8}>
          <Card title="推理链模板">
            {templates.map(t => (
              <div key={t.key} style={{
                border: '1px solid #303030',
                borderRadius: 8,
                padding: 12,
                marginBottom: 12,
                background: '#1a1a1a',
              }}>
                <div style={{ fontWeight: 600, marginBottom: 4 }}>{t.name}</div>
                <div style={{ fontSize: 12, color: '#a0a0a0', marginBottom: 8 }}>{t.description}</div>
                <div style={{ fontSize: 12, color: '#a0a0a0', marginBottom: 8 }}>
                  节点: {t.nodes.join(' → ')}
                </div>
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
                { title: '包含模型', dataIndex: 'models', key: 'models', render: (models: string[]) => models.map(m => <Tag key={m} style={{ marginBottom: 2 }}>{m}</Tag>) },
                { title: '延迟(ms)', dataIndex: 'latency', key: 'latency', render: (v: number) => v > 0 ? v : '-' },
                { title: '吞吐量(FPS)', dataIndex: 'throughput', key: 'throughput', render: (v: number) => v > 0 ? v : '-' },
                {
                  title: '操作', key: 'action', render: (_: any, record: typeof pipelines[0]) => (
                    <Button type="link" size="small" icon={record.status === 'running' ? <StopOutlined /> : <PlayCircleOutlined />}>
                      {record.status === 'running' ? '停止' : '启动'}
                    </Button>
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
      <Drawer
        title="节点属性"
        placement="right"
        width={320}
        onClose={() => setDrawerOpen(false)}
        open={drawerOpen}
      >
        {selectedCell?.isNode() && (
          <div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 13, color: '#a0a0a0', marginBottom: 4 }}>节点名称</div>
              <Select
                value={selectedCell.getData()?.type || 'process'}
                style={{ width: '100%' }}
                onChange={(val) => {
                  const config = nodeTypeConfig[val as keyof typeof nodeTypeConfig];
                  selectedCell.setData({ ...selectedCell.getData(), type: val });
                  selectedCell.attr('body/fill', `${config.color}15`);
                  selectedCell.attr('body/stroke', config.color);
                }}
                options={Object.entries(nodeTypeConfig).map(([key, cfg]) => ({
                  value: key,
                  label: `${cfg.icon} ${cfg.label}`,
                }))}
              />
            </div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 13, color: '#a0a0a0', marginBottom: 4 }}>显示标签</div>
              <Select
                value={selectedCell.getData()?.label || ''}
                style={{ width: '100%' }}
                onChange={(val) => {
                  const nodeType = (selectedCell.getData()?.type || 'process') as keyof typeof nodeTypeConfig;
                  const config = nodeTypeConfig[nodeType];
                  selectedCell.setData({ ...selectedCell.getData(), label: val });
                  selectedCell.attr('label/text', `${config.icon} ${val}`);
                }}
                options={[
                  { value: '图像采集', label: '图像采集' },
                  { value: '图像预处理', label: '图像预处理' },
                  { value: 'AI推理', label: 'AI推理' },
                  { value: '结果判定', label: '结果判定' },
                  { value: '输出结果', label: '输出结果' },
                  { value: '模型A推理', label: '模型A推理' },
                  { value: '模型B推理', label: '模型B推理' },
                  { value: '融合分析', label: '融合分析' },
                  { value: '信号采集', label: '信号采集' },
                  { value: '逻辑判定', label: '逻辑判定' },
                  { value: '执行控制', label: '执行控制' },
                  { value: '结果反馈', label: '结果反馈' },
                ]}
              />
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
    </div>
  );
}
