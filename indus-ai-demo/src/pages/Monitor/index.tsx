import { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Table, Tag, Button, Progress, Tooltip, Badge, Modal, Descriptions } from 'antd';
import { SwapOutlined, CheckCircleOutlined, CloseCircleOutlined, WarningOutlined, InfoCircleOutlined, ThunderboltOutlined, LineChartOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useMonitorStore } from '@/stores/useMonitorStore';
import ReactEChartsCore from 'echarts-for-react';
import LoadingState from '@/components/LoadingState';
import ErrorState from '@/components/ErrorState';

// 适配质量趋势数据
const adaptTrendData = {
  dates: ['5/7', '5/8', '5/9', '5/10', '5/11', '5/12', '5/13'],
  series: [
    { name: '焊接车间-A线', data: [88, 90, 91, 92, 93, 94, 94] },
    { name: '装配线-B线', data: [85, 86, 88, 89, 90, 91, 92] },
    { name: '打磨车间-C线', data: [55, 58, 60, 62, 63, 64, 65] },
    { name: '质检线-D线', data: [82, 83, 84, 85, 86, 87, 88] },
  ],
};

// 告警适配联动详情
const alertAdaptDetails: Record<string, { model: string; adaptScore: number; adapters: string[]; suggestion: string }> = {
  '1': { model: 'WeldDetect-v2', adaptScore: 94, adapters: ['HikVision-CAM-v2', 'Siemens-S7-v1'], suggestion: '适配评分正常，建议检查网络延迟' },
  '2': { model: 'SurfaceDefect-v3', adaptScore: 65, adapters: [], suggestion: '适配评分偏低，建议前往适配中心优化适配器配置' },
  '3': { model: 'AssemblyCheck-v1', adaptScore: 92, adapters: ['Basler-CAM-v1', 'Mitsubishi-FX-v2'], suggestion: '适配状态良好，建议检查节点资源使用情况' },
  '4': { model: 'QualityCheck-v2', adaptScore: 88, adapters: ['HikVision-CAM-v2'], suggestion: '适配评分正常，建议关注节点负载变化' },
};

