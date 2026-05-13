import { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Table, Tag, Button, Progress, Tooltip, Modal, Descriptions } from 'antd';
import { SwapOutlined, CloudUploadOutlined, PlayCircleOutlined, PauseCircleOutlined, ApartmentOutlined, ThunderboltOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useModelDeployStore } from '@/stores/useModelDeployStore';
import ReactEChartsCore from 'echarts-for-react';
import LoadingState from '@/components/LoadingState';
import ErrorState from '@/components/ErrorState';

// 适配信息数据
const adaptInfoMap: Record<string, { adapted: boolean; score: number; adaptDate: string; adapters: string[]; targetNode: string }> = {
  'WeldDetect-v2': { adapted: true, score: 94, adaptDate: '2024-05-10', adapters: ['HikVision-CAM-v2', 'Siemens-S7-v1', 'ABB-IRB-v3'], targetNode: '焊接车间-A线' },
  'AssemblyCheck-v1': { adapted: true, score: 92, adaptDate: '2024-05-08', adapters: ['Basler-CAM-v1', 'Mitsubishi-FX-v2'], targetNode: '装配线-B线' },
  'SurfaceDefect-v3': { adapted: false, score: 65, adaptDate: '-', adapters: [], targetNode: '打磨车间-C线' },
  'QualityCheck-v2': { adapted: true, score: 88, adaptDate: '2024-05-07', adapters: ['HikVision-CAM-v2', 'Siemens-S7-v1'], targetNode: '质检线-D线' },
};

// 部署拓扑节点
const deployTopoNodes = [
  { id: 'model-1', label: 'WeldDetect-v2\n已适配 ✓', x: 100, y: 80, status: 'adapted', color: '#52c41a' },
  { id: 'model-2', label: 'AssemblyCheck-v1\n已适配 ✓', x: 280, y: 80, status: 'adapted', color: '#52c41a' },
  { id: 'model-3', label: 'SurfaceDefect-v3\n未适配 ⚠', x: 460, y: 80, status: 'unadapted', color: '#faad14' },
  { id: 'model-4', label: 'QualityCheck-v2\n已适配 ✓', x: 640, y: 80, status: 'adapted', color: '#52c41a' },
  { id: 'edge-1', label: '焊接车间-A线\n部署中...', x: 100, y: 260, status: 'deploying', color: '#1677ff' },
  { id: 'edge-2', label: '装配线-B线\n已部署 ✓', x: 280, y: 260, status: 'deployed', color: '#52c41a' },
  { id: 'edge-3', label: '打磨车间-C线\n待部署', x: 460, y: 260, status: 'pending', color: '#faad14' },
  { id: 'edge-4', label: '质检线-D线\n已部署 ✓', x: 640, y: 260, status: 'deployed', color: '#52c41a' },
];

const deployTopoEdges = [
  { source: 'model-1', target: 'edge-1', label: '灰度发布(3副本)' },
  { source: 'model-2', target: 'edge-2', label: '全量发布(5副本)' },
  { source: 'model-3', target: 'edge-3', label: '蓝绿部署(2副本)' },
  { source: 'model-4', target: 'edge-4', label: '全量发布(4副本)' },
];

