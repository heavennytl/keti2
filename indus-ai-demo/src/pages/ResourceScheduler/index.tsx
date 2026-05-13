import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { Card, Row, Col, Statistic, Table, Tag, Button, Select, Progress, Tooltip, message } from 'antd';
import { SwapOutlined, PlayCircleOutlined, StopOutlined } from '@ant-design/icons';
import { useNavigate, useSearchParams } from 'react-router-dom';
import ReactEChartsCore from 'echarts-for-react';
import * as echarts from 'echarts';
import { useResourceStore } from '@/stores/useResourceStore';
import LoadingState from '@/components/LoadingState';
import ErrorState from '@/components/ErrorState';

// 各策略对应的适配评分影响
const strategyImpact: Record<string, { adaptDelta: number; desc: string }> = {
  '负载均衡优先': { adaptDelta: 0, desc: '均衡分配负载，适配质量稳定' },
  '时延优先': { adaptDelta: -5, desc: '优先降低延迟，适配质量略有下降' },
  '能耗优先': { adaptDelta: -8, desc: '优先降低能耗，适配质量有所下降' },
  '成本优先': { adaptDelta: -12, desc: '优先降低成本，适配质量下降较多' },
  '性能优先': { adaptDelta: 3, desc: '优先提升性能，适配质量略有提升' },
  '适配质量优先': { adaptDelta: 8, desc: '优先保障适配质量，评分显著提升' },
};

