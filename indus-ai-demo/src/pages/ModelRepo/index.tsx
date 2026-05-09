import { Card, Row, Col, Statistic, Table, Tag, Button, Input } from 'antd';
import { SearchOutlined, UploadOutlined } from '@ant-design/icons';

const models = [
  { key: '1', name: 'WeldDetect-v2', type: '视觉检测', framework: 'PyTorch', version: 'v2.1', size: '256MB', status: '已适配', adaptTarget: '焊接车间-A线', deployNode: '焊接车间-A线' },
  { key: '2', name: 'AssemblyCheck-v1', type: '视觉检测', framework: 'TensorFlow', version: 'v1.3', size: '180MB', status: '已适配', adaptTarget: '装配线-B线', deployNode: '装配线-B线' },
  { key: '3', name: 'SurfaceDefect-v3', type: '缺陷识别', framework: 'PyTorch', version: 'v3.0', size: '320MB', status: '适配中', adaptTarget: '打磨车间-C线', deployNode: '-' },
  { key: '4', name: 'QualityCheck-v2', type: '工艺决策', framework: 'ONNX', version: 'v2.0', size: '150MB', status: '未适配', adaptTarget: '-', deployNode: '-' },
  { key: '5', name: 'DefectClassify-v1', type: '缺陷识别', framework: 'PyTorch', version: 'v1.2', size: '210MB', status: '已适配', adaptTarget: '焊接车间-A线', deployNode: '焊接车间-A线' },
  { key: '6', name: 'AlignCheck-v2', type: '视觉检测', framework: 'TensorFlow', version: 'v2.0', size: '195MB', status: '已适配', adaptTarget: '装配线-B线', deployNode: '装配线-B线' },
];

const statusColors: Record<string, string> = {
  '已适配': 'success',
  '适配中': 'processing',
  '未适配': 'default',
  '失败': 'error',
};

export default function ModelRepo() {
  return (
    <div>
      <Row gutter={[16, 16]}>
        <Col span={4}><Card><Statistic title="模型总数" value={24} /></Card></Col>
        <Col span={4}><Card><Statistic title="已适配" value={16} valueStyle={{ color: '#52c41a' }} /></Card></Col>
        <Col span={4}><Card><Statistic title="适配中" value={3} valueStyle={{ color: '#1677ff' }} /></Card></Col>
        <Col span={4}><Card><Statistic title="未适配" value={5} /></Card></Col>
        <Col span={4}><Card><Statistic title="总模型大小" value="4.8" suffix="GB" /></Card></Col>
        <Col span={4}>
          <Card>
            <Statistic title="操作" />
            <Button type="primary" icon={<UploadOutlined />} style={{ marginTop: 8 }}>上传模型</Button>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col span={24}>
          <Card
            title="模型列表"
            extra={
              <Input
                prefix={<SearchOutlined />}
                placeholder="搜索模型名称..."
                style={{ width: 240 }}
                size="small"
              />
            }
          >
            <Table
              dataSource={models}
              columns={[
                { title: '模型名称', dataIndex: 'name', key: 'name' },
                { title: '类型', dataIndex: 'type', key: 'type', render: (t: string) => <Tag>{t}</Tag> },
                { title: '框架', dataIndex: 'framework', key: 'framework' },
                { title: '版本', dataIndex: 'version', key: 'version' },
                { title: '大小', dataIndex: 'size', key: 'size' },
                { title: '适配状态', dataIndex: 'status', key: 'status', render: (s: string) => <Tag color={statusColors[s]}>{s}</Tag> },
                { title: '适配目标', dataIndex: 'adaptTarget', key: 'adaptTarget' },
                { title: '部署节点', dataIndex: 'deployNode', key: 'deployNode' },
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
