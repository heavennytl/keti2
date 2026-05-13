import { useEffect } from 'react';
import { Card, Row, Col, Statistic, Table, Tag, Button, Tooltip, Progress } from 'antd';
import { SwapOutlined, ThunderboltOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { useInferenceStore } from '@/stores/useInferenceStore';
import { useNavigate } from 'react-router-dom';
import ReactEChartsCore from 'echarts-for-react';
import LoadingState from '@/components/LoadingState';
import ErrorState from '@/components/ErrorState';

export default function InferenceEngine() {
  const navigate = useNavigate();
  const { engines, loading, error, fetchEngines } = useInferenceStore();

  useEffect(() => {
    fetchEngines();
  }, [fetchEngines]);

  if (loading) return <LoadingState tip="加载推理引擎数据..." fullPage />;
  if (error) return <ErrorState message={error} onRetry={fetchEngines} />;

  const runningEngines = engines.filter(e => e.status === 'running');
  const totalThroughput = runningEngines.reduce((s, e) => s + e.throughput, 0);
  const avgLatency = runningEngines.length > 0
    ? Math.round(runningEngines.reduce((s, e) => s + e.latency, 0) / runningEngines.length)
    : 0;
  const avgAdaptCompat = engines.length > 0
    ? Math.round(engines.reduce((s, e) => s + (e.adaptCompatibility || 0), 0) / engines.length)
    : 0;

  return (
    <div>
      <Row gutter={[16, 16]}>
        <Col span={3}><Card><Statistic title="推理引擎数" value={engines.length} /></Card></Col>
        <Col span={3}><Card><Statistic title="运行中引擎" value={runningEngines.length} valueStyle={{ color: '#52c41a' }} /></Card></Col>
        <Col span={3}><Card><Statistic title="总吞吐量" value={totalThroughput} suffix="FPS" /></Card></Col>
        <Col span={3}><Card><Statistic title="平均延迟" value={avgLatency} suffix="ms" /></Card></Col>
        <Col span={3}><Card><Statistic title="GPU利用率" value={67} suffix="%" /></Card></Col>
        <Col span={3}><Card><Statistic title="CPU利用率" value={42} suffix="%" /></Card></Col>
        <Col span={3}>
          <Card>
            <Statistic title="适配兼容性" value={avgAdaptCompat} suffix="%" valueStyle={{ color: avgAdaptCompat >= 85 ? '#52c41a' : '#faad14' }} />
          </Card>
        </Col>
        <Col span={3}>
          <Card>
            <Statistic title="操作" />
            <Button size="small" icon={<SwapOutlined />} style={{ marginTop: 8 }} onClick={() => navigate('/model-adapt')}>
              适配推荐
            </Button>
          </Card>
        </Col>
      </Row>

      {/* 异构架构图 */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col span={24}>
          <Card title="异构推理架构">
            <ReactEChartsCore option={{
              tooltip: { trigger: 'item', formatter: '{b}<br/>{c}' },
              series: [{
                type: 'graph',
                layout: 'force',
                force: { repulsion: 400, edgeLength: [100, 200], gravity: 0.1 },
                roam: true,
                draggable: true,
                label: { show: true, color: '#e5e5e5', fontSize: 11, fontWeight: 600 },
                edgeSymbol: ['none', 'arrow'],
                edgeLabel: { show: true, color: '#666', fontSize: 10, formatter: '{c}' },
                lineStyle: { color: '#434343', width: 2, curveness: 0.2 },
                categories: [
                  { name: '推理引擎', itemStyle: { color: '#1677ff' } },
                  { name: '硬件架构', itemStyle: { color: '#52c41a' } },
                  { name: '应用场景', itemStyle: { color: '#faad14' } },
                ],
                data: [
                  { name: 'TensorRT\n(GPU加速)', symbolSize: 55, category: 0, itemStyle: { color: '#1677ff' } },
                  { name: 'OpenVINO\n(CPU优化)', symbolSize: 55, category: 0, itemStyle: { color: '#1677ff' } },
                  { name: 'ONNX Runtime\n(跨平台)', symbolSize: 55, category: 0, itemStyle: { color: '#1677ff' } },
                  { name: 'TFLite\n(边缘端)', symbolSize: 55, category: 0, itemStyle: { color: '#1677ff' } },
                  { name: 'NVIDIA GPU\n(CUDA)', symbolSize: 45, category: 1, itemStyle: { color: '#52c41a' } },
                  { name: 'Intel CPU/GPU\n(OpenCL)', symbolSize: 45, category: 1, itemStyle: { color: '#52c41a' } },
                  { name: 'ARM CPU\n(NEON)', symbolSize: 45, category: 1, itemStyle: { color: '#52c41a' } },
                  { name: '视觉检测', symbolSize: 35, category: 2, itemStyle: { color: '#faad14' } },
                  { name: '缺陷识别', symbolSize: 35, category: 2, itemStyle: { color: '#faad14' } },
                  { name: '工艺决策', symbolSize: 35, category: 2, itemStyle: { color: '#faad14' } },
                ],
                links: [
                  { source: 'TensorRT\n(GPU加速)', target: 'NVIDIA GPU\n(CUDA)', value: 'CUDA加速' },
                  { source: 'OpenVINO\n(CPU优化)', target: 'Intel CPU/GPU\n(OpenCL)', value: 'OpenCL优化' },
                  { source: 'ONNX Runtime\n(跨平台)', target: 'NVIDIA GPU\n(CUDA)', value: '多后端' },
                  { source: 'ONNX Runtime\n(跨平台)', target: 'Intel CPU/GPU\n(OpenCL)', value: '多后端' },
                  { source: 'ONNX Runtime\n(跨平台)', target: 'ARM CPU\n(NEON)', value: '多后端' },
                  { source: 'TFLite\n(边缘端)', target: 'ARM CPU\n(NEON)', value: 'NEON优化' },
                  { source: 'TensorRT\n(GPU加速)', target: '视觉检测', value: '高吞吐' },
                  { source: 'TensorRT\n(GPU加速)', target: '缺陷识别', value: '高精度' },
                  { source: 'OpenVINO\n(CPU优化)', target: '视觉检测', value: '低延迟' },
                  { source: 'ONNX Runtime\n(跨平台)', target: '工艺决策', value: '灵活部署' },
                  { source: 'TFLite\n(边缘端)', target: '缺陷识别', value: '轻量推理' },
                ],
              }],
            }} style={{ height: 400 }} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col span={24}>
          <Card title="推理引擎列表" extra={
            <Button size="small" icon={<SwapOutlined />} onClick={() => navigate('/model-adapt')}>
              适配推荐
            </Button>
          }>
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
                { title: '硬件架构', dataIndex: 'arch', key: 'arch' },
                {
                  title: '适配兼容性', dataIndex: 'adaptCompatibility', key: 'adaptCompatibility',
                  render: (v: number | undefined) => v ? (
                    <Tooltip title={`与已适配模型的兼容性评分`}>
                      <Progress percent={v} size="small" format={(p) => `${p}%`}
                        strokeColor={v >= 85 ? '#52c41a' : v >= 70 ? '#faad14' : '#ff4d4f'} />
                    </Tooltip>
                  ) : <Tag color="default">未知</Tag>,
                },
                {
                  title: '引擎推荐', dataIndex: 'recommend', key: 'recommend',
                  render: (r: string) => <Tag icon={<ThunderboltOutlined />} color="blue">{r}</Tag>,
                },
                {
                  title: '适配联动', key: 'action', render: (_: any, record: typeof engines[0]) => (
                    <div style={{ display: 'flex', gap: 4 }}>
                      <Tooltip title={`推荐用于${record.recommend}`}>
                        <Button type="link" size="small">详情</Button>
                      </Tooltip>
                      <Button type="link" size="small" icon={<SwapOutlined />} onClick={() => navigate('/model-adapt')}>
                        适配
                      </Button>
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

      {/* 适配兼容性概览 */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col span={24}>
          <Card title="推理引擎适配兼容性概览">
            <Row gutter={[16, 16]}>
              {engines.map(engine => (
                <Col span={6} key={engine.key}>
                  <Card size="small" style={{ border: `1px solid ${engine.status === 'running' ? '#303030' : '#1a1a1a'}`, opacity: engine.status === 'running' ? 1 : 0.5 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <span style={{ fontWeight: 600 }}>{engine.name}</span>
                      {engine.status === 'running'
                        ? <CheckCircleOutlined style={{ color: '#52c41a' }} />
                        : <CloseCircleOutlined style={{ color: '#ff4d4f' }} />}
                    </div>
                    <div style={{ fontSize: 12, color: '#a0a0a0', marginBottom: 4 }}>适配兼容性</div>
                    {engine.adaptCompatibility ? (
                      <Progress percent={engine.adaptCompatibility} size="small"
                        strokeColor={engine.adaptCompatibility >= 85 ? '#52c41a' : engine.adaptCompatibility >= 70 ? '#faad14' : '#ff4d4f'} />
                    ) : (
                      <Tag color="default">无数据</Tag>
                    )}
                    <div style={{ fontSize: 11, color: '#a0a0a0', marginTop: 8 }}>
                      推荐: {engine.recommend}
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
