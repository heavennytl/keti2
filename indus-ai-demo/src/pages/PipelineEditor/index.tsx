import { Card, Row, Col, Statistic, Table, Tag, Button } from 'antd';
import { ApartmentOutlined } from '@ant-design/icons';

const pipelines = [
  { key: '1', name: '焊接质量检测链', nodes: 5, status: 'running', models: ['WeldDetect-v2', 'DefectClassify-v1'], latency: 120, throughput: 85 },
  { key: '2', name: '装配精度检测链', nodes: 4, status: 'running', models: ['AssemblyCheck-v1', 'AlignCheck-v2'], latency: 95, throughput: 110 },
  { key: '3', name: '表面缺陷检测链', nodes: 6, status: 'stopped', models: ['SurfaceDefect-v3', 'PolishingCheck-v1'], latency: 0, throughput: 0 },
  { key: '4', name: '综合质检链', nodes: 7, status: 'running', models: ['QualityCheck-v2', 'DimensionCheck-v1', 'AppearanceCheck-v2'], latency: 180, throughput: 55 },
];

const templates = [
  { key: '1', name: '视觉检测标准链', nodes: ['图像采集', '预处理', 'AI推理', '结果判定', '输出'], description: '适用于通用视觉检测场景' },
  { key: '2', name: '多模型融合链', nodes: ['图像采集', '模型A推理', '模型B推理', '融合分析', '结果输出'], description: '适用于多模型协同推理场景' },
  { key: '3', name: '端到端质检链', nodes: ['信号采集', '预处理', 'AI推理', '逻辑判定', '执行控制', '结果反馈'], description: '适用于完整质检流程' },
];

export default function PipelineEditor() {
  return (
    <div>
      <Row gutter={[16, 16]}>
        <Col span={4}><Card><Statistic title="推理链总数" value={6} /></Card></Col>
        <Col span={4}><Card><Statistic title="运行中" value={3} valueStyle={{ color: '#52c41a' }} /></Card></Col>
        <Col span={4}><Card><Statistic title="总节点数" value={32} /></Card></Col>
        <Col span={4}><Card><Statistic title="平均延迟" value={132} suffix="ms" /></Card></Col>
        <Col span={4}><Card><Statistic title="总吞吐量" value={250} suffix="FPS" /></Card></Col>
        <Col span={4}>
          <Card>
            <Statistic title="操作" />
            <Button type="primary" icon={<ApartmentOutlined />} style={{ marginTop: 8 }}>新建推理链</Button>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col span={16}>
          <Card title="推理链列表">
            <Table
              dataSource={pipelines}
              columns={[
                { title: '推理链名称', dataIndex: 'name', key: 'name' },
                { title: '节点数', dataIndex: 'nodes', key: 'nodes' },
                { title: '状态', dataIndex: 'status', key: 'status', render: (s: string) => (
                  <Tag color={s === 'running' ? 'success' : 'default'}>{s === 'running' ? '运行中' : '已停止'}</Tag>
                )},
                { title: '包含模型', dataIndex: 'models', key: 'models', render: (models: string[]) => models.map(m => <Tag key={m} style={{ marginBottom: 2 }}>{m}</Tag>) },
                { title: '延迟(ms)', dataIndex: 'latency', key: 'latency', render: (v: number) => v > 0 ? v : '-' },
                { title: '吞吐量(FPS)', dataIndex: 'throughput', key: 'throughput', render: (v: number) => v > 0 ? v : '-' },
                { title: '操作', key: 'action', render: () => <Button type="link" size="small">编辑</Button> },
              ]}
              rowKey="key"
              size="small"
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card title="推理链模板">
            {templates.map(t => (
              <div key={t.key} style={{
                border: '1px solid #303030',
                borderRadius: 8,
                padding: 12,
                marginBottom: 12,
                background: '#1a1a1a',
              }}>
                <div style={{ fontWeight: 600, marginBottom: 4 }}>{t.name}</div>
                <div style={{ fontSize: 12, color: '#a0a0a0', marginBottom: 8 }}>{t.description}</div>
                <div style={{ fontSize: 12, color: '#a0a0a0', marginBottom: 8 }}>
                  节点: {t.nodes.join(' → ')}
                </div>
                <Button size="small" type="primary">使用模板</Button>
              </div>
            ))}
          </Card>
        </Col>
      </Row>
    </div>
  );
}
