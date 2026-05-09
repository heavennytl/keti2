import { Card, Row, Col, Statistic, Table, Tag, Badge } from 'antd';
import { useSceneStore } from '@/stores/useSceneStore';

const alerts = [
  { key: '1', time: '14:23:05', level: 'error', message: '焊接车间-A线 GPU温度过高(87°C)', node: '焊接车间-A线', status: '未处理' },
  { key: '2', time: '14:20:12', level: 'warning', message: '装配线-B线 推理延迟异常(152ms)', node: '装配线-B线', status: '处理中' },
  { key: '3', time: '14:15:33', level: 'warning', message: '打磨车间-C线 模型精度下降(72%)', node: '打磨车间-C线', status: '已忽略' },
  { key: '4', time: '14:10:00', level: 'info', message: '质检线-D线 模型部署完成', node: '质检线-D线', status: '已处理' },
  { key: '5', time: '14:05:22', level: 'error', message: '焊接车间-A线 节点离线', node: '焊接车间-A线', status: '未处理' },
];

const metrics = [
  { key: '1', node: '焊接车间-A线', cpu: 78, gpu: 92, memory: 65, latency: 85, throughput: 120, status: 'warning' },
  { key: '2', node: '装配线-B线', cpu: 45, gpu: 67, memory: 52, latency: 62, throughput: 95, status: 'online' },
  { key: '3', node: '打磨车间-C线', cpu: 32, gpu: 45, memory: 38, latency: 48, throughput: 78, status: 'online' },
  { key: '4', node: '质检线-D线', cpu: 55, gpu: 72, memory: 58, latency: 55, throughput: 88, status: 'online' },
];

export default function Monitor() {
  const { config } = useSceneStore();

  return (
    <div>
      <Row gutter={[16, 16]}>
        <Col span={4}><Card><Statistic title="当前告警" value={config.alertFrequency} valueStyle={{ color: config.alertFrequency > 0 ? '#ff4d4f' : '#52c41a' }} /></Card></Col>
        <Col span={4}><Card><Statistic title="未处理告警" value={2} valueStyle={{ color: '#ff4d4f' }} /></Card></Col>
        <Col span={4}><Card><Statistic title="GPU平均利用率" value={config.gpuUsage.max} suffix="%" /></Card></Col>
        <Col span={4}><Card><Statistic title="平均延迟" value={config.latency.max} suffix="ms" /></Card></Col>
        <Col span={4}><Card><Statistic title="在线节点" value={config.nodeOffline ? 3 : 4} valueStyle={{ color: config.nodeOffline ? '#faad14' : '#52c41a' }} /></Card></Col>
        <Col span={4}><Card><Statistic title="总吞吐量" value={381} suffix="FPS" /></Card></Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col span={16}>
          <Card title="节点运行指标">
            <Table
              dataSource={metrics}
              columns={[
                { title: '节点', dataIndex: 'node', key: 'node' },
                { title: 'CPU(%)', dataIndex: 'cpu', key: 'cpu', render: (v: number) => (
                  <span style={{ color: v > 80 ? '#ff4d4f' : v > 60 ? '#faad14' : '#52c41a' }}>{v}%</span>
                )},
                { title: 'GPU(%)', dataIndex: 'gpu', key: 'gpu', render: (v: number) => (
                  <span style={{ color: v > 80 ? '#ff4d4f' : v > 60 ? '#faad14' : '#52c41a' }}>{v}%</span>
                )},
                { title: '内存(%)', dataIndex: 'memory', key: 'memory' },
                { title: '延迟(ms)', dataIndex: 'latency', key: 'latency' },
                { title: '吞吐量(FPS)', dataIndex: 'throughput', key: 'throughput' },
                { title: '状态', dataIndex: 'status', key: 'status', render: (s: string) => (
                  <span className={`status-dot ${s}`} />
                )},
              ]}
              rowKey="key"
              size="small"
              pagination={false}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card title="实时告警列表">
            {alerts.slice(0, 5).map(a => (
              <div key={a.key} style={{
                padding: '8px 0',
                borderBottom: '1px solid #303030',
                display: 'flex',
                gap: 8,
                alignItems: 'flex-start',
              }}>
                <Badge status={a.level === 'error' ? 'error' : a.level === 'warning' ? 'warning' : 'processing'} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, color: '#a0a0a0' }}>{a.time}</div>
                  <div style={{ fontSize: 13, color: a.level === 'error' ? '#ff4d4f' : a.level === 'warning' ? '#faad14' : '#e5e5e5' }}>
                    {a.message}
                  </div>
                  <div style={{ fontSize: 12, color: '#a0a0a0', marginTop: 2 }}>
                  {a.node} · <Tag>{a.status}</Tag>
                  </div>
                </div>
              </div>
            ))}
          </Card>
        </Col>
      </Row>
    </div>
  );
}
