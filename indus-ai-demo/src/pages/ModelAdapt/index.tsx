import { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Row, Col, Statistic, Table, Tag, Button, Select, Progress, message, Modal, Steps } from 'antd';
import { PlusOutlined, DownloadOutlined, RollbackOutlined, CaretRightOutlined, CheckCircleOutlined, ThunderboltOutlined, ExperimentOutlined, SafetyCertificateOutlined, FundOutlined, ApartmentOutlined, HistoryOutlined } from '@ant-design/icons';
import { useModelAdaptStore } from '@/stores/useModelAdaptStore';
import ReactEChartsCore from 'echarts-for-react';
import type { AdaptTask } from '@/types';

const statusColors: Record<string, string> = {
  '待开始': 'default',
  '进行中': 'processing',
  '已完成': 'success',
  '失败': 'error',
};

const adaptSteps = [
  { key: '1', title: '环境检测', description: '检测目标产线硬件配置、通信协议、环境条件' },
  { key: '2', title: '兼容性评估', description: '评估模型与硬件的兼容性、协议适配难度' },
  { key: '3', title: '适配配置', description: '选择适配器、配置协议参数、环境补偿参数' },
  { key: '4', title: '适配执行', description: '执行适配流程，监控适配进度' },
  { key: '5', title: '适配验证', description: '对比适配前后效果，验证适配结果' },
];

const stepDetails: Record<number, { label: string; items: string[] }> = {
  1: { label: '环境检测', items: ['检测到目标产线：焊接车间-A线', '检测到硬件：海康相机 + 西门子PLC + ABB机器人', '检测到协议：OPC UA', '环境条件：低光照、高噪声'] },
  2: { label: '兼容性评估', items: ['硬件兼容性：92%', '协议兼容性：100%', '环境适配难度：中等', '总体评估：推荐适配'] },
  3: { label: '适配配置', items: ['自动选择适配器：HikVision-CAM-v2', '自动选择适配器：Siemens-S7-v1', '自动选择适配器：ABB-IRB-v3', '协议参数已自动配置', '环境补偿：低光照增强 + 中值滤波'] },
  4: { label: '适配执行', items: ['[INFO] 硬件适配器加载完成', '[INFO] 协议参数配置完成', '[INFO] 环境补偿参数配置完成', '[INFO] 适配完成！耗时：45秒'] },
  5: { label: '适配验证', items: ['适配前精度：72% → 适配后精度：94%', '适配前延迟：180ms → 适配后延迟：65ms', '结论：适配成功 ✓'] },
};

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// 适配器联动评分数据
const adapterScoreMap: Record<string, { base: number; adapters: Record<string, number> }> = {
  'HikVision-CAM-v2': { base: 92, adapters: { 'Siemens-S7-v1': 95, 'Mitsubishi-FX-v2': 78, 'ABB-IRB-v3': 90 } },
  'Basler-CAM-v1': { base: 85, adapters: { 'Siemens-S7-v1': 82, 'Mitsubishi-FX-v2': 88, 'ABB-IRB-v3': 75 } },
  'Siemens-S7-v1': { base: 90, adapters: { 'HikVision-CAM-v2': 95, 'Basler-CAM-v1': 82, 'ABB-IRB-v3': 88 } },
  'ABB-IRB-v3': { base: 88, adapters: { 'HikVision-CAM-v2': 90, 'Siemens-S7-v1': 88, 'Basler-CAM-v1': 75 } },
};

