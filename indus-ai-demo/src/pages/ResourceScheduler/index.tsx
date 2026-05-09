import { Card, Row, Col, Statistic, Table, Tag, Select } from 'antd';

const strategies = [
  { key: '1', name: '负载均衡优先', description: '均衡分配推理任务到各节点', active: true, latency: 65, gpuLoad: 72, energy: 85, throughput: 320 },
  { key: '2', name: '时延优先', description: '优先分配到延迟最低的节点', active: false, latency: 35, gpuLoad: 88, energy: 92, throughput: 280 },
  { key: '3', name: '能耗优先', description: '优先分配到能耗最低的节点', active: false, latency: 95, gpuLoad: 55, energy: 45, throughput: 210 },
  { key: '4', name: '成本优先', description: '优先分配到运行成本最低的节点', active: false, latency: 80, gpuLoad: 65, energy: 60, throughput: 250 },
];

const nodeLoads = [
  { key: '1', node: '焊接车间-A线', cpu: 78, gpu: 92, memory: 65, tasks: 5, strategy: '负载均衡' },
  { key: '2', node: '装配线-B线', cpu: 45, gpu: 67, memory: 52, tasks: 3, strategy: '时延优先' },
  { key: '3', node: '打磨车间-C线', cpu: 32, gpu: 45, memory: 38, tasks: 2, strategy: '能耗优先' },
  { key: '4', node: '质检线-D线', cpu: 55, gpu: 72, memory: 58, tasks: 4, strategy: '负载均衡' },
];

export default function ResourceScheduler() {
  return (
    <div>
      <Row gutter={[16, 16]}>
        <Col span={4}><Card><Statistic title="当前策略" value="负载均衡" /></Card></Col>
        <Col span={4}><Card><Statistic title="平均延迟" value={65} suffix="ms" /></Card></Col>
        <Col span={4}><Card><Statistic title="GPU平均负载" value={72} suffix="%" /></Card></Col>
        <Col span={4}><Card><Statistic title="总能耗" value={85} suffix="kWh" /></Card></Col>
        <Col span={4}><Card><Statistic title="总吞吐量" value={320} suffix="FPS" /></Card></Col>
        <Col span={4}>
          <Card>
            <Statistic title="调度策略" />
            <Select defaultValue="负载均衡优先" size="small" style={{ width: 140, marginTop: 8 }}>
              <Select.Option value="负载均衡优先">负载均衡优先</Select.Option>
              <Select.Option value="时延优先">时延优先</Select.Option>
              <Select.Option value="能耗优先">能耗优先</Select.Option>
              <Select.Option value="成本优先">成本优先</Select.Option>
            </Select>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col span={12}>
          <Card title="调度策略对比">
            <table className="comparison-table">
              <thead>
                <tr>
                  <th>策略</th>
                  <th>延迟(ms)</th>
                  <th>GPU负载(%)</th>
                  <th>能耗(kWh)</th>
                  <th>吞吐量(FPS)</th>
                </tr>
              </thead>
              <tbody>
                {strategies.map(s => (
                  <tr key={s.key} style={{ background: s.active ? 'rgba(22, 119, 255, 0.05)' : 'transparent' }}>
                    <td>
                      {s.name}
                      {s.active && <Tag color="blue" style={{ marginLeft: 8 }}>当前</Tag>}
                    </td>
                    <td>{s.latency}</td>
                    <td>{s.gpuLoad}%</td>
                    <td>{s.energy}</td>
                    <td>{s.throughput}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </Col>
        <Col span={12}>
          <Card title="节点负载分布">
            <Table
              dataSource={nodeLoads}
              columns={[
                { title: '节点', dataIndex: 'node', key: 'node' },
                { title: 'CPU(%)', dataIndex: 'cpu', key: 'cpu' },
                { title: 'GPU(%)', dataIndex: 'gpu', key: 'gpu', render: (v: number) => (
                  <span style={{ color: v > 80 ? '#ff4d4f' : v > 60 ? '#faad14' : '#52c41a' }}>{v}%</span>
                )},
                { title: '内存(%)', dataIndex: 'memory', key: 'memory' },
                { title: '任务数', dataIndex: 'tasks', key: 'tasks' },
                { title: '调度策略', dataIndex: 'strategy', key: 'strategy' },
              ]}
              rowKey="key"
              size="small"
              pagination={false}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
