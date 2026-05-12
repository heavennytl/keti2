import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, Row, Col, Statistic, Table, Tag, Badge, Button } from 'antd';
import { WarningOutlined, CaretRightOutlined } from '@ant-design/icons';
import { useSceneStore } from '@/stores/useSceneStore';

const baseAlerts = [
  { key: '1', time: '14:23:05', level: 'error', message: '焊接车间-A线 GPU温度过高(87°C)', node: '焊接车间-A线', status: '未处理' },
  { key: '2', time: '14:20:12', level: 'warning', message: '装配线-B线 推理延迟异常(152ms)', node: '装配线-B线', status: '处理中' },
  { key: '3', time: '14:15:33', level: 'warning', message: '打磨车间-C线 模型精度下降(72%)', node: '打磨车间-C线', status: '已忽略' },
  { key: '4', time: '14:10:00', level: 'info', message: '质检线-D线 模型部署完成', node: '质检线-D线', status: '已处理' },
  { key: '5', time: '14:05:22', level: 'error', message: '焊接车间-A线 节点离线', node: '焊接车间-A线', status: '未处理' },
];

const baseMetrics = [
  { key: '1', node: '焊接车间-A线', cpu: 78, gpu: 92, memory: 65, latency: 85, throughput: 120, status: 'warning' },
  { key: '2', node: '装配线-B线', cpu: 45, gpu: 67, memory: 52, latency: 62, throughput: 95, status: 'online' },
  { key: '3', node: '打磨车间-C线', cpu: 32, gpu: 45, memory: 38, latency: 48, throughput: 78, status: 'online' },
  { key: '4', node: '质检线-D线', cpu: 55, gpu: 72, memory: 58, latency: 55, throughput: 88, status: 'online' },
];

const highLoadAlerts = [
  { key: '1', time: '14:23:05', level: 'error', message: '焊接车间-A线 GPU温度过高(87°C)', node: '焊接车间-A线', status: '未处理' },
  { key: '2', time: '14:22:30', level: 'warning', message: '焊接车间-A线 推理延迟异常(152ms)', node: '焊接车间-A线', status: '未处理' },
  { key: '3', time: '14:20:12', level: 'warning', message: '装配线-B线 推理延迟异常(142ms)', node: '装配线-B线', status: '处理中' },
  { key: '4', time: '14:18:00', level: 'error', message: '焊接车间-A线 GPU负载超过95%', node: '焊接车间-A线', status: '未处理' },
  { key: '5', time: '14:15:33', level: 'warning', message: '打磨车间-C线 模型精度下降(72%)', node: '打磨车间-C线', status: '已忽略' },
  { key: '6', time: '14:10:00', level: 'info', message: '质检线-D线 模型部署完成', node: '质检线-D线', status: '已处理' },
  { key: '7', time: '14:05:22', level: 'error', message: '焊接车间-A线 节点离线', node: '焊接车间-A线', status: '未处理' },
];

const highLoadMetrics = [
  { key: '1', node: '焊接车间-A线', cpu: 92, gpu: 97, memory: 85, latency: 152, throughput: 65, status: 'warning' },
  { key: '2', node: '装配线-B线', cpu: 78, gpu: 88, memory: 72, latency: 142, throughput: 75, status: 'warning' },
  { key: '3', node: '打磨车间-C线', cpu: 45, gpu: 55, memory: 42, latency: 58, throughput: 68, status: 'online' },
  { key: '4', node: '质检线-D线', cpu: 65, gpu: 78, memory: 62, latency: 75, throughput: 82, status: 'online' },
];

const faultAlerts = [
  { key: '1', time: '14:23:05', level: 'error', message: '焊接车间-A线 GPU温度过高(87°C)', node: '焊接车间-A线', status: '未处理' },
  { key: '2', time: '14:22:30', level: 'error', message: '焊接车间-A线 推理服务异常', node: '焊接车间-A线', status: '未处理' },
  { key: '3', time: '14:20:12', level: 'error', message: '焊接车间-A线 节点离线', node: '焊接车间-A线', status: '未处理' },
  { key: '4', time: '14:18:00', level: 'error', message: '装配线-B线 推理延迟异常(235ms)', node: '装配线-B线', status: '未处理' },
  { key: '5', time: '14:15:33', level: 'warning', message: '打磨车间-C线 模型精度下降(65%)', node: '打磨车间-C线', status: '未处理' },
  { key: '6', time: '14:10:00', level: 'error', message: '质检线-D线 推理服务异常', node: '质检线-D线', status: '未处理' },
  { key: '7', time: '14:05:22', level: 'error', message: '焊接车间-A线 节点离线', node: '焊接车间-A线', status: '未处理' },
  { key: '8', time: '14:00:00', level: 'error', message: '系统检测到多个节点异常', node: '系统', status: '未处理' },
];

const faultMetrics = [
  { key: '1', node: '焊接车间-A线', cpu: 0, gpu: 0, memory: 0, latency: 0, throughput: 0, status: 'offline' },
  { key: '2', node: '装配线-B线', cpu: 85, gpu: 92, memory: 78, latency: 235, throughput: 35, status: 'warning' },
  { key: '3', node: '打磨车间-C线', cpu: 38, gpu: 48, memory: 35, latency: 55, throughput: 45, status: 'online' },
  { key: '4', node: '质检线-D线', cpu: 72, gpu: 82, memory: 68, latency: 180, throughput: 42, status: 'warning' },
];