export default function ModelAdapt() {
  const navigate = useNavigate();
  const {
    tasks, templates, adapters, history, comparison, recommendations, roi,
    fetchTasks, fetchTemplates, fetchAdapters, fetchHistory, fetchComparison,
    fetchRecommendations, fetchROI,
    setCurrentTask, currentTask, executeTask, rollbackTask,
  } = useModelAdaptStore();

  const [isAdapting, setIsAdapting] = useState(false);
  const [adaptLogs, setAdaptLogs] = useState<string[]>([]);
  const [adaptProgress, setAdaptProgress] = useState(0);
  const [adaptComplete, setAdaptComplete] = useState(false);
  const [mode, setMode] = useState<'auto' | 'manual'>('auto');
  const [manualStep, setManualStep] = useState(0);
  const [showComparison, setShowComparison] = useState(false);
  const [animatingValues, setAnimatingValues] = useState({ accuracyBefore: 72, accuracyAfter: 72, latencyBefore: 180, latencyAfter: 180 });

  // 多候选方案
  const [selectedScheme, setSelectedScheme] = useState<string>('1');
  // 适配器联动评分
  const [selectedAdapters, setSelectedAdapters] = useState<Record<string, string>>({});
  const [linkedScore, setLinkedScore] = useState(92);
  // 模板创建向导
  const [templateWizardOpen, setTemplateWizardOpen] = useState(false);
  const [templateStep, setTemplateStep] = useState(0);
  const [templateForm, setTemplateForm] = useState({ name: '', scene: '', hardware: '', protocol: '' });
  // 历史分析
  const [historyTab, setHistoryTab] = useState<'timeline' | 'analysis'>('timeline');

  const currentTaskRef = useRef(currentTask);
  currentTaskRef.current = currentTask;
  const isAdaptingRef = useRef(isAdapting);
  isAdaptingRef.current = isAdapting;
  const modeRef = useRef(mode);
  modeRef.current = mode;
  const manualStepRef = useRef(manualStep);
  manualStepRef.current = manualStep;

  useEffect(() => {
    fetchTasks();
    fetchTemplates();
    fetchAdapters();
    fetchHistory();
    fetchComparison('1');
    fetchRecommendations();
    fetchROI();
  }, []);

  const resetAdapt = useCallback(() => {
    setIsAdapting(false);
    setAdaptLogs([]);
    setAdaptProgress(0);
    setAdaptComplete(false);
    setManualStep(0);
    setShowComparison(false);
    setAnimatingValues({ accuracyBefore: 72, accuracyAfter: 72, latencyBefore: 180, latencyAfter: 180 });
  }, []);

  const startAdapt = useCallback(async () => {
    const task = currentTaskRef.current;
    if (!task) { message.warning('请先选择一个适配任务'); return; }
    if (isAdaptingRef.current) return;

    resetAdapt();
    setIsAdapting(true);
    executeTask(task.id);

    for (let step = 1; step <= 5; step++) {
      setCurrentTask({ ...task, currentStep: step, status: '进行中' as const });
      const stepInfo = stepDetails[step];
      setAdaptLogs((prev) => [...prev, `[INFO] 开始${stepInfo.label}...`]);
      const stepTime = step === 3 ? 1500 : step === 5 ? 1500 : 2000;
      const stepStartTime = Date.now();
      while (Date.now() - stepStartTime < stepTime) {
        const elapsed = Date.now() - stepStartTime;
        const stepProgress = Math.min(100, Math.round((elapsed / stepTime) * 100));
        setAdaptProgress(Math.min(100, Math.round((step - 1) * 20 + stepProgress * 0.2)));
        await delay(50);
      }
      stepInfo.items.forEach((item) => { setAdaptLogs((prev) => [...prev, `  ${item}`]); });
      setAdaptLogs((prev) => [...prev, `[INFO] ${stepInfo.label}完成 ✓`]);
      setAdaptProgress(step * 20);
      if (modeRef.current === 'manual' && step < 5) {
        setManualStep(step);
        await new Promise<void>((resolve) => {
          const interval = setInterval(() => {
            if (manualStepRef.current !== step) { clearInterval(interval); resolve(); }
          }, 100);
        });
      }
    }

    setAdaptComplete(true);
    setAdaptProgress(100);
    setCurrentTask({ ...task, status: '已完成', progress: 100, currentStep: 5 });
    setShowComparison(true);

    const targetValues = { accuracyAfter: 94, latencyAfter: 65 };
    const duration = 1000;
    const animStartTime = Date.now();
    while (Date.now() - animStartTime < duration) {
      const elapsed = Date.now() - animStartTime;
      const ratio = Math.min(1, elapsed / duration);
      setAnimatingValues({
        accuracyBefore: 72,
        accuracyAfter: Math.round(72 + (targetValues.accuracyAfter - 72) * ratio),
        latencyBefore: 180,
        latencyAfter: Math.round(180 + (targetValues.latencyAfter - 180) * ratio),
      });
      await delay(30);
    }
    setAnimatingValues({ accuracyBefore: 72, accuracyAfter: 94, latencyBefore: 180, latencyAfter: 65 });
    setIsAdapting(false);
    message.success('适配完成！');
  }, [executeTask, setCurrentTask, resetAdapt]);

  const handleManualConfirm = useCallback(() => { setManualStep((prev) => prev + 1); }, []);
  const handleManualRollback = useCallback(() => {
    const task = currentTaskRef.current;
    if (task) {
      rollbackTask(task.id);
      setCurrentTask({ ...task, currentStep: Math.max(0, task.currentStep - 1) });
      setManualStep((prev) => Math.max(1, prev - 1));
    }
  }, [rollbackTask, setCurrentTask]);

  const goToDeploy = useCallback(() => { navigate('/model-deploy?adaptedModel=WeldDetect-v2'); }, [navigate]);

  // 适配器联动评分
  const handleAdapterChange = useCallback((hardwareType: string, adapterName: string) => {
    const newSelected = { ...selectedAdapters, [hardwareType]: adapterName };
    setSelectedAdapters(newSelected);
    let score = 85;
    const entries = Object.entries(newSelected);
    if (entries.length > 0) {
      const firstAdapter = entries[0][1];
      const scoreData = adapterScoreMap[firstAdapter];
      if (scoreData) {
        score = scoreData.base;
        entries.slice(1).forEach(([, name]) => {
          if (scoreData.adapters[name]) {
            score = Math.round((score + scoreData.adapters[name]) / 2);
          }
        });
      }
    }
    setLinkedScore(score);
  }, [selectedAdapters]);

  // 模板创建向导
  const handleTemplateNext = () => {
    if (templateStep === 0 && !templateForm.name) { message.warning('请输入模板名称'); return; }
    if (templateStep < 3) setTemplateStep(templateStep + 1);
    else {
      message.success(`模板「${templateForm.name}」创建成功！`);
      setTemplateWizardOpen(false);
      setTemplateStep(0);
      setTemplateForm({ name: '', scene: '', hardware: '', protocol: '' });
    }
  };

  const taskColumns = [
    { title: '模型名称', dataIndex: 'modelName', key: 'modelName' },
    { title: '目标工厂', dataIndex: 'targetFactory', key: 'targetFactory' },
    { title: '适配状态', dataIndex: 'status', key: 'status', render: (status: string) => <Tag color={statusColors[status]}>{status}</Tag> },
    { title: '兼容性评分', dataIndex: 'compatibilityScore', key: 'compatibilityScore', render: (score: number) => <Progress percent={score} size="small" format={(p) => `${p}%`} /> },
    { title: '进度', dataIndex: 'progress', key: 'progress', render: (progress: number) => <Progress percent={progress} size="small" /> },
    { title: '负责人', dataIndex: 'assignee', key: 'assignee' },
    {
      title: '操作', key: 'action',
      render: (_: unknown, record: AdaptTask) => (
        <Button type="primary" size="small" icon={<CaretRightOutlined />}
          disabled={isAdapting || record.status === '已完成'}
          onClick={(e) => { e.stopPropagation(); setCurrentTask(record); setTimeout(() => startAdapt(), 100); }}>
          一键适配
        </Button>
      ),
    },
  ];

  const templateColumns = [
    { title: '模板名称', dataIndex: 'name', key: 'name' },
    { title: '适用场景', dataIndex: 'scene', key: 'scene' },
    { title: '硬件组合', dataIndex: 'hardware', key: 'hardware' },
    { title: '协议', dataIndex: 'protocol', key: 'protocol' },
    { title: '使用次数', dataIndex: 'useCount', key: 'useCount' },
    { title: '成功率', dataIndex: 'successRate', key: 'successRate', render: (rate: number) => <span style={{ color: rate >= 90 ? '#52c41a' : '#faad14' }}>{rate}%</span> },
    { title: '操作', key: 'action', render: () => <Button type="link" size="small">一键应用</Button> },
  ];

  // adapterColumns is used in the adapters table below
  const historySuccessRate = history.length > 0 ? Math.round(history.filter(h => h.result === 'success').length / history.length * 100) : 0;

  return (
    <div>
      {/* 顶部：适配概览 */}
      <Row gutter={[16, 16]}>
        <Col span={3}><Card><Statistic title="待适配模型" value={tasks.filter(t => t.status === '待开始').length} /></Card></Col>
        <Col span={3}><Card><Statistic title="已完成适配" value={tasks.filter(t => t.status === '已完成').length} /></Card></Col>
        <Col span={3}><Card><Statistic title="适配成功率" value={historySuccessRate} suffix="%" valueStyle={{ color: '#52c41a' }} /></Card></Col>
        <Col span={3}><Card><Statistic title="平均适配周期" value={roi?.avgAdaptDays ?? 2.3} suffix="天" /></Card></Col>
        <Col span={3}><Card><Statistic title="适配模板数" value={templates.length} /></Card></Col>
        <Col span={3}><Card><Statistic title="累计节省成本" value={roi ? `${(roi.totalSavedCost / 10000).toFixed(0)}万` : '-'} valueStyle={{ color: '#52c41a' }} /></Card></Col>
        <Col span={3}>
          <Card>
            <Statistic title="操作" />
            <Button type="primary" icon={<PlusOutlined />} style={{ marginTop: 8 }}>新建适配任务</Button>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        {/* 左侧：适配任务列表 */}
        <Col span={6}>
          <Card title="适配任务列表" extra={<Select defaultValue="all" size="small" style={{ width: 120 }}>
            <Select.Option value="all">全部状态</Select.Option>
            <Select.Option value="进行中">进行中</Select.Option>
            <Select.Option value="已完成">已完成</Select.Option>
            <Select.Option value="失败">失败</Select.Option>
          </Select>}>
            <Table dataSource={tasks} columns={taskColumns} rowKey="id" size="small" pagination={false}
              onRow={(record) => ({ onClick: () => { if (!isAdapting) { setCurrentTask(record); resetAdapt(); } }, style: { cursor: 'pointer', background: currentTask?.id === record.id ? 'rgba(22, 119, 255, 0.08)' : undefined } })} />
          </Card>
        </Col>

        {/* 中间：适配工作流 + 对比视图 */}
        <Col span={10}>
          <Card title="适配工作流" extra={!adaptComplete && currentTask && currentTask.status !== '已完成' ? (
            <Button type="primary" icon={<CaretRightOutlined />} onClick={startAdapt} loading={isAdapting} disabled={isAdapting || !currentTask}>
              {isAdapting ? '适配中...' : '一键适配'}
            </Button>
          ) : null}>
            <div style={{ marginBottom: 12, display: 'flex', gap: 8, alignItems: 'center' }}>
              <span style={{ color: '#a0a0a0', fontSize: 13 }}>适配模式：</span>
              <Tag color={mode === 'auto' ? 'blue' : 'default'} style={{ cursor: 'pointer' }} onClick={() => !isAdapting && setMode('auto')}>自动适配（推荐）</Tag>
              <Tag color={mode === 'manual' ? 'blue' : 'default'} style={{ cursor: 'pointer' }} onClick={() => !isAdapting && setMode('manual')}>手动引导适配</Tag>
            </div>
            {isAdapting && <div style={{ marginBottom: 12 }}><Progress percent={adaptProgress} size="small" /></div>}
            <div className="step-flow">
              {adaptSteps.map((step, index) => {
                const stepNum = index + 1;
                const isActive = currentTask?.currentStep === stepNum && isAdapting;
                const isCompleted = (currentTask?.currentStep ?? 0) > stepNum || (adaptComplete && stepNum <= 5);
                const isError = currentTask?.status === '失败' && currentTask?.currentStep === stepNum;
                return (
                  <div key={step.key} className={`step-item ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''} ${isError ? 'error' : ''}`}>
                    <div className="step-number">{isCompleted ? '✓' : stepNum}</div>
                    <div className="step-content">
                      <div style={{ fontWeight: 600, marginBottom: 4 }}>
                        {step.title}
                        {isActive && <Tag color="blue" style={{ marginLeft: 8, fontSize: 11 }}>执行中...</Tag>}
                        {isCompleted && !isActive && <Tag color="success" style={{ marginLeft: 8, fontSize: 11 }}>已完成</Tag>}
                      </div>
                      <div style={{ fontSize: 12, color: '#a0a0a0' }}>{step.description}</div>
                      {isActive && isAdapting && stepDetails[stepNum] && (
                        <div style={{ marginTop: 8, padding: 8, background: 'rgba(22, 119, 255, 0.05)', borderRadius: 4 }}>
                          {stepDetails[stepNum].items.map((item, i) => (<div key={i} style={{ fontSize: 12, color: '#e5e5e5', marginBottom: 2 }}>{item}</div>))}
                        </div>
                      )}
                      {mode === 'manual' && isActive && !adaptComplete && (
                        <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
                          <Button size="small" icon={<RollbackOutlined />} onClick={handleManualRollback}>回退</Button>
                          <Button size="small" type="primary" onClick={handleManualConfirm}>确认</Button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            {adaptLogs.length > 0 && (
              <div style={{ marginTop: 12, padding: 8, background: '#0d0d0d', borderRadius: 4, maxHeight: 120, overflow: 'auto', fontFamily: 'monospace', fontSize: 12 }}>
                {adaptLogs.map((log, i) => (
                  <div key={i} style={{ color: log.includes('✓') ? '#52c41a' : log.includes('ERROR') ? '#ff4d4f' : '#a0a0a0', marginBottom: 2 }}>{log}</div>
                ))}
              </div>
            )}
            {adaptComplete && (
              <div style={{ marginTop: 16, display: 'flex', gap: 12, justifyContent: 'center' }}>
                <Button icon={<DownloadOutlined />}>导出适配报告</Button>
                <Button type="primary" icon={<CaretRightOutlined />} onClick={goToDeploy}>前往部署</Button>
              </div>
            )}
          </Card>

          <Card title="适配前后效果对比" style={{ marginTop: 16 }} extra={adaptComplete && <Tag color="success" style={{ fontSize: 13, padding: '2px 12px' }}><CheckCircleOutlined /> 适配成功</Tag>}>
            {comparison && (
              <table className="comparison-table">
                <thead><tr><th>对比项</th><th>适配前</th><th>适配后</th><th>优化幅度</th></tr></thead>
                <tbody>
                  <tr><td>模型精度</td><td style={{ color: '#ff4d4f' }}>{animatingValues.accuracyBefore}%</td><td style={{ color: '#52c41a', fontWeight: showComparison ? 700 : 400 }}>{animatingValues.accuracyAfter}%</td><td className="improvement">{showComparison ? `↑ ${((94 - 72) / 72 * 100).toFixed(1)}%` : '-'}</td></tr>
                  <tr><td>推理延迟</td><td style={{ color: '#ff4d4f' }}>{animatingValues.latencyBefore}ms</td><td style={{ color: '#52c41a', fontWeight: showComparison ? 700 : 400 }}>{animatingValues.latencyAfter}ms</td><td className="improvement">{showComparison ? `↓ ${((180 - 65) / 180 * 100).toFixed(1)}%` : '-'}</td></tr>
                  <tr><td>硬件兼容性</td><td style={{ color: '#ff4d4f' }}>{comparison.hardwareCompatibleBefore}</td><td style={{ color: '#52c41a' }}>{comparison.hardwareCompatibleAfter}</td><td className="improvement">✅</td></tr>
                  <tr><td>协议适配</td><td style={{ color: '#ff4d4f' }}>{comparison.protocolBefore}</td><td style={{ color: '#52c41a' }}>{comparison.protocolAfter}</td><td className="improvement">✅</td></tr>
                </tbody>
              </table>
            )}
          </Card>
        </Col>

        {/* 右侧：多候选方案 + 适配器联动评分 + ROI */}
        <Col span={8}>
          {/* 多候选方案对比 */}
          <Card title={<span><ExperimentOutlined style={{ marginRight: 6 }} />多候选方案对比</span>} style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              {recommendations.map((rec) => (
                <div key={rec.id} onClick={() => setSelectedScheme(rec.id)} style={{
                  flex: 1, cursor: 'pointer', padding: 12, borderRadius: 8,
                  border: `2px solid ${selectedScheme === rec.id ? '#1677ff' : '#303030'}`,
                  background: selectedScheme === rec.id ? 'rgba(22, 119, 255, 0.08)' : '#1a1a1a',
                  transition: 'all 0.3s',
                }}>
                  <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8, color: rec.isRecommended ? '#1677ff' : '#e5e5e5' }}>
                    {rec.isRecommended && <ThunderboltOutlined style={{ marginRight: 4 }} />}{rec.name}
                  </div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: rec.score >= 90 ? '#52c41a' : rec.score >= 80 ? '#faad14' : '#ff4d4f', marginBottom: 4 }}>
                    {rec.score}<span style={{ fontSize: 12, color: '#a0a0a0' }}>分</span>
                  </div>
                  <div style={{ fontSize: 11, color: '#a0a0a0' }}>成功率: {rec.successRate}% | 周期: {rec.estimatedDays}天 | 成本: {rec.cost}</div>
                  {selectedScheme === rec.id && (
                    <div style={{ marginTop: 8, fontSize: 11, color: '#a0a0a0' }}>
                      <div>适配器: {rec.adapters.join(', ')}</div>
                      {rec.similarScenes.map((s, i) => (
                        <Tag key={i} style={{ marginTop: 4, fontSize: 10 }}>{s.scene} 相似度 {s.similarity}%</Tag>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <Button type="primary" block size="small" icon={<CaretRightOutlined />}>应用选定方案</Button>
          </Card>

          {/* 适配器选择联动评分 */}
          <Card title={<span><SafetyCertificateOutlined style={{ marginRight: 6 }} />适配器联动评分</span>} style={{ marginBottom: 16 }}>
            <div style={{ textAlign: 'center', marginBottom: 12 }}>
              <div style={{ fontSize: 36, fontWeight: 700, color: linkedScore >= 90 ? '#52c41a' : linkedScore >= 80 ? '#faad14' : '#ff4d4f' }}>{linkedScore}</div>
              <div style={{ fontSize: 12, color: '#a0a0a0' }}>综合兼容性评分</div>
            </div>
            <div style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 12, color: '#a0a0a0', marginBottom: 4 }}>相机适配器</div>
              <Select style={{ width: '100%' }} size="small" value={selectedAdapters['camera'] || undefined} placeholder="选择相机适配器"
                onChange={(v) => handleAdapterChange('camera', v)}
                options={adapters.filter(a => a.type === '相机适配器').map(a => ({ value: a.name, label: a.name }))} />
            </div>
            <div style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 12, color: '#a0a0a0', marginBottom: 4 }}>PLC适配器</div>
              <Select style={{ width: '100%' }} size="small" value={selectedAdapters['plc'] || undefined} placeholder="选择PLC适配器"
                onChange={(v) => handleAdapterChange('plc', v)}
                options={adapters.filter(a => a.type === 'PLC适配器').map(a => ({ value: a.name, label: a.name }))} />
            </div>
            <div>
              <div style={{ fontSize: 12, color: '#a0a0a0', marginBottom: 4 }}>机器人适配器</div>
              <Select style={{ width: '100%' }} size="small" value={selectedAdapters['robot'] || undefined} placeholder="选择机器人适配器"
                onChange={(v) => handleAdapterChange('robot', v)}
                options={adapters.filter(a => a.type === '机器人适配器').map(a => ({ value: a.name, label: a.name }))} />
            </div>
          </Card>

          {/* ROI成本量化 */}
          {roi && (
            <Card title={<span><FundOutlined style={{ marginRight: 6 }} />ROI成本量化</span>} style={{ marginBottom: 16 }}>
              <Row gutter={[8, 8]}>
                <Col span={12}>
                  <div style={{ background: '#1a1a1a', borderRadius: 8, padding: 12, textAlign: 'center' }}>
                    <div style={{ fontSize: 11, color: '#a0a0a0' }}>传统方式</div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: '#ff4d4f' }}>¥{(roi.manualCost / 10000).toFixed(0)}万</div>
                    <div style={{ fontSize: 11, color: '#a0a0a0' }}>{roi.manualDays}天 · {roi.manualEngineers}</div>
                  </div>
                </Col>
                <Col span={12}>
                  <div style={{ background: '#1a1a1a', borderRadius: 8, padding: 12, textAlign: 'center' }}>
                    <div style={{ fontSize: 11, color: '#a0a0a0' }}>平台适配</div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: '#52c41a' }}>¥{(roi.platformCost / 10000).toFixed(0)}万</div>
                    <div style={{ fontSize: 11, color: '#a0a0a0' }}>{roi.platformDays}天 · {roi.platformEngineers}</div>
                  </div>
                </Col>
              </Row>
              <div style={{ marginTop: 8, padding: '8px 12px', background: 'rgba(82, 196, 26, 0.1)', borderRadius: 8, textAlign: 'center' }}>
                <span style={{ fontSize: 13, color: '#52c41a', fontWeight: 600 }}>
                  累计节省 ¥{(roi.totalSavedCost / 10000).toFixed(0)}万 · 周期缩短 {roi.cycleReduction}% · 模板复用率 {roi.templateReuseRate}%
                </span>
              </div>
            </Card>
          )}
        </Col>
      </Row>

      {/* 底部：适配模板库 + 适配历史 */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col span={12}>
          <Card title={<span><ApartmentOutlined style={{ marginRight: 6 }} />适配模板库</span>}
            extra={<Button size="small" type="primary" icon={<PlusOutlined />} onClick={() => setTemplateWizardOpen(true)}>创建模板</Button>}>
            <Table dataSource={templates} columns={templateColumns} rowKey="id" size="small" pagination={false} />
          </Card>
        </Col>
        <Col span={12}>
          <Card title={<span><HistoryOutlined style={{ marginRight: 6 }} />适配历史</span>}
            extra={
              <div style={{ display: 'flex', gap: 8 }}>
                <Tag color={historyTab === 'timeline' ? 'blue' : 'default'} style={{ cursor: 'pointer' }} onClick={() => setHistoryTab('timeline')}>时间线</Tag>
                <Tag color={historyTab === 'analysis' ? 'blue' : 'default'} style={{ cursor: 'pointer' }} onClick={() => setHistoryTab('analysis')}>智能分析</Tag>
              </div>
            }>
            {historyTab === 'timeline' ? (
              <div className="timeline" style={{ maxHeight: 300, overflow: 'auto' }}>
                {history.map((item, index) => (
                  <div key={index} className={`timeline-item ${item.result}`}>
                    <div style={{ fontSize: 12, color: '#a0a0a0' }}>{item.date}</div>
                    <div style={{ fontSize: 13, marginTop: 2 }}>
                      {item.modelName} → {item.targetFactory}
                      <Tag color={item.result === 'success' ? 'success' : 'error'} style={{ marginLeft: 8 }}>{item.result === 'success' ? '成功' : '失败'}</Tag>
                    </div>
                    <div style={{ fontSize: 12, color: '#a0a0a0', marginTop: 2 }}>
                      耗时: {item.duration}
                      {item.failReason && <span style={{ color: '#ff4d4f', marginLeft: 8 }}>原因: {item.failReason}</span>}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div>
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 13, color: '#a0a0a0', marginBottom: 8 }}>适配成功率趋势</div>
                  <ReactEChartsCore option={{
                    tooltip: { trigger: 'axis' },
                    grid: { left: 40, right: 10, top: 10, bottom: 20 },
                    xAxis: { type: 'category', data: ['11月', '12月', '1月', '2月', '3月'], axisLabel: { color: '#a0a0a0', fontSize: 10 } },
                    yAxis: { type: 'value', min: 60, max: 100, axisLabel: { color: '#a0a0a0', fontSize: 10 }, splitLine: { lineStyle: { color: '#1a1a1a' } } },
                    series: [{ type: 'line', smooth: true, data: [75, 82, 88, 85, 92], lineStyle: { color: '#52c41a', width: 2 }, areaStyle: { color: 'rgba(82, 196, 26, 0.1)' }, symbol: 'circle', symbolSize: 4 }],
                  }} style={{ height: 120 }} />
                </div>
                <div>
                  <div style={{ fontSize: 13, color: '#a0a0a0', marginBottom: 8 }}>硬件品牌使用频率</div>
                  <ReactEChartsCore option={{
                    tooltip: { trigger: 'item' },
                    series: [{
                      type: 'pie', radius: ['40%', '70%'],
                      data: [
                        { value: 8, name: '海康威视', itemStyle: { color: '#1677ff' } },
                        { value: 6, name: '西门子', itemStyle: { color: '#52c41a' } },
                        { value: 4, name: 'ABB', itemStyle: { color: '#722ed1' } },
                        { value: 3, name: 'Basler', itemStyle: { color: '#faad14' } },
                        { value: 2, name: '三菱', itemStyle: { color: '#ff4d4f' } },
                        { value: 2, name: '发那科', itemStyle: { color: '#eb2f96' } },
                      ],
                      label: { color: '#a0a0a0', fontSize: 10 },
                    }]
                  }} style={{ height: 160 }} />
                </div>
              </div>
            )}
          </Card>
        </Col>
      </Row>

      {/* 模板创建向导弹窗 */}
      <Modal title="创建适配模板" open={templateWizardOpen} onCancel={() => { setTemplateWizardOpen(false); setTemplateStep(0); }}
        footer={[
          <Button key="back" onClick={() => { if (templateStep > 0) setTemplateStep(templateStep - 1); else { setTemplateWizardOpen(false); setTemplateStep(0); } }}>
            {templateStep > 0 ? '上一步' : '取消'}
          </Button>,
          <Button key="next" type="primary" onClick={handleTemplateNext}>
            {templateStep < 3 ? '下一步' : '完成创建'}
          </Button>,
        ]}>
        <Steps current={templateStep} size="small" style={{ marginBottom: 16 }}
          items={[
            { title: '基本信息', description: '名称和场景' },
            { title: '硬件配置', description: '硬件组合' },
            { title: '协议配置', description: '通信协议' },
            { title: '完成', description: '确认保存' },
          ]} />
        {templateStep === 0 && (
          <div>
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 13, color: '#a0a0a0', marginBottom: 4 }}>模板名称 *</div>
              <Select style={{ width: '100%' }} value={templateForm.name || undefined} placeholder="请输入模板名称"
                onChange={(v) => setTemplateForm({ ...templateForm, name: v })}
                options={['焊接视觉检测模板', '装配精度检测模板', '表面缺陷检测模板', '综合质检模板'].map(n => ({ value: n, label: n }))} />
            </div>
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 13, color: '#a0a0a0', marginBottom: 4 }}>适用场景</div>
              <Select style={{ width: '100%' }} value={templateForm.scene || undefined} placeholder="选择适用场景"
                onChange={(v) => setTemplateForm({ ...templateForm, scene: v })}
                options={['焊接车间', '装配线', '打磨车间', '质检线'].map(s => ({ value: s, label: s }))} />
            </div>
          </div>
        )}
        {templateStep === 1 && (
          <div>
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 13, color: '#a0a0a0', marginBottom: 4 }}>相机品牌</div>
              <Select style={{ width: '100%' }} value={templateForm.hardware || undefined} placeholder="选择相机品牌"
                onChange={(v) => setTemplateForm({ ...templateForm, hardware: v })}
                options={['海康威视', 'Basler', '基恩士'].map(h => ({ value: h, label: h }))} />
            </div>
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 13, color: '#a0a0a0', marginBottom: 4 }}>PLC品牌</div>
              <Select style={{ width: '100%' }} placeholder="选择PLC品牌"
                options={['西门子', '三菱', '欧姆龙'].map(h => ({ value: h, label: h }))} />
            </div>
            <div>
              <div style={{ fontSize: 13, color: '#a0a0a0', marginBottom: 4 }}>机器人品牌</div>
              <Select style={{ width: '100%' }} placeholder="选择机器人品牌"
                options={['ABB', '发那科', '库卡'].map(h => ({ value: h, label: h }))} />
            </div>
          </div>
        )}
        {templateStep === 2 && (
          <div>
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 13, color: '#a0a0a0', marginBottom: 4 }}>主协议</div>
              <Select style={{ width: '100%' }} value={templateForm.protocol || undefined} placeholder="选择主协议"
                onChange={(v) => setTemplateForm({ ...templateForm, protocol: v })}
                options={['OPC UA', 'Profinet', 'Modbus TCP', 'EtherCAT'].map(p => ({ value: p, label: p }))} />
            </div>
            <div>
              <div style={{ fontSize: 13, color: '#a0a0a0', marginBottom: 4 }}>备选协议</div>
              <Select style={{ width: '100%' }} placeholder="选择备选协议"
                options={['OPC UA', 'Profinet', 'Modbus TCP', 'EtherCAT'].map(p => ({ value: p, label: p }))} />
            </div>
          </div>
        )}
        {templateStep === 3 && (
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <CheckCircleOutlined style={{ fontSize: 48, color: '#52c41a', marginBottom: 16 }} />
            <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>确认模板信息</div>
            <div style={{ color: '#a0a0a0', fontSize: 13 }}>
              <div>名称: {templateForm.name}</div>
              <div>场景: {templateForm.scene}</div>
              <div>协议: {templateForm.protocol}</div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
