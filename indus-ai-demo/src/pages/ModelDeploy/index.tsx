import { Card, Row, Col, Statistic, Table, Tag, Button, Progress } from 'antd';
import { CloudUploadOutlined } from '@ant-design/icons';

const deployTasks = [
  { key: '1', model: 'WeldDetect-v2', target: '焊接车间-A线', status: '部署中', progress: 65, strategy: '灰度发布', replicas: 3 },
  { key: '2', model: 'AssemblyCheck-v1', target: '装配线-B线', status: '已部署', progress: 100, strategy: '全量发布', replicas: 5 },
  { key: '3', model: 'SurfaceDefect-v3', target: '打磨车间-C线', status: '待部署', progress: 0, strategy: '蓝绿部署', replicas: 2 },
  { key: '4', model: 'QualityCheck-v2', target: '质检线-D线', status: '已部署', progress: 100, strategy: '全量发布', replicas: 4 },
];

const statusColors: Record<string, string> = {
  '部署中': 'processing',
  '已部署': 'success',
  '待部署': 'default',
};

export default function ModelDeploy() {
  return (
    <div>
      <Row gutter={[16, 16]}>
        <Col span={4}><Card><Statistic title="待部署模型" value={3} /></Card></Col>
        <Col span={4}><Card><Statistic title="已部署模型" value={15} /></Card></Col>
        <Col span={4}><Card><Statistic title="部署成功率" value={98} suffix="%" valueStyle={{ color: '#52c41a' }} /></Card></Col>
        <Col span={4}><Card><Statistic title="运行中实例" value={42} /></Card></Col>
        <Col span={4}><Card><Statistic title="平均部署时长" value={1.5} suffix="分钟" /></Card></Col>
        <Col span={4}>
          <Card>
            <Statistic title="操作" />
            <Button type="primary" icon={<CloudUploadOutlined />} style={{ marginTop: 8 }}>新建部署</Button>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col span={24}>
          <Card title="部署任务列表">
            <Table
              dataSource={deployTasks}
              columns={[
                { title: '模型名称', dataIndex: 'model', key: 'model' },
                { title: '目标节点', dataIndex: 'target', key: 'target' },
                { title: '状态', dataIndex: 'status', key: 'status', render: (s: string) => <Tag color={statusColors[s]}>{s}</Tag> },
                { title: '进度', dataIndex: 'progress', key: 'progress', render: (p: number) => <Progress percent={p} size="small" /> },
                { title: '部署策略', dataIndex: 'strategy', key: 'strategy' },
                { title: '副本数', dataIndex: 'replicas', key: 'replicas' },
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
