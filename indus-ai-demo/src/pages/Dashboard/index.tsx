import { Card, Row, Col, Statistic } from 'antd';
import { useSceneStore } from '@/stores/useSceneStore';

export default function Dashboard() {
  const { config } = useSceneStore();

  return (
    <div>
      <Row gutter={[16, 16]}>
        <Col span={4}>
          <Card>
            <Statistic title="当前场景" value="焊接车间" />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic title="在线模型数" value={26} />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic title="在线节点数" value={18} />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic title="当前告警数" value={config.alertFrequency} valueStyle={{ color: config.alertFrequency > 0 ? '#ff4d4f' : '#52c41a' }} />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic title="适配完成数" value={12} />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic title="适配健康度" value={config.adaptQuality.max} suffix="%" valueStyle={{ color: '#1677ff' }} />
          </Card>
        </Col>
      </Row>
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col span={24}>
          <Card title="端边云拓扑图">
            <div style={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a0a0a0' }}>
              [拓扑图区域 - 待集成 AntV X6]
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