export default function Monitor() {
  const navigate = useNavigate();
  const { alerts, metrics, loading, error, fetchAlerts, fetchMetrics } = useMonitorStore();
  const [adaptDetailModal, setAdaptDetailModal] = useState<any>(null);

  useEffect(() => {
    fetchAlerts();
    fetchMetrics();
  }, [fetchAlerts, fetchMetrics]);

  if (loading) return <LoadingState tip="加载监控数据..." fullPage />;
  if (error) return <ErrorState message={error} onRetry={() => { fetchAlerts(); fetchMetrics(); }} />;

  const errorAlerts = alerts.filter(a => a.level === 'error');
  const warningAlerts = alerts.filter(a => a.level === 'warning');
  const unprocessedAlerts = alerts.filter(a => a.status === '未处理');
  const adaptRelatedAlerts = alerts.filter(a => a.adaptRelated);

  const onlineNodes = metrics.filter(m => m.status === 'online').length;
  const warningNodes = metrics.filter(m => m.status === 'warning').length;
  const avgCpu = Math.round(metrics.reduce((s, m) => s + m.cpu, 0) / metrics.length);
  const avgGpu = Math.round(metrics.reduce((s, m) => s + m.gpu, 0) / metrics.length);
  const avgLatency = Math.round(metrics.reduce((s, m) => s + m.latency, 0) / metrics.length);
  const avgAdaptScore = Math.round(metrics.reduce((s, m) => s + (m.adaptScore || 0), 0) / metrics.length);

  return (
    <div>
      <Row gutter={[16, 16]}>
        <Col span={3}><Card><Statistic title="在线节点" value={onlineNodes} valueStyle={{ color: '#52c41a' }} /></Card></Col>
        <Col span={3}><Card><Statistic title="告警节点" value={warningNodes} valueStyle={{ color: '#faad14' }} /></Card></Col>
        <Col span={3}><Card><Statistic title="未处理告警" value={unprocessedAlerts.length} valueStyle={{ color: '#ff4d4f' }} /></Card></Col>
        <Col span={3}><Card><Statistic title="适配相关告警" value={adaptRelatedAlerts.length} valueStyle={{ color: '#722ed1' }} /></Card></Col>
        <Col span={3}><Card><Statistic title="平均CPU" value={avgCpu} suffix="%" /></Card></Col>
        <Col span={3}><Card><Statistic title="平均GPU" value={avgGpu} suffix="%" /></Card></Col>
        <Col span={3}><Card><Statistic title="平均延迟" value={avgLatency} suffix="ms" /></Card></Col>
        <Col span={3}><Card><Statistic title="平均适配评分" value={avgAdaptScore} suffix="%" valueStyle={{ color: avgAdaptScore >= 80 ? '#52c41a' : '#faad14' }} /></Card></Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col span={24}>
          <Card title="节点监控指标">
            <Table
              dataSource={metrics}
              columns={[
                { title: '节点', dataIndex: 'node', key: 'node' },
                {
                  title: '状态', dataIndex: 'status', key: 'status',
                  render: (s: string) => (
                    <Badge status={s === 'online' ? 'success' : s === 'warning' ? 'warning' : 'error'}
                      text={s === 'online' ? '在线' : s === 'warning' ? '告警' : '离线'} />
                  ),
                },
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
                { title: '吞吐量(FPS)', dataIndex: 'throughput', key: 'throughput' },
                {
                  title: '适配评分', dataIndex: 'adaptScore', key: 'adaptScore',
                  render: (v: number | undefined) => v ? (
                    <Tooltip title="模型适配质量评分">
                      <Progress percent={v} size="small" format={(p) => `${p}%`}
                        strokeColor={v >= 85 ? '#52c41a' : v >= 70 ? '#faad14' : '#ff4d4f'} />
                    </Tooltip>
                  ) : <Tag color="default">无数据</Tag>,
                },
                {
                  title: '操作', key: 'action', render: (_: any, _record: typeof metrics[0]) => (
                    <Button type="link" size="small" icon={<SwapOutlined />} onClick={() => navigate('/model-adapt')}>
                      适配优化
                    </Button>
                  ),
                },
              ]}
              rowKey="key"
              size="small"
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col span={12}>
          <Card title="资源利用率概览">
            <ReactEChartsCore option={{
              tooltip: { trigger: 'axis' },
              legend: { data: ['CPU', 'GPU', '内存'], textStyle: { color: '#a0a0a0' } },
              grid: { left: 40, right: 10, top: 40, bottom: 25 },
              xAxis: { type: 'category', data: metrics.map(m => m.node.split('-')[0]), axisLabel: { color: '#a0a0a0', fontSize: 10 } },
              yAxis: { type: 'value', max: 100, axisLabel: { color: '#a0a0a0', fontSize: 10 }, splitLine: { lineStyle: { color: '#1a1a1a' } } },
              series: [
                { name: 'CPU', type: 'bar', data: metrics.map(m => m.cpu), itemStyle: { color: '#1677ff', borderRadius: [4, 4, 0, 0] } },
                { name: 'GPU', type: 'bar', data: metrics.map(m => m.gpu), itemStyle: { color: '#52c41a', borderRadius: [4, 4, 0, 0] } },
                { name: '内存', type: 'bar', data: metrics.map(m => m.memory), itemStyle: { color: '#faad14', borderRadius: [4, 4, 0, 0] } },
              ],
            }} style={{ height: 300 }} />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="适配评分分布">
            <ReactEChartsCore option={{
              tooltip: { trigger: 'axis' },
              grid: { left: 40, right: 10, top: 20, bottom: 25 },
              xAxis: { type: 'category', data: metrics.map(m => m.node.split('-')[0]), axisLabel: { color: '#a0a0a0', fontSize: 10 } },
              yAxis: { type: 'value', max: 100, axisLabel: { color: '#a0a0a0', fontSize: 10 }, splitLine: { lineStyle: { color: '#1a1a1a' } } },
              series: [{
                type: 'bar', data: metrics.map(m => m.adaptScore || 0),
                itemStyle: {
                  color: (params: any) => {
                    const v = params.value;
                    return v >= 85 ? '#52c41a' : v >= 70 ? '#faad14' : '#ff4d4f';
                  },
                  borderRadius: [4, 4, 0, 0],
                },
                label: { show: true, position: 'top', color: '#a0a0a0', fontSize: 10, formatter: '{c}%' },
              }],
            }} style={{ height: 300 }} />
          </Card>
        </Col>
      </Row>

      {/* 适配质量趋势图 */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col span={24}>
          <Card title={<span><LineChartOutlined style={{ marginRight: 6 }} />适配质量趋势图</span>}>
            <ReactEChartsCore option={{
              tooltip: { trigger: 'axis' },
              legend: { data: adaptTrendData.series.map(s => s.name), textStyle: { color: '#a0a0a0' } },
              grid: { left: 40, right: 20, top: 40, bottom: 25 },
              xAxis: { type: 'category', data: adaptTrendData.dates, axisLabel: { color: '#a0a0a0', fontSize: 10 }, boundaryGap: false },
              yAxis: { type: 'value', min: 50, max: 100, axisLabel: { color: '#a0a0a0', fontSize: 10, formatter: '{value}%' }, splitLine: { lineStyle: { color: '#1a1a1a' } } },
              series: adaptTrendData.series.map((s, i) => ({
                name: s.name,
                type: 'line',
                smooth: true,
                data: s.data,
                symbol: 'circle',
                symbolSize: 6,
                lineStyle: { width: 2 },
                itemStyle: { color: ['#1677ff', '#52c41a', '#faad14', '#722ed1'][i] },
                areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: ['rgba(22, 119, 255, 0.2)', 'rgba(82, 196, 26, 0.2)', 'rgba(250, 173, 20, 0.2)', 'rgba(114, 46, 209, 0.2)'][i] }, { offset: 1, color: 'rgba(0,0,0,0)' }] } },
              })),
            }} style={{ height: 300 }} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col span={24}>
          <Card title="告警列表" extra={
            <div style={{ display: 'flex', gap: 8 }}>
              <Tag color="error">错误 {errorAlerts.length}</Tag>
              <Tag color="warning">警告 {warningAlerts.length}</Tag>
              <Tag color="purple">适配相关 {adaptRelatedAlerts.length}</Tag>
              <Button size="small" icon={<SwapOutlined />} onClick={() => navigate('/model-adapt')}>适配优化</Button>
            </div>
          }>
            <Table
              dataSource={alerts}
              columns={[
                { title: '时间', dataIndex: 'time', key: 'time', width: 80 },
                {
                  title: '级别', dataIndex: 'level', key: 'level', width: 70,
                  render: (l: string) => l === 'error' ? <Tag color="error" icon={<CloseCircleOutlined />}>错误</Tag> :
                    l === 'warning' ? <Tag color="warning" icon={<WarningOutlined />}>警告</Tag> :
                    <Tag color="info" icon={<InfoCircleOutlined />}>信息</Tag>,
                },
                { title: '告警内容', dataIndex: 'message', key: 'message' },
                { title: '节点', dataIndex: 'node', key: 'node' },
                {
                  title: '状态', dataIndex: 'status', key: 'status',
                  render: (s: string) => {
                    const colorMap: Record<string, string> = { '未处理': 'error', '处理中': 'processing', '已忽略': 'default', '已处理': 'success' };
                    return <Tag color={colorMap[s] || 'default'}>{s}</Tag>;
                  },
                },
                {
                  title: '适配相关', dataIndex: 'adaptRelated', key: 'adaptRelated',
                  render: (v: boolean | undefined) => v ? <Tag color="purple" icon={<SwapOutlined />}>是</Tag> : <Tag color="default">否</Tag>,
                },
                {
                  title: '操作', key: 'action', render: (_: any, record: typeof alerts[0]) => (
                    <div style={{ display: 'flex', gap: 4 }}>
                      {record.adaptRelated && (
                        <Button type="link" size="small" icon={<ThunderboltOutlined />}
                          onClick={() => setAdaptDetailModal({ ...record, detail: alertAdaptDetails[record.key] })}>
                          适配详情
                        </Button>
                      )}
                      {record.status === '未处理' && (
                        <Button type="link" size="small" icon={<CheckCircleOutlined />}>处理</Button>
                      )}
                    </div>
                  ),
                },
              ]}
              rowKey="key"
              size="small"
            />
          </Card>
        </Col>
      </Row>

      {/* 告警适配联动详情弹窗 */}
      <Modal title={`告警适配联动详情 - ${adaptDetailModal?.node || ''}`} open={!!adaptDetailModal} onCancel={() => setAdaptDetailModal(null)}
        footer={[
          <Button key="close" onClick={() => setAdaptDetailModal(null)}>关闭</Button>,
          <Button key="adapt" type="primary" icon={<SwapOutlined />} onClick={() => { setAdaptDetailModal(null); navigate('/model-adapt'); }}>
            前往适配中心
          </Button>,
        ]} width={500}>
        {adaptDetailModal && adaptDetailModal.detail && (
          <div>
            <Descriptions column={2} size="small" style={{ marginBottom: 16 }}>
              <Descriptions.Item label="告警时间">{adaptDetailModal.time}</Descriptions.Item>
              <Descriptions.Item label="告警级别">
                {adaptDetailModal.level === 'error' ? <Tag color="error">错误</Tag> :
                 adaptDetailModal.level === 'warning' ? <Tag color="warning">警告</Tag> : <Tag color="info">信息</Tag>}
              </Descriptions.Item>
              <Descriptions.Item label="告警内容" span={2}>{adaptDetailModal.message}</Descriptions.Item>
              <Descriptions.Item label="关联模型">{adaptDetailModal.detail.model}</Descriptions.Item>
              <Descriptions.Item label="适配评分">
                <Progress percent={adaptDetailModal.detail.adaptScore} size="small" format={(p) => `${p}%`}
                  strokeColor={adaptDetailModal.detail.adaptScore >= 85 ? '#52c41a' : adaptDetailModal.detail.adaptScore >= 70 ? '#faad14' : '#ff4d4f'} />
              </Descriptions.Item>
            </Descriptions>
            <div style={{ fontWeight: 600, marginBottom: 8, color: '#a0a0a0' }}>已选适配器</div>
            {adaptDetailModal.detail.adapters.length > 0 ? (
              adaptDetailModal.detail.adapters.map((adapter: string, i: number) => (
                <Tag key={i} color="blue" style={{ marginBottom: 4 }}>{adapter}</Tag>
              ))
            ) : (
              <Tag color="default">无适配器</Tag>
            )}
            <div style={{ marginTop: 12, padding: '8px 12px', background: 'rgba(114, 46, 209, 0.1)', borderRadius: 8, fontSize: 13, color: '#722ed1' }}>
              <ThunderboltOutlined style={{ marginRight: 4 }} />{adaptDetailModal.detail.suggestion}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
