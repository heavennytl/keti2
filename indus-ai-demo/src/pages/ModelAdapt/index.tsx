import { useEffect } from 'react';
import { Card, Row, Col, Statistic, Table, Tag, Button, Select, Progress } from 'antd';
import { PlusOutlined, DownloadOutlined, RollbackOutlined } from '@ant-design/icons';
import { useModelAdaptStore } from '@/stores/useModelAdaptStore';

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

export default function ModelAdapt() {
  const {
    tasks, templates, adapters, history, comparison,
    fetchTasks, fetchTemplates, fetchAdapters, fetchHistory, fetchComparison,
    setCurrentTask, currentTask,
  } = useModelAdaptStore();

  useEffect(() => {
    fetchTasks();
    fetchTemplates();
    fetchAdapters();
    fetchHistory();
    fetchComparison('1');
  }, []);

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
                onClick: () => setCurrentTask(record),
                style: { cursor: 'pointer' },
              })}
            />
          </Card>
        </Col>

        {/* 中间：适配工作流 + 对比视图 */}
        <Col span={10}>
          {/* 适配工作流 */}
          <Card title="适配工作流" style={{ marginBottom: 16 }}>
            <div style={{ marginBottom: 12, display: 'flex', gap: 8, alignItems: 'center' }}>
              <span style={{ color: '#a0a0a0', fontSize: 13 }}>适配模式：</span>
              <Tag color="blue">自动适配（推荐）</Tag>
              <Tag style={{ cursor: 'pointer' }}>手动引导适配</Tag>
            </div>
            <div className="step-flow">
              {adaptSteps.map((step, index) => {
                const stepNum = index + 1;
                const isActive = currentTask?.currentStep === stepNum;
                const isCompleted = (currentTask?.currentStep ?? 0) > stepNum;
                const isError = currentTask?.status === '失败' && currentTask?.currentStep === stepNum;
                return (
                  <div
                    key={step.key}
                    className={`step-item ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''} ${isError ? 'error' : ''}`}
                  >
                    <div className="step-number">{stepNum}</div>
                    <div className="step-content">
                      <div style={{ fontWeight: 600, marginBottom: 4 }}>{step.title}</div>
                      <div style={{ fontSize: 12, color: '#a0a0a0' }}>{step.description}</div>
                      {isActive && currentTask?.mode === 'manual' && (
                        <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
                          <Button size="small" icon={<RollbackOutlined />}>回退</Button>
                          <Button size="small" type="primary">确认</Button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* 适配对比视图 */}
          <Card title="适配前后效果对比">
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
                    <td>{comparison.accuracyBefore}%</td>
                    <td style={{ color: '#52c41a' }}>{comparison.accuracyAfter}%</td>
                    <td className="improvement">↑ {((comparison.accuracyAfter - comparison.accuracyBefore) / comparison.accuracyBefore * 100).toFixed(1)}%</td>
                  </tr>
                  <tr>
                    <td>推理延迟</td>
                    <td>{comparison.latencyBefore}ms</td>
                    <td style={{ color: '#52c41a' }}>{comparison.latencyAfter}ms</td>
                    <td className="improvement">↓ {((comparison.latencyBefore - comparison.latencyAfter) / comparison.latencyBefore * 100).toFixed(1)}%</td>
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
            <div style={{ marginTop: 12, textAlign: 'right' }}>
              <Button icon={<DownloadOutlined />} size="small">导出适配报告</Button>
            </div>
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
