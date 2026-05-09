import { Card, Row, Col, Statistic, Table, Tag, Button } from 'antd';

const engines = [
  { key: '1', name: 'TensorRT', version: '8.6', type: 'GPU加速', status: 'running', models: 8, throughput: 1250, latency: 45 },
  { key: '2', name: 'OpenVINO', version: '2024.1', type: 'CPU优化', status: 'running', models: 5, throughput: 880, latency: 62 },
  { key: '3', name: 'ONNX Runtime', version: '1.17', type: '跨平台', status: 'running', models: 6, throughput: 960, latency: 55 },
  { key: '4', name: 'TFLite', version: '2.14', type: '边缘端', status: 'stopped', models: 2, throughput: 0, latency: 0 },
];

export default function InferenceEngine() {
  return (
    <div>
      <Row gutter={[16, 16]}>
        <Col span={4}><Card><Statistic title="推理引擎数" value={4} /></Card></Col>
        <Col span={4}><Card><Statistic title="运行中引擎" value={3} valueStyle={{ color: '#52c41a' }} /></Card></Col>
        <Col span={4}><Card><Statistic title="总吞吐量" value={3090} suffix="FPS" /></Card></Col>
        <Col span={4}><Card><Statistic title="平均延迟" value={54} suffix="ms" /></Card></Col>
        <Col span={4}><Card><Statistic title="GPU利用率" value={67} suffix="%" /></Card></Col>
        <Col span={4}><Card><Statistic title="CPU利用率" value={42} suffix="%" /></Card></Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col span={24}>
          <Card title="推理引擎列表">
            <Table
              dataSource={engines}
              columns={[
                { title: '引擎名称', dataIndex: 'name', key: 'name' },
                { title: '版本', dataIndex: 'version', key: 'version' },
                { title: '类型', dataIndex: 'type', key: 'type' },
                { title: '状态', dataIndex: 'status', key: 'status', render: (s: string) => (
                  <Tag color={s === 'running' ? 'success' : 'default'}>{s === 'running' ? '运行中' : '已停止'}</Tag>
                )},
                { title: '承载模型数', dataIndex: 'models', key: 'models' },
                { title: '吞吐量(FPS)', dataIndex: 'throughput', key: 'throughput', render: (v: number) => v > 0 ? v : '-' },
                { title: '延迟(ms)', dataIndex: 'latency', key: 'latency', render: (v: number) => v > 0 ? v : '-' },
                { title: '操作', key: 'action', render: () => <Button type="link" size="small">详情</Button> },
              ]}
              rowKey="key"
              size="small"
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
