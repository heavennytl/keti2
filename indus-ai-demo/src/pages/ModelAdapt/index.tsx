import { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Row, Col, Statistic, Table, Tag, Button, Select, Progress, message } from 'antd';
import { PlusOutlined, DownloadOutlined, RollbackOutlined, CaretRightOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useModelAdaptStore } from '@/stores/useModelAdaptStore';
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
  1: {
    label: '环境检测',
    items: [
      '检测到目标产线：焊接车间-A线',
      '检测到硬件：海康相机 + 西门子PLC + ABB机器人',
      '检测到协议：OPC UA',
      '环境条件：低光照、高噪声',
    ],
  },
  2: {
    label: '兼容性评估',
    items: [
      '硬件兼容性：92%',
      '协议兼容性：100%',
      '环境适配难度：中等',
      '总体评估：推荐适配',
    ],
  },
  3: {
    label: '适配配置',
    items: [
      '自动选择适配器：HikVision-CAM-v2',
      '自动选择适配器：Siemens-S7-v1',
      '自动选择适配器：ABB-IRB-v3',
      '协议参数已自动配置',
      '环境补偿：低光照增强 + 中值滤波',
    ],
  },
  4: {
    label: '适配执行',
    items: [
      '[INFO] 硬件适配器加载完成',
      '[INFO] 协议参数配置完成',
      '[INFO] 环境补偿参数配置完成',
      '[INFO] 适配完成！耗时：45秒',
    ],
  },
  5: {
    label: '适配验证',
    items: [
      '适配前精度：72% → 适配后精度：94%',
      '适配前延迟：180ms → 适配后延迟：65ms',
      '结论：适配成功 ✓',
    ],
  },
};

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export default function ModelAdapt() {
  const navigate = useNavigate();
  const {
    tasks, templates, adapters, history, comparison,
    fetchTasks, fetchTemplates, fetchAdapters, fetchHistory, fetchComparison,
    setCurrentTask, currentTask, executeTask, rollbackTask,
  } = useModelAdaptStore();

  const [isAdapting, setIsAdapting] = useState(false);
  const [adaptLogs, setAdaptLogs] = useState<string[]>([]);
  const [adaptProgress, setAdaptProgress] = useState(0);
  const [adaptComplete, setAdaptComplete] = useState(false);
  const [mode, setMode] = useState<'auto' | 'manual'>('auto');
  const [manualStep, setManualStep] = useState(0);
  const [showComparison, setShowComparison] = useState(false);
  const [animatingValues, setAnimatingValues] = useState({
    accuracyBefore: 72,
    accuracyAfter: 72,
    latencyBefore: 180,
    latencyAfter: 180,
  });

  // 使用 ref 跟踪当前任务，避免闭包问题
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
  }, []);

  const resetAdapt = useCallback(() => {
    setIsAdapting(false);
    setAdaptLogs([]);
    setAdaptProgress(0);
    setAdaptComplete(false);
    setManualStep(0);
    setShowComparison(false);
    setAnimatingValues({
      accuracyBefore: 72,
      accuracyAfter: 72,
      latencyBefore: 180,
      latencyAfter: 180,
    });
  }, []);

  const startAdapt = useCallback(async () => {
    const task = currentTaskRef.current;
    if (!task) {
      message.warning('请先选择一个适配任务');
      return;
    }
    if (isAdaptingRef.current) return;

    resetAdapt();
    setIsAdapting(true);
    executeTask(task.id);

    for (let step = 1; step <= 5; step++) {
      setCurrentTask({ ...task, currentStep: step, status: '进行中' as const });

      // 添加日志
      const stepInfo = stepDetails[step];
      setAdaptLogs((prev) => [...prev, `[INFO] 开始${stepInfo.label}...`]);

      // 模拟步骤执行时间
      const stepTime = step === 3 ? 1500 : step === 5 ? 1500 : 2000;
      const stepStartTime = Date.now();
      while (Date.now() - stepStartTime < stepTime) {
        const elapsed = Date.now() - stepStartTime;
        const stepProgress = Math.min(100, Math.round((elapsed / stepTime) * 100));
        setAdaptProgress(Math.min(100, Math.round((step - 1) * 20 + stepProgress * 0.2)));
        await delay(50);
      }

      // 步骤完成，添加详情日志
      stepInfo.items.forEach((item) => {
        setAdaptLogs((prev) => [...prev, `  ${item}`]);
      });
      setAdaptLogs((prev) => [...prev, `[INFO] ${stepInfo.label}完成 ✓`]);
      setAdaptProgress(step * 20);

      // 手动模式：等待用户确认
      if (modeRef.current === 'manual' && step < 5) {
        setManualStep(step);
        await new Promise<void>((resolve) => {
          const interval = setInterval(() => {
            if (manualStepRef.current !== step) {
              clearInterval(interval);
              resolve();
            }
          }, 100);
        });
      }
    }

    // 适配完成
    setAdaptComplete(true);
    setAdaptProgress(100);
    setCurrentTask({ ...task, status: '已完成', progress: 100, currentStep: 5 });
    setShowComparison(true);

    // 动画展示对比数据
    const targetValues = {
      accuracyAfter: 94,
      latencyAfter: 65,
    };
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
    setAnimatingValues({
      accuracyBefore: 72,
      accuracyAfter: 94,
      latencyBefore: 180,
      latencyAfter: 65,
    });

    setIsAdapting(false);
    message.success('适配完成！');
  }, [executeTask, setCurrentTask, resetAdapt]);

  const handleManualConfirm = useCallback(() => {
    setManualStep((prev) => prev + 1);
  }, []);

  const handleManualRollback = useCallback(() => {
    const task = currentTaskRef.current;
    if (task) {
      rollbackTask(task.id);
      setCurrentTask({ ...task, currentStep: Math.max(0, task.currentStep - 1) });
      setManualStep((prev) => Math.max(1, prev - 1));
    }
  }, [rollbackTask, setCurrentTask]);

  const goToDeploy = useCallback(() => {
    navigate('/model-deploy?adaptedModel=WeldDetect-v2');
  }, [navigate]);

  const taskColumns = [
    { title: '模型名称', dataIndex: 'modelName', key: 'modelName' },
    { title: '目标工厂', dataIndex: 'targetFactory', key: 'targetFactory' },
    {
      title: '适配状态', dataIndex: 'status', key: 'status',
      render: (status: string) => <Tag color={statusColors[status]}>{status}</Tag>,
    },
    {
      title: '兼容性评分', dataIndex: 'compatibilityScore', key: 'compatibilityScore',
      render: (score: number) => (
        <Progress percent={score} size="small" format={(p) => `${p}%`} />
      ),
    },
    {
      title: '进度', dataIndex: 'progress', key: 'progress',
      render: (progress: number) => <Progress percent={progress} size="small" />,
    },
    { title: '负责人', dataIndex: 'assignee', key: 'assignee' },
    {
      title: '操作', key: 'action',
      render: (_: unknown, record: AdaptTask) => (
        <Button
          type="primary"
          size="small"
          icon={<CaretRightOutlined />}
          disabled={isAdapting || record.status === '已完成'}
          onClick={(e) => {
            e.stopPropagation();
            setCurrentTask(record);
            setTimeout(() => startAdapt(), 100);
          }}
        >
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
    {
      title: '成功率', dataIndex: 'successRate', key: 'successRate',
      render: (rate: number) => <span style={{ color: rate >= 90 ? '#52c41a' : '#faad14' }}>{rate}%</span>,
    },
    {
      title: '操作', key: 'action',
      render: () => <Button type="link" size="small">一键应用</Button>,
    },
  ];

  const adapterColumns = [
    { title: '适配器名称', dataIndex: 'name', key: 'name' },
    { title: '类型', dataIndex: 'type', key: 'type' },
    { title: '适用品牌', dataIndex: 'brand', key: 'brand' },
    { title: '版本', dataIndex: 'version', key: 'version' },
    { title: '使用次数', dataIndex: 'useCount', key: 'useCount' },
  ];

  return (
    <div>
      {/* 顶部：适配概览 */}
      <Row gutter={[16, 16]}>
        <Col span={4}>
          <Card><Statistic title="待适配模型" value={5} /></Card>
        </Col>
        <Col span={4}>
          <Card><Statistic title="已完成适配" value={12} /></Card>
        </Col>
        <Col span={4}>
          <Card><Statistic title="适配成功率" value={92} suffix="%" valueStyle={{ color: '#52c41a' }} /></Card>
        </Col>
        <Col span={4}>
          <Card><Statistic title="平均适配周期" value={2.3} suffix="天" /></Card>
        </Col>
        <Col span={4}>
          <Card><Statistic title="适配模板数" value={8} /></Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic title="操作" />
            <Button type="primary" icon={<PlusOutlined />} style={{ marginTop: 8 }}>
              新建适配任务
            </Button>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        {/* 左侧：适配任务列表 */}
        <Col span={8}>
          <Card
            title="适配任务列表"
            extra={
              <Select defaultValue="all" size="small" style={{ width: 120 }}>
                <Select.Option value="all">全部状态</Select.Option>
                <Select.Option value="进行中">进行中</Select.Option>
                <Select.Option value="已完成">已完成</Select.Option>
                <Select.Option value="失败">失败</Select.Option>
              </Select>
            }
          >
            <Table
              dataSource={tasks}
              columns={taskColumns}
              rowKey="id"
              size="small"
              pagination={false}
              onRow={(record) => ({
                onClick: () => {
                  if (!isAdapting) {
                    setCurrentTask(record);
                    resetAdapt();
                  }
                },
                style: {
                  cursor: 'pointer',
                  background: currentTask?.id === record.id ? 'rgba(22, 119, 255, 0.08)' : undefined,
                },
              })}
            />
          </Card>
        </Col>

        {/* 中间：适配工作流 + 对比视图 */}
        <Col span={10}>
          {/* 适配工作流 */}
          <Card
            title="适配工作流"
            extra={
              !adaptComplete && currentTask && currentTask.status !== '已完成' ? (
                <Button
                  type="primary"
                  icon={<CaretRightOutlined />}
                  onClick={startAdapt}
                  loading={isAdapting}
                  disabled={isAdapting || !currentTask}
                >
                  {isAdapting ? '适配中...' : '一键适配'}
                </Button>
              ) : null
            }
          >
            <div style={{ marginBottom: 12, display: 'flex', gap: 8, alignItems: 'center' }}>
              <span style={{ color: '#a0a0a0', fontSize: 13 }}>适配模式：</span>
              <Tag
                color={mode === 'auto' ? 'blue' : 'default'}
                style={{ cursor: 'pointer' }}
                onClick={() => !isAdapting && setMode('auto')}
              >
                自动适配（推荐）
              </Tag>
              <Tag
                color={mode === 'manual' ? 'blue' : 'default'}
                style={{ cursor: 'pointer' }}
                onClick={() => !isAdapting && setMode('manual')}
              >
                手动引导适配
              </Tag>
            </div>

            {/* 适配进度条 */}
            {isAdapting && (
              <div style={{ marginBottom: 12 }}>
                <Progress percent={adaptProgress} size="small" />
              </div>
            )}

            <div className="step-flow">
              {adaptSteps.map((step, index) => {
                const stepNum = index + 1;
                const isActive = currentTask?.currentStep === stepNum && isAdapting;
                const isCompleted = (currentTask?.currentStep ?? 0) > stepNum || (adaptComplete && stepNum <= 5);
                const isError = currentTask?.status === '失败' && currentTask?.currentStep === stepNum;
                return (
                  <div
                    key={step.key}
                    className={`step-item ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''} ${isError ? 'error' : ''}`}
                  >
                    <div className="step-number">
                      {isCompleted ? '✓' : stepNum}
                    </div>
                    <div className="step-content">
                      <div style={{ fontWeight: 600, marginBottom: 4 }}>
                        {step.title}
                        {isActive && <Tag color="blue" style={{ marginLeft: 8, fontSize: 11 }}>执行中...</Tag>}
                        {isCompleted && !isActive && <Tag color="success" style={{ marginLeft: 8, fontSize: 11 }}>已完成</Tag>}
                      </div>
                      <div style={{ fontSize: 12, color: '#a0a0a0' }}>{step.description}</div>

                      {/* 步骤详情 */}
                      {isActive && isAdapting && stepDetails[stepNum] && (
                        <div style={{ marginTop: 8, padding: 8, background: 'rgba(22, 119, 255, 0.05)', borderRadius: 4 }}>
                          {stepDetails[stepNum].items.map((item, i) => (
                            <div key={i} style={{ fontSize: 12, color: '#e5e5e5', marginBottom: 2 }}>
                              {item}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* 手动模式确认/回退按钮 */}
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

            {/* 适配日志 */}
            {adaptLogs.length > 0 && (
              <div style={{
                marginTop: 12,
                padding: 8,
                background: '#0d0d0d',
                borderRadius: 4,
                maxHeight: 120,
                overflow: 'auto',
                fontFamily: 'monospace',
                fontSize: 12,
              }}>
                {adaptLogs.map((log, i) => (
                  <div key={i} style={{
                    color: log.includes('✓') ? '#52c41a' : log.includes('ERROR') ? '#ff4d4f' : '#a0a0a0',
                    marginBottom: 2,
                  }}>
                    {log}
                  </div>
                ))}
              </div>
            )}

            {/* 适配完成后的操作按钮 */}
            {adaptComplete && (
              <div style={{ marginTop: 16, display: 'flex', gap: 12, justifyContent: 'center' }}>
                <Button icon={<DownloadOutlined />}>导出适配报告</Button>
                <Button type="primary" icon={<CaretRightOutlined />} onClick={goToDeploy}>
                  前往部署
                </Button>
              </div>
            )}
          </Card>

          {/* 适配对比视图 */}
          <Card
            title="适配前后效果对比"
            style={{ marginTop: 16 }}
            extra={
              adaptComplete && (
                <Tag color="success" style={{ fontSize: 13, padding: '2px 12px' }}>
                  <CheckCircleOutlined /> 适配成功
                </Tag>
              )
            }
          >
            {comparison && (
              <table className="comparison-table">
                <thead>
                  <tr>
                    <th>对比项</th>
                    <th>适配前</th>
                    <th>适配后</th>
                    <th>优化幅度</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>模型精度</td>
                    <td style={{ color: '#ff4d4f' }}>{animatingValues.accuracyBefore}%</td>
                    <td style={{ color: '#52c41a', fontWeight: showComparison ? 700 : 400 }}>
                      {animatingValues.accuracyAfter}%
                    </td>
                    <td className="improvement">
                      {showComparison ? `↑ ${((94 - 72) / 72 * 100).toFixed(1)}%` : '-'}
                    </td>
                  </tr>
                  <tr>
                    <td>推理延迟</td>
                    <td style={{ color: '#ff4d4f' }}>{animatingValues.latencyBefore}ms</td>
                    <td style={{ color: '#52c41a', fontWeight: showComparison ? 700 : 400 }}>
                      {animatingValues.latencyAfter}ms
                    </td>
                    <td className="improvement">
                      {showComparison ? `↓ ${((180 - 65) / 180 * 100).toFixed(1)}%` : '-'}
                    </td>
                  </tr>
                  <tr>
                    <td>硬件兼容性</td>
                    <td style={{ color: '#ff4d4f' }}>{comparison.hardwareCompatibleBefore}</td>
                    <td style={{ color: '#52c41a' }}>{comparison.hardwareCompatibleAfter}</td>
                    <td className="improvement">✅</td>
                  </tr>
                  <tr>
                    <td>协议适配</td>
                    <td style={{ color: '#ff4d4f' }}>{comparison.protocolBefore}</td>
                    <td style={{ color: '#52c41a' }}>{comparison.protocolAfter}</td>
                    <td className="improvement">✅</td>
                  </tr>
                </tbody>
              </table>
            )}
          </Card>
        </Col>

        {/* 右侧：适配方案推荐 */}
        <Col span={6}>
          <Card title="推荐适配方案" style={{ marginBottom: 16 }}>
            <div style={{
              border: '1px solid #303030',
              borderRadius: 8,
              padding: 16,
              background: '#1a1a1a',
            }}>
              <div style={{ fontSize: 16, fontWeight: 600, color: '#1677ff', marginBottom: 12 }}>
                推荐适配方案 v3.2
              </div>
              <div style={{ marginBottom: 12 }}>
                <div style={{ color: '#a0a0a0', fontSize: 12, marginBottom: 4 }}>硬件适配：</div>
                <div style={{ fontSize: 13 }}>├─ 相机适配器: HikVision-CAM-v2</div>
                <div style={{ fontSize: 13 }}>├─ PLC适配器: Siemens-S7-v1</div>
                <div style={{ fontSize: 13 }}>└─ 机器人适配器: ABB-IRB-v3</div>
              </div>
              <div style={{ marginBottom: 12 }}>
                <div style={{ color: '#a0a0a0', fontSize: 12, marginBottom: 4 }}>协议适配：</div>
                <div style={{ fontSize: 13 }}>├─ 主协议: OPC UA</div>
                <div style={{ fontSize: 13 }}>└─ 备选协议: Modbus TCP</div>
              </div>
              <div style={{ marginBottom: 12 }}>
                <div style={{ color: '#a0a0a0', fontSize: 12, marginBottom: 4 }}>环境补偿：</div>
                <div style={{ fontSize: 13 }}>├─ 图像增强: 低光照模式</div>
                <div style={{ fontSize: 13 }}>├─ 降噪滤波: 中值滤波 3x3</div>
                <div style={{ fontSize: 13 }}>└─ 精度校准: 自动校准</div>
              </div>
              <div style={{ fontSize: 12, color: '#a0a0a0', marginBottom: 12 }}>
                预估适配周期: 2天 | 预估成功率: 92%
              </div>
              <Button type="primary" block>一键应用适配方案</Button>
            </div>
          </Card>

          {/* 适配器市场 */}
          <Card title="适配器市场" style={{ marginBottom: 16 }}>
            <Table
              dataSource={adapters}
              columns={adapterColumns}
              rowKey="id"
              size="small"
              pagination={false}
            />
          </Card>
        </Col>
      </Row>

      {/* 底部：适配模板库 + 适配历史 */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col span={12}>
          <Card title="适配模板库">
            <Table
              dataSource={templates}
              columns={templateColumns}
              rowKey="id"
              size="small"
              pagination={false}
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="适配历史时间线">
            <div className="timeline">
              {history.map((item, index) => (
                <div key={index} className={`timeline-item ${item.result}`}>
                  <div style={{ fontSize: 12, color: '#a0a0a0' }}>{item.date}</div>
                  <div style={{ fontSize: 13, marginTop: 2 }}>
                    {item.modelName} → {item.targetFactory}
                    <Tag color={item.result === 'success' ? 'success' : 'error'} style={{ marginLeft: 8 }}>
                      {item.result === 'success' ? '成功' : '失败'}
                    </Tag>
                  </div>
                  <div style={{ fontSize: 12, color: '#a0a0a0', marginTop: 2 }}>
                    耗时: {item.duration}
                    {item.failReason && <span style={{ color: '#ff4d4f', marginLeft: 8 }}>原因: {item.failReason}</span>}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