export default function Monitor() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { mode } = useSceneStore();
  const deployedModel = searchParams.get('deployedModel');

  const alerts = mode === 'highLoad' ? highLoadAlerts : mode === 'fault' ? faultAlerts : baseAlerts;
  const metrics = mode === 'highLoad' ? highLoadMetrics : mode === 'fault' ? faultMetrics : baseMetrics;

  const handleAlertAction = (alert: typeof baseAlerts[0]) => {
    navigate(`/resource-scheduler?alert=${encodeURIComponent(alert.node)}`);
  };

  return (
    <div>
      <Row gutter={[16, 16]}>
        <Col span={4}>
          <Card>
            <Statistic title="当前告警" value={alerts.filter(a => a.status === '未处理').length}
              valueStyle={{ color: alerts.filter(a => a.status === '未处理').length > 0 ? '#ff4d4f' : '#52c41a' }} />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic title="未处理告警" value={alerts.filter(a => a.status === '未处理').length} valueStyle={{ color: '#ff4d4f' }} />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic title="GPU平均利用率" value={Math.round(metrics.reduce((sum, m) => sum + m.gpu, 0) / metrics.length)} suffix="%"
              valueStyle={{ color: metrics.some(m => m.gpu > 80) ? '#ff4d4f' : metrics.some(m => m.gpu > 60) ? '#faad14' : '#52c41a' }} />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic title="平均延迟" value={Math.round(metrics.reduce((sum, m) => sum + m.latency, 0) / metrics.length)} suffix="ms"
              valueStyle={{ color: metrics.some(m => m.latency > 100) ? '#ff4d4f' : '#52c41a' }} />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic title="在线节点" value={metrics.filter(m => m.status !== 'offline').length} suffix={`/ ${metrics.length}`}
              valueStyle={{ color: metrics.some(m => m.status === 'offline') ? '#faad14' : '#52c41a' }} />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic title="总吞吐量" value={metrics.reduce((sum, m) => sum + m.throughput, 0)} suffix="FPS" />
          </Card>
        </Col>
      </Row>

      {deployedModel && (
        <Card style={{ marginTop: 16, borderLeft: '3px solid #52c41a' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 15, fontWeight: 600 }}>{deployedModel}</span>
            <Tag color="success">已部署</Tag>
            <span style={{ color: '#a0a0a0', fontSize: 13 }}>已成功部署，正在运行中</span>
          </div>
        </Card>
      )}

      {mode === 'highLoad' && (
        <Card style={{ marginTop: 16, borderLeft: '3px solid #faad14', background: 'rgba(250, 173, 20, 0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <WarningOutlined style={{ color: '#faad14', fontSize: 18 }} />
            <span style={{ color: '#faad14', fontWeight: 600 }}>高负载模式</span>
            <span style={{ color: '#a0a0a0', fontSize: 13 }}>GPU 负载过高，建议前往资源调度中心调整策略</span>
            <Button size="small" type="primary" onClick={() => navigate('/resource-scheduler?alert=焊接车间-A线')}>前往处理</Button>
          </div>
        </Card>
      )}

      {mode === 'fault' && (
        <Card style={{ marginTop: 16, borderLeft: '3px solid #ff4d4f', background: 'rgba(255, 77, 79, 0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <WarningOutlined style={{ color: '#ff4d4f', fontSize: 18 }} />
            <span style={{ color: '#ff4d4f', fontWeight: 600 }}>故障模式</span>
            <span style={{ color: '#a0a0a0', fontSize: 13 }}>多个节点异常，请立即处理</span>
            <Button size="small" type="primary" danger onClick={() => navigate('/resource-scheduler?alert=焊接车间-A线')}>紧急处理</Button>
          </div>
        </Card>
      )}

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
                { title: '延迟(ms)', dataIndex: 'latency', key: 'latency', render: (v: number) => (
                  <span style={{ color: v > 100 ? '#ff4d4f' : v > 60 ? '#faad14' : '#52c41a' }}>{v}ms</span>
                )},
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
          <Card title="实时告警列表" extra={
            alerts.filter(a => a.status === '未处理').length > 0 && (
              <Tag color="error">{alerts.filter(a => a.status === '未处理').length} 条未处理</Tag>
            )
          }>
            {alerts.slice(0, 7).map(a => (
              <div key={a.key} style={{ padding: '8px 0', borderBottom: '1px solid #303030', display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                <Badge status={a.level === 'error' ? 'error' : a.level === 'warning' ? 'warning' : 'processing'} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, color: '#a0a0a0' }}>{a.time}</div>
                  <div style={{ fontSize: 13, color: a.level === 'error' ? '#ff4d4f' : a.level === 'warning' ? '#faad14' : '#e5e5e5' }}>{a.message}</div>
                  <div style={{ fontSize: 12, color: '#a0a0a0', marginTop: 2, display: 'flex', gap: 8, alignItems: 'center' }}>
                    {a.node} · <Tag>{a.status}</Tag>
                    {a.status === '未处理' && (
                      <Button type="link" size="small" icon={<CaretRightOutlined />} onClick={() => handleAlertAction(a)}>处理</Button>
                    )}
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