export default function ResourceScheduler() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const alertNode = searchParams.get('alert');
  const { nodes, strategy, loading, error, fetchNodes, setStrategy } = useResourceStore();
  const [isScheduling, setIsScheduling] = useState(false);
  const [scheduleProgress, setScheduleProgress] = useState(0);
  const [scheduleLogs, setScheduleLogs] = useState<string[]>([]);
  const [showComparison, setShowComparison] = useState(false);
  const scheduleRef = useRef<number | null>(null);

  useEffect(() => {
    fetchNodes();
  }, [fetchNodes]);

  useEffect(() => {
    return () => {
      if (scheduleRef.current) clearInterval(scheduleRef.current);
    };
  }, []);

  const impact = strategyImpact[strategy] || strategyImpact['负载均衡优先'];

  // 根据策略计算调整后的适配评分
  const adjustedNodes = useMemo(() => {
    return nodes.map(n => ({
      ...n,
      adjustedScore: Math.max(0, Math.min(100, n.adaptScore + impact.adaptDelta)),
    }));
  }, [nodes, impact.adaptDelta]);

  const avgCpu = Math.round(nodes.reduce((s, n) => s + n.cpu, 0) / nodes.length);
  const avgGpu = Math.round(nodes.reduce((s, n) => s + n.gpu, 0) / nodes.length);
  const avgMemory = Math.round(nodes.reduce((s, n) => s + n.memory, 0) / nodes.length);
  const avgLatency = Math.round(nodes.reduce((s, n) => s + n.latency, 0) / nodes.length);
  const totalTasks = nodes.reduce((s, n) => s + n.tasks, 0);
  const avgAdaptScore = Math.round(adjustedNodes.reduce((s, n) => s + n.adjustedScore, 0) / adjustedNodes.length);

  const startAutoSchedule = useCallback(() => {
    if (isScheduling) return;
    setIsScheduling(true);
    setScheduleProgress(0);
    setScheduleLogs([]);
    setShowComparison(false);

    const steps = [
      '正在分析各节点负载情况...',
      '正在计算最优调度策略...',
      '正在执行任务迁移...',
      '资源调度完成！',
    ];

    let stepIndex = 0;
    scheduleRef.current = window.setInterval(() => {
      if (stepIndex >= steps.length) {
        if (scheduleRef.current) clearInterval(scheduleRef.current);
        scheduleRef.current = null;
        setIsScheduling(false);
        setScheduleProgress(100);
        setShowComparison(true);
        message.success('自动调度完成！');
        return;
      }
      setScheduleLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${steps[stepIndex]}`]);
      setScheduleProgress(Math.round(((stepIndex + 1) / steps.length) * 100));
      stepIndex++;
    }, 800);
  }, [isScheduling]);

  const stopAutoSchedule = useCallback(() => {
    if (scheduleRef.current) {
      clearInterval(scheduleRef.current);
      scheduleRef.current = null;
    }
    setIsScheduling(false);
    message.info('自动调度已停止');
  }, []);

  // 热力图数据
  const heatmapData = useMemo(() => {
    const metrics = ['CPU', 'GPU', '内存', '延迟'];
    const data: Array<[number, number, number]> = [];
    adjustedNodes.forEach((node, i) => {
      data.push([i, 0, node.cpu]);
      data.push([i, 1, node.gpu]);
      data.push([i, 2, node.memory]);
      data.push([i, 3, node.latency]);
    });
    return { data, nodeNames: adjustedNodes.map(n => n.node), metrics };
  }, [adjustedNodes]);

  const heatmapOption = useMemo(() => ({
    tooltip: {
      position: 'top',
      formatter: (params: any) => {
        const nodeName = heatmapData.nodeNames[params.value[0]];
        const metric = heatmapData.metrics[params.value[1]];
        const value = params.value[2];
        return `${nodeName}<br/>${metric}: ${value}${params.value[1] === 3 ? 'ms' : '%'}`;
      },
    },
    grid: { left: 100, right: 40, top: 20, bottom: 40 },
    xAxis: {
      type: 'category',
      data: heatmapData.nodeNames,
      splitArea: { show: true },
      axisLabel: { color: '#a0a0a0', fontSize: 11, rotate: 15 },
    },
    yAxis: {
      type: 'category',
      data: heatmapData.metrics,
      splitArea: { show: true },
      axisLabel: { color: '#a0a0a0', fontSize: 11 },
    },
    visualMap: {
      min: 0,
      max: 100,
      calculable: true,
      orient: 'horizontal',
      left: 'center',
      bottom: 0,
      inRange: {
        color: ['#52c41a', '#faad14', '#ff4d4f'],
      },
      textStyle: { color: '#a0a0a0' },
    },
    series: [{
      type: 'heatmap',
      data: heatmapData.data,
      label: {
        show: true,
        color: '#e5e5e5',
        fontSize: 11,
        formatter: (params: any) => `${params.value[2]}${params.value[1] === 3 ? 'ms' : '%'}`,
      },
      emphasis: {
        itemStyle: { shadowBlur: 10, shadowColor: 'rgba(0, 0, 0, 0.5)' },
      },
    }],
  }), [heatmapData]);

  if (loading) return <LoadingState tip="正在加载节点资源数据..." fullPage />;
  if (error) return <ErrorState message={error} onRetry={fetchNodes} />;

  const columns = [
    { title: '节点', dataIndex: 'node', key: 'node' },
    {
      title: 'CPU', dataIndex: 'cpu', key: 'cpu',
      render: (v: number) => <Progress percent={v} size="small" strokeColor={v > 80 ? '#ff4d4f' : v > 60 ? '#faad14' : '#52c41a'} />,
    },
    {
      title: 'GPU', dataIndex: 'gpu', key: 'gpu',
      render: (v: number) => <Progress percent={v} size="small" strokeColor={v > 80 ? '#ff4d4f' : v > 60 ? '#faad14' : '#52c41a'} />,
    },
    {
      title: '内存', dataIndex: 'memory', key: 'memory',
      render: (v: number) => <Progress percent={v} size="small" strokeColor={v > 80 ? '#ff4d4f' : v > 60 ? '#faad14' : '#52c41a'} />,
    },
    { title: '延迟(ms)', dataIndex: 'latency', key: 'latency' },
    { title: '任务数', dataIndex: 'tasks', key: 'tasks' },
    { title: '状态', dataIndex: 'status', key: 'status', render: (s: string) => <Tag color="success">{s}</Tag> },
    {
      title: '适配评分', dataIndex: 'adjustedScore', key: 'adjustedScore',
      render: (v: number) => (
        <Tooltip title={`${strategy}策略影响: ${impact.adaptDelta > 0 ? '+' : ''}${impact.adaptDelta}%`}>
          <Progress percent={v} size="small" format={(p) => `${p}%`}
            strokeColor={v >= 85 ? '#52c41a' : v >= 70 ? '#faad14' : '#ff4d4f'} />
        </Tooltip>
      ),
    },
    {
      title: '操作', key: 'action',
      render: (_: any, record: any) => (
        <Button type="link" size="small" icon={<SwapOutlined />} onClick={() => navigate('/model-adapt')}>
          适配优化
        </Button>
      ),
    },
  ];

  return (
    <div>
      {/* 告警提示 */}
      {alertNode && (
        <Card size="small" style={{ marginBottom: 16, borderColor: '#faad14' }}>
          <div style={{ color: '#faad14' }}>
            <strong>⚠ {alertNode} 异常</strong> - 建议立即执行自动调度
          </div>
        </Card>
      )}

      {/* 指标卡片 */}
      <Row gutter={[16, 16]}>
        <Col span={3}><Card><Statistic title="节点数" value={nodes.length} /></Card></Col>
        <Col span={3}><Card><Statistic title="任务数" value={totalTasks} /></Card></Col>
        <Col span={3}><Card><Statistic title="平均CPU" value={avgCpu} suffix="%" /></Card></Col>
        <Col span={3}><Card><Statistic title="平均GPU" value={avgGpu} suffix="%" /></Card></Col>
        <Col span={3}><Card><Statistic title="平均内存" value={avgMemory} suffix="%" /></Card></Col>
        <Col span={3}><Card><Statistic title="平均延迟" value={avgLatency} suffix="ms" /></Card></Col>
        <Col span={3}>
          <Card>
            <Statistic title="适配评分" value={avgAdaptScore} suffix="%"
              valueStyle={{ color: avgAdaptScore >= 80 ? '#52c41a' : avgAdaptScore >= 60 ? '#faad14' : '#ff4d4f' }} />
          </Card>
        </Col>
        <Col span={3}>
          <Card>
            <Statistic title="调度策略" />
            <Select value={strategy} onChange={setStrategy} size="small" style={{ width: '100%', marginTop: 4 }}
              options={[
                { value: '负载均衡优先', label: '负载均衡优先' },
                { value: '时延优先', label: '时延优先' },
                { value: '能耗优先', label: '能耗优先' },
                { value: '成本优先', label: '成本优先' },
                { value: '性能优先', label: '性能优先' },
                { value: '适配质量优先', label: '适配质量优先' },
              ]} />
          </Card>
        </Col>
      </Row>

      {/* 策略影响提示 */}
      <Card size="small" style={{ marginTop: 8, borderColor: '#1677ff' }}>
        <div style={{ color: '#a0a0a0', fontSize: 13 }}>
          <strong style={{ color: '#1677ff' }}>当前策略：{strategy}</strong>
          <span style={{ marginLeft: 12 }}>{impact.desc}</span>
          <span style={{ marginLeft: 12, color: impact.adaptDelta >= 0 ? '#52c41a' : '#ff4d4f' }}>
            适配评分影响：{impact.adaptDelta > 0 ? '+' : ''}{impact.adaptDelta}%
          </span>
        </div>
      </Card>

      {/* 节点表格 */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col span={24}>
          <Card title="节点资源列表" extra={
            <div style={{ display: 'flex', gap: 8 }}>
              {isScheduling && <Progress percent={scheduleProgress} size="small" style={{ width: 120 }} />}
              {!isScheduling ? (
                <Button size="small" type="primary" icon={<PlayCircleOutlined />} onClick={startAutoSchedule}>
                  自动调度
                </Button>
              ) : (
                <Button size="small" danger icon={<StopOutlined />} onClick={stopAutoSchedule}>
                  停止
                </Button>
              )}
              <Button size="small" icon={<SwapOutlined />} onClick={() => navigate('/model-adapt')}>
                前往适配中心
              </Button>
            </div>
          }>
            <Table dataSource={adjustedNodes} columns={columns} rowKey="key" size="small" pagination={false} />
          </Card>
        </Col>
      </Row>

      {/* 资源热力图 */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col span={24}>
          <Card title="节点负载热力图（CPU / GPU / 内存 / 延迟）">
            <ReactEChartsCore echarts={echarts} option={heatmapOption} style={{ height: 260 }} />
          </Card>
        </Col>
      </Row>

      {/* 调度日志 */}
      {scheduleLogs.length > 0 && (
        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
          <Col span={24}>
            <Card title="调度日志">
              <div style={{ maxHeight: 120, overflow: 'auto', fontFamily: 'monospace', fontSize: 12, background: '#0d0d0d', padding: 8, borderRadius: 4 }}>
                {scheduleLogs.map((log, i) => (
                  <div key={i} style={{ color: log.includes('完成') ? '#52c41a' : '#a0a0a0', marginBottom: 2 }}>{log}</div>
                ))}
              </div>
            </Card>
          </Col>
        </Row>
      )}

      {/* 调度前后对比 */}
      {showComparison && (
        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
          <Col span={24}>
            <Card title="调度前后对比">
              <Table
                dataSource={[
                  { key: '1', metric: '延迟', before: '112ms', after: '63ms', change: '-43.8%' },
                  { key: '2', metric: 'GPU利用率', before: '92%', after: '67%', change: '-27.2%' },
                  { key: '3', metric: '能耗', before: '850W', after: '620W', change: '-27.1%' },
                  { key: '4', metric: '吞吐量', before: '180 QPS', after: '240 QPS', change: '+33.3%' },
                ]}
                columns={[
                  { title: '指标', dataIndex: 'metric', key: 'metric' },
                  { title: '调度前', dataIndex: 'before', key: 'before' },
                  { title: '调度后', dataIndex: 'after', key: 'after' },
                  { title: '优化幅度', dataIndex: 'change', key: 'change', render: (v: string) => <span style={{ color: v.startsWith('+') ? '#52c41a' : '#1677ff' }}>{v}</span> },
                ]}
                size="small"
                pagination={false}
              />
              <div style={{ textAlign: 'center', marginTop: 16 }}>
                <Button type="primary" onClick={() => navigate('/')}>返回驾驶舱</Button>
              </div>
            </Card>
          </Col>
        </Row>
      )}
    </div>
  );
}
