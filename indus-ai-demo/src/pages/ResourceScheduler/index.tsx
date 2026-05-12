import { useState, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, Row, Col, Statistic, Table, Tag, Button, message } from 'antd';
import { SwapOutlined, CaretRightOutlined, CheckCircleOutlined } from '@ant-design/icons';

const scheduleSteps = [
  { key: '1', title: '分析负载', description: '分析各节点负载情况' },
  { key: '2', title: '计算策略', description: '计算最优调度策略' },
  { key: '3', title: '迁移任务', description: '执行任务迁移' },
  { key: '4', title: '调度完成', description: '资源调度完成' },
];

const scheduleLogsData: Record<string, string[]> = {
  '1': ['[INFO] 开始分析节点负载...', '[INFO] 焊接车间-A线 GPU: 92%', '[INFO] 装配线-B线 GPU: 67%', '[INFO] 负载分析完成'],
  '2': ['[INFO] 开始计算调度策略...', '[INFO] 检测到焊接车间-A线负载过高', '[INFO] 推荐迁移部分任务到装配线-B线', '[INFO] 策略计算完成'],
  '3': ['[INFO] 开始迁移任务...', '[INFO] 迁移 WeldDetect-v2 推理任务到装配线-B线', '[INFO] 迁移 SurfaceDefect-v3 推理任务到打磨车间-C线', '[INFO] 任务迁移完成'],
  '4': ['[INFO] 调度完成！', '[INFO] 焊接车间-A线 GPU: 92% → 67%', '[INFO] 装配线-B线 GPU: 67% → 78%', '[INFO] 系统整体负载均衡'],
};

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export default function ResourceScheduler() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const alertNode = searchParams.get('alert');

  const [isScheduling, setIsScheduling] = useState(false);
  const [scheduleComplete, setScheduleComplete] = useState(false);
  const [currentScheduleStep, setCurrentScheduleStep] = useState(0);
  const [scheduleLogs, setScheduleLogs] = useState<string[]>([]);

  const startSchedule = useCallback(async () => {
    if (isScheduling) return;
    setIsScheduling(true);
    setScheduleComplete(false);
    setScheduleLogs([]);
    setCurrentScheduleStep(0);

    for (let step = 1; step <= 4; step++) {
      setCurrentScheduleStep(step);
      const stepTime = 1500;
      const stepStartTime = Date.now();

      setScheduleLogs((prev) => [...prev, `[INFO] === ${scheduleSteps[step - 1].title} ===`]);

      while (Date.now() - stepStartTime < stepTime) {
        await delay(50);
      }

      const logs = scheduleLogsData[String(step)] || [];
      logs.forEach((log) => {
        setScheduleLogs((prev) => [...prev, `  ${log}`]);
      });
    }

    setScheduleComplete(true);
    setCurrentScheduleStep(0);
    setIsScheduling(false);
    message.success('调度完成！');
  }, [isScheduling]);

  const goToDashboard = useCallback(() => {
    navigate('/dashboard');
  }, [navigate]);

  return (
    <div>
      <Row gutter={[16, 16]}>
        <Col span={4}><Card><Statistic title="总节点数" value={12} /></Card></Col>
        <Col span={4}><Card><Statistic title="GPU总利用率" value={72} suffix="%" valueStyle={{ color: '#faad14' }} /></Card></Col>
        <Col span={4}><Card><Statistic title="平均延迟" value={63} suffix="ms" valueStyle={{ color: '#52c41a' }} /></Card></Col>
        <Col span={4}><Card><Statistic title="总能耗" value={620} suffix="W" valueStyle={{ color: '#52c41a' }} /></Card></Col>
        <Col span={4}><Card><Statistic title="总吞吐量" value={240} suffix="QPS" valueStyle={{ color: '#52c41a' }} /></Card></Col>
        <Col span={4}>
          <Card>
            <Statistic title="操作" />
            <Button type="primary" icon={<SwapOutlined />} style={{ marginTop: 8 }}>手动调度</Button>
          </Card>
        </Col>
      </Row>

      {alertNode && !scheduleComplete && (
        <Card style={{ marginTop: 16, borderLeft: '3px solid #ff4d4f' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <span style={{ fontSize: 15, fontWeight: 600 }}>{alertNode}</span>
              <Tag color="error" style={{ marginLeft: 8 }}>异常</Tag>
              <span style={{ color: '#a0a0a0', marginLeft: 12, fontSize: 13 }}>
                检测到节点异常，建议立即执行自动调度
              </span>
            </div>
            <Button type="primary" danger icon={<CaretRightOutlined />} onClick={startSchedule} loading={isScheduling}>
              {isScheduling ? '调度中...' : '自动调度'}
            </Button>
          </div>
        </Card>
      )}

      {isScheduling && (
        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
          <Col span={24}>
            <Card title="调度进度">
              <div className="step-flow">
                {scheduleSteps.map((step, index) => {
                  const stepNum = index + 1;
                  const isActive = currentScheduleStep === stepNum;
                  const isCompleted = currentScheduleStep > stepNum || (scheduleComplete && stepNum <= 4);
                  return (
                    <div key={step.key} className={`step-item ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}>
                      <div className="step-number">{isCompleted ? '✓' : stepNum}</div>
                      <div className="step-content">
                        <div style={{ fontWeight: 600, marginBottom: 4 }}>
                          {step.title}
                          {isActive && <Tag color="blue" style={{ marginLeft: 8, fontSize: 11 }}>执行中...</Tag>}
                          {isCompleted && !isActive && <Tag color="success" style={{ marginLeft: 8, fontSize: 11 }}>已完成</Tag>}
                        </div>
                        <div style={{ fontSize: 12, color: '#a0a0a0' }}>{step.description}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
              {scheduleLogs.length > 0 && (
                <div style={{ marginTop: 12, padding: 8, background: '#0d0d0d', borderRadius: 4, maxHeight: 150, overflow: 'auto', fontFamily: 'monospace', fontSize: 12 }}>
                  {scheduleLogs.map((log, i) => (
                    <div key={i} style={{ color: log.includes('完成') ? '#52c41a' : log.includes('ERROR') ? '#ff4d4f' : '#a0a0a0', marginBottom: 2 }}>{log}</div>
                  ))}
                </div>
              )}
            </Card>
          </Col>
        </Row>
      )}

      {scheduleComplete && (
        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
          <Col span={24}>
            <Card>
              <div style={{ textAlign: 'center', padding: '24px 0' }}>
                <CheckCircleOutlined style={{ fontSize: 48, color: '#52c41a', marginBottom: 16 }} />
                <div style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>调度完成 ✓</div>
                <div style={{ color: '#a0a0a0', marginBottom: 24 }}>资源调度已成功执行，系统负载已均衡</div>
                <Row gutter={[16, 16]} style={{ maxWidth: 800, margin: '0 auto 24px' }}>
                  <Col span={6}>
                    <Card size="small" style={{ background: '#1a1a1a' }}>
                      <Statistic title="延迟" value={112} suffix="ms" valueStyle={{ fontSize: 20, color: '#ff4d4f' }} />
                      <div style={{ fontSize: 12, color: '#52c41a', marginTop: 4 }}>→ 63ms</div>
                    </Card>
                  </Col>
                  <Col span={6}>
                    <Card size="small" style={{ background: '#1a1a1a' }}>
                      <Statistic title="GPU利用率" value={92} suffix="%" valueStyle={{ fontSize: 20, color: '#ff4d4f' }} />
                      <div style={{ fontSize: 12, color: '#52c41a', marginTop: 4 }}>→ 67%</div>
                    </Card>
                  </Col>
                  <Col span={6}>
                    <Card size="small" style={{ background: '#1a1a1a' }}>
                      <Statistic title="能耗" value={850} suffix="W" valueStyle={{ fontSize: 20, color: '#ff4d4f' }} />
                      <div style={{ fontSize: 12, color: '#52c41a', marginTop: 4 }}>→ 620W</div>
                    </Card>
                  </Col>
                  <Col span={6}>
                    <Card size="small" style={{ background: '#1a1a1a' }}>
                      <Statistic title="吞吐量" value={180} suffix="QPS" valueStyle={{ fontSize: 20, color: '#ff4d4f' }} />
                      <div style={{ fontSize: 12, color: '#52c41a', marginTop: 4 }}>→ 240 QPS</div>
                    </Card>
                  </Col>
                </Row>
                <Button type="primary" size="large" icon={<CaretRightOutlined />} onClick={goToDashboard}>
                  返回驾驶舱
                </Button>
              </div>
            </Card>
          </Col>
        </Row>
      )}

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col span={24}>
          <Card title="节点资源列表">
            <Table
              dataSource={[
                { key: '1', node: '焊接车间-A线', cpu: 67, gpu: 67, memory: 55, latency: 63, tasks: 3, status: '均衡' },
                { key: '2', node: '装配线-B线', cpu: 52, gpu: 78, memory: 48, latency: 58, tasks: 4, status: '均衡' },
                { key: '3', node: '打磨车间-C线', cpu: 38, gpu: 45, memory: 35, latency: 42, tasks: 2, status: '均衡' },
                { key: '4', node: '质检线-D线', cpu: 55, gpu: 72, memory: 58, latency: 55, tasks: 3, status: '均衡' },
              ]}
              columns={[
                { title: '节点', dataIndex: 'node', key: 'node' },
                { title: 'CPU(%)', dataIndex: 'cpu', key: 'cpu' },
                { title: 'GPU(%)', dataIndex: 'gpu', key: 'gpu' },
                { title: '内存(%)', dataIndex: 'memory', key: 'memory' },
                { title: '延迟(ms)', dataIndex: 'latency', key: 'latency' },
                { title: '任务数', dataIndex: 'tasks', key: 'tasks' },
                { title: '状态', dataIndex: 'status', key: 'status', render: (s: string) => <Tag color="success">{s}</Tag> },
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