export default function ModelDeploy() {
  const navigate = useNavigate();
  const { tasks, loading, error, fetchTasks } = useModelDeployStore();
  const [adaptModal, setAdaptModal] = useState<string | null>(null);
  const [animOffset, setAnimOffset] = useState(0);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  useEffect(() => {
    const interval = setInterval(() => setAnimOffset(prev => (prev + 1) % 100), 50);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <LoadingState tip="加载部署任务数据..." fullPage />;
  if (error) return <ErrorState message={error} onRetry={fetchTasks} />;

  const deploying = tasks.filter(t => t.status === '部署中');
  const deployed = tasks.filter(t => t.status === '已部署');
  const pending = tasks.filter(t => t.status === '待部署');

  return (
    <div>
      <Row gutter={[16, 16]}>
        <Col span={4}><Card><Statistic title="部署任务数" value={tasks.length} /></Card></Col>
        <Col span={4}><Card><Statistic title="部署中" value={deploying.length} valueStyle={{ color: '#1677ff' }} /></Card></Col>
        <Col span={4}><Card><Statistic title="已部署" value={deployed.length} valueStyle={{ color: '#52c41a' }} /></Card></Col>
        <Col span={4}><Card><Statistic title="待部署" value={pending.length} valueStyle={{ color: '#faad14' }} /></Card></Col>
        <Col span={4}><Card><Statistic title="部署成功率" value={95} suffix="%" valueStyle={{ color: '#52c41a' }} /></Card></Col>
        <Col span={4}>
          <Card>
            <Statistic title="操作" />
            <Button type="primary" icon={<CloudUploadOutlined />} style={{ marginTop: 8 }}>新建部署</Button>
          </Card>
        </Col>
      </Row>

      {/* 部署拓扑图 */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col span={24}>
          <Card title={<span><ApartmentOutlined style={{ marginRight: 6 }} />部署拓扑图</span>}
            extra={
              <Button size="small" icon={<SwapOutlined />} onClick={() => navigate('/model-adapt')}>
                适配关联
              </Button>
            }>
            <svg width="100%" height="320" viewBox="0 0 800 320" style={{ background: '#0d0d0d', borderRadius: 8 }}>
              <defs>
                <marker id="deployArrow" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
                  <polygon points="0 0, 8 3, 0 6" fill="#434343" />
                </marker>
              </defs>
              <text x="400" y="30" textAnchor="middle" fill="#434343" fontSize="12" fontWeight="600">📦 模型层</text>
              <text x="400" y="210" textAnchor="middle" fill="#434343" fontSize="12" fontWeight="600">🖥️ 部署目标层</text>
              {deployTopoEdges.map((edge, i) => {
                const source = deployTopoNodes.find(n => n.id === edge.source);
                const target = deployTopoNodes.find(n => n.id === edge.target);
                if (!source || !target) return null;
                const dx = target.x - source.x;
                const dy = target.y - source.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                const offsetX = (dx / dist) * 20;
                const offsetY = (dy / dist) * 20;
                const progress = ((animOffset + i * 25) % 100) / 100;
                const flowX = source.x + offsetX + dx * progress;
                const flowY = source.y + offsetY + dy * progress;
                return (
                  <g key={`edge-${i}`}>
                    <line x1={source.x + offsetX} y1={source.y + offsetY} x2={target.x - offsetX} y2={target.y - offsetY} stroke="#303030" strokeWidth="1.5" markerEnd="url(#deployArrow)" />
                    <text x={(source.x + target.x) / 2} y={(source.y + target.y) / 2 - 8} textAnchor="middle" fill="#434343" fontSize="10">{edge.label}</text>
                    <circle cx={flowX} cy={flowY} r="3" fill="#1677ff" opacity="0.8">
                      <animate attributeName="opacity" values="0.8;0.2;0.8" dur="1.5s" repeatCount="indefinite" />
                    </circle>
                  </g>
                );
              })}
              {deployTopoNodes.map(node => (
                <g key={node.id} style={{ cursor: 'pointer' }}
                  onClick={() => {
                    const modelName = node.label.split('\n')[0];
                    if (adaptInfoMap[modelName]) setAdaptModal(modelName);
                  }}>
                  <rect x={node.x - 55} y={node.y - 22} width={110} height={44} rx="8"
                    fill={`${node.color}15`} stroke={node.color} strokeWidth={1.5} />
                  {node.label.split('\n').map((line, i) => (
                    <text key={i} x={node.x} y={node.y - 4 + i * 16} textAnchor="middle"
                      fill={node.status === 'pending' ? '#666' : '#e5e5e5'} fontSize="11" fontWeight={i === 0 ? 600 : 400}>
                      {line}
                    </text>
                  ))}
                </g>
              ))}
            </svg>
            <div style={{ marginTop: 8, display: 'flex', gap: 16, fontSize: 12, color: '#a0a0a0', justifyContent: 'center' }}>
              <span><span style={{ color: '#52c41a' }}>●</span> 已适配/已部署</span>
              <span><span style={{ color: '#faad14' }}>●</span> 未适配/待部署</span>
              <span><span style={{ color: '#1677ff' }}>●</span> 部署中</span>
              <span style={{ color: '#666' }}>点击模型查看适配信息</span>
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col span={24}>
          <Card title="部署任务列表" extra={
            <Button size="small" icon={<SwapOutlined />} onClick={() => navigate('/model-adapt')}>
              适配关联
            </Button>
          }>
            <Table
              dataSource={tasks}
              columns={[
                { title: '模型', dataIndex: 'model', key: 'model' },
                { title: '目标节点', dataIndex: 'target', key: 'target' },
                {
                  title: '状态', dataIndex: 'status', key: 'status',
                  render: (s: string) => {
                    const colorMap: Record<string, string> = { '部署中': 'processing', '已部署': 'success', '待部署': 'default' };
                    return <Tag color={colorMap[s] || 'default'}>{s}</Tag>;
                  },
                },
                {
                  title: '进度', dataIndex: 'progress', key: 'progress',
                  render: (p: number) => <Progress percent={p} size="small" strokeColor={p === 100 ? '#52c41a' : '#1677ff'} />,
                },
                { title: '部署策略', dataIndex: 'strategy', key: 'strategy' },
                { title: '副本数', dataIndex: 'replicas', key: 'replicas' },
                {
                  title: '适配信息', key: 'adapt', render: (_: any, record: typeof tasks[0]) => {
                    const info = adaptInfoMap[record.model];
                    return info ? (
                      <Tooltip title={`适配评分: ${info.score}%`}>
                        <Tag color={info.adapted ? 'success' : 'warning'} style={{ cursor: 'pointer' }}
                          onClick={() => setAdaptModal(record.model)}>
                          {info.adapted ? '已适配' : '未适配'} {info.score}%
                        </Tag>
                      </Tooltip>
                    ) : <Tag color="default">未知</Tag>;
                  },
                },
                {
                  title: '操作', key: 'action', render: (_: any, record: typeof tasks[0]) => (
                    <div style={{ display: 'flex', gap: 4 }}>
                      {record.status === '待部署' && (
                        <Button type="link" size="small" icon={<PlayCircleOutlined />}>部署</Button>
                      )}
                      {record.status === '部署中' && (
                        <Button type="link" size="small" icon={<PauseCircleOutlined />}>暂停</Button>
                      )}
                      <Button type="link" size="small" icon={<SwapOutlined />} onClick={() => navigate('/model-adapt')}>
                        适配
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

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col span={12}>
          <Card title="部署状态分布">
            <ReactEChartsCore option={{
              tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
              series: [{
                type: 'pie',
                radius: ['40%', '70%'],
                center: ['50%', '50%'],
                data: [
                  { value: deploying.length, name: '部署中', itemStyle: { color: '#1677ff' } },
                  { value: deployed.length, name: '已部署', itemStyle: { color: '#52c41a' } },
                  { value: pending.length, name: '待部署', itemStyle: { color: '#faad14' } },
                ],
                label: { color: '#a0a0a0', fontSize: 12 },
                labelLine: { lineStyle: { color: '#434343' } },
              }],
            }} style={{ height: 300 }} />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="部署策略分布">
            <ReactEChartsCore option={{
              tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
              series: [{
                type: 'pie',
                radius: ['40%', '70%'],
                center: ['50%', '50%'],
                data: [
                  { value: tasks.filter(t => t.strategy === '灰度发布').length, name: '灰度发布', itemStyle: { color: '#1677ff' } },
                  { value: tasks.filter(t => t.strategy === '全量发布').length, name: '全量发布', itemStyle: { color: '#52c41a' } },
                  { value: tasks.filter(t => t.strategy === '蓝绿部署').length, name: '蓝绿部署', itemStyle: { color: '#722ed1' } },
                ],
                label: { color: '#a0a0a0', fontSize: 12 },
                labelLine: { lineStyle: { color: '#434343' } },
              }],
            }} style={{ height: 300 }} />
          </Card>
        </Col>
      </Row>

      {/* 适配信息弹窗 */}
      <Modal title={`${adaptModal} - 适配信息`} open={!!adaptModal} onCancel={() => setAdaptModal(null)}
        footer={[
          <Button key="close" onClick={() => setAdaptModal(null)}>关闭</Button>,
          <Button key="adapt" type="primary" icon={<SwapOutlined />} onClick={() => { setAdaptModal(null); navigate('/model-adapt'); }}>
            前往适配中心
          </Button>,
        ]} width={480}>
        {adaptModal && adaptInfoMap[adaptModal] && (
          <div>
            <Descriptions column={2} size="small" style={{ marginBottom: 16 }}>
              <Descriptions.Item label="模型名称">{adaptModal}</Descriptions.Item>
              <Descriptions.Item label="适配状态">
                {adaptInfoMap[adaptModal].adapted
                  ? <Tag color="success" icon={<CheckCircleOutlined />}>已适配</Tag>
                  : <Tag color="warning" icon={<CloseCircleOutlined />}>未适配</Tag>}
              </Descriptions.Item>
              <Descriptions.Item label="适配评分">
                <Progress percent={adaptInfoMap[adaptModal].score} size="small" format={(p) => `${p}%`}
                  strokeColor={adaptInfoMap[adaptModal].score >= 85 ? '#52c41a' : adaptInfoMap[adaptModal].score >= 70 ? '#faad14' : '#ff4d4f'} />
              </Descriptions.Item>
              <Descriptions.Item label="适配日期">{adaptInfoMap[adaptModal].adaptDate}</Descriptions.Item>
              <Descriptions.Item label="目标节点">{adaptInfoMap[adaptModal].targetNode}</Descriptions.Item>
              <Descriptions.Item label="适配器数量">{adaptInfoMap[adaptModal].adapters.length}个</Descriptions.Item>
            </Descriptions>
            <div style={{ fontWeight: 600, marginBottom: 8, color: '#a0a0a0' }}>已选适配器</div>
            {adaptInfoMap[adaptModal].adapters.map((adapter, i) => (
              <Tag key={i} color="blue" style={{ marginBottom: 4 }}>{adapter}</Tag>
            ))}
            {!adaptInfoMap[adaptModal].adapted && (
              <div style={{ marginTop: 12, padding: '8px 12px', background: 'rgba(250, 173, 20, 0.1)', borderRadius: 8, fontSize: 13, color: '#faad14' }}>
                <ThunderboltOutlined style={{ marginRight: 4 }} />该模型尚未完成适配，建议先前往适配中心完成适配后再部署
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
