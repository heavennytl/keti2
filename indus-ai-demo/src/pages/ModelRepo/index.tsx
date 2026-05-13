import { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Table, Tag, Button, Progress, Tooltip, Modal, Descriptions, Tabs, Timeline } from 'antd';
import { SwapOutlined, ThunderboltOutlined, HistoryOutlined, ExperimentOutlined, DeploymentUnitOutlined, NodeIndexOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useModelRepoStore } from '@/stores/useModelRepoStore';
import ReactEChartsCore from 'echarts-for-react';
import LoadingState from '@/components/LoadingState';
import ErrorState from '@/components/ErrorState';

// 增强的模型详情数据
const modelDetails: Record<string, {
  description: string;
  inputShape: string;
  outputShape: string;
  flops: string;
  params: string;
  latency: string;
  throughput: string;
  adaptHistory: { date: string; action: string; result: string }[];
  compatibleNodes: string[];
  recommendedAdapters: string[];
}> = {
  'WeldDetect-v2': {
    description: '基于YOLOv8的焊接缺陷检测模型，支持实时焊缝质量检测',
    inputShape: '640×640×3', outputShape: '84×8400', flops: '8.2G', params: '3.0M',
    latency: '12ms', throughput: '83 FPS',
    adaptHistory: [
      { date: '2024-05-10', action: '适配HikVision-CAM-v2', result: '成功' },
      { date: '2024-05-09', action: '适配Siemens-S7-v1协议', result: '成功' },
      { date: '2024-05-08', action: '适配ABB-IRB-v3机械臂', result: '成功' },
    ],
    compatibleNodes: ['焊接车间-A线', '云端推理节点', '焊接相机-01'],
    recommendedAdapters: ['HikVision-CAM-v2', 'Siemens-S7-v1', 'ABB-IRB-v3'],
  },
  'AssemblyCheck-v1': {
    description: '基于ResNet50的装配质量检测模型，用于零部件装配正确性验证',
    inputShape: '224×224×3', outputShape: '1000', flops: '4.1G', params: '25.6M',
    latency: '8ms', throughput: '125 FPS',
    adaptHistory: [
      { date: '2024-05-08', action: '适配Basler-CAM-v1相机', result: '成功' },
      { date: '2024-05-07', action: '适配Mitsubishi-FX-v2协议', result: '成功' },
    ],
    compatibleNodes: ['装配线-B线', '云端推理节点'],
    recommendedAdapters: ['Basler-CAM-v1', 'Mitsubishi-FX-v2'],
  },
  'SurfaceDefect-v3': {
    description: '基于MobileNetV3的表面缺陷检测模型，适用于边缘端部署',
    inputShape: '320×320×3', outputShape: '21×2100', flops: '0.9G', params: '2.5M',
    latency: '5ms', throughput: '200 FPS',
    adaptHistory: [
      { date: '2024-05-06', action: '尝试适配打磨车间相机', result: '失败' },
      { date: '2024-05-05', action: '尝试适配PLC协议', result: '失败' },
    ],
    compatibleNodes: ['打磨车间-C线'],
    recommendedAdapters: ['HikVision-CAM-v2', 'Siemens-S7-v1'],
  },
  'QualityCheck-v2': {
    description: '基于ViT的质检模型，支持多类别缺陷分类与定位',
    inputShape: '384×384×3', outputShape: '1000', flops: '16.8G', params: '86.0M',
    latency: '20ms', throughput: '50 FPS',
    adaptHistory: [
      { date: '2024-05-07', action: '适配HikVision-CAM-v2', result: '成功' },
      { date: '2024-05-06', action: '适配Siemens-S7-v1协议', result: '成功' },
    ],
    compatibleNodes: ['质检线-D线', '云端推理节点'],
    recommendedAdapters: ['HikVision-CAM-v2', 'Siemens-S7-v1'],
  },
};

export default function ModelRepo() {
  const navigate = useNavigate();
  const { models, loading, error, fetchModels } = useModelRepoStore();
  const [detailModal, setDetailModal] = useState<any>(null);
  const [detailTab, setDetailTab] = useState('overview');

  useEffect(() => {
    fetchModels();
  }, [fetchModels]);

  if (loading) return <LoadingState tip="加载模型仓库数据..." fullPage />;
  if (error) return <ErrorState message={error} onRetry={fetchModels} />;

  const adaptedModels = models.filter(m => m.status === '已适配');
  const adaptingModels = models.filter(m => m.status === '适配中');
  const unadaptedModels = models.filter(m => m.status === '未适配');
  const avgScore = adaptedModels.length > 0
    ? Math.round(adaptedModels.reduce((s, m) => s + m.adaptScore, 0) / adaptedModels.length)
    : 0;

  return (
    <div>
      <Row gutter={[16, 16]}>
        <Col span={4}><Card><Statistic title="模型总数" value={models.length} /></Card></Col>
        <Col span={4}><Card><Statistic title="已适配" value={adaptedModels.length} valueStyle={{ color: '#52c41a' }} /></Card></Col>
        <Col span={4}><Card><Statistic title="适配中" value={adaptingModels.length} valueStyle={{ color: '#1677ff' }} /></Card></Col>
        <Col span={4}><Card><Statistic title="未适配" value={unadaptedModels.length} valueStyle={{ color: '#faad14' }} /></Card></Col>
        <Col span={4}><Card><Statistic title="平均适配评分" value={avgScore} suffix="%" valueStyle={{ color: avgScore >= 80 ? '#52c41a' : '#faad14' }} /></Card></Col>
        <Col span={4}>
          <Card>
            <Statistic title="操作" />
            <Button type="primary" icon={<SwapOutlined />} style={{ marginTop: 8 }} onClick={() => navigate('/model-adapt')}>
              适配中心
            </Button>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col span={24}>
          <Card title="模型列表" extra={
            <Button size="small" icon={<SwapOutlined />} onClick={() => navigate('/model-adapt')}>
              适配关联
            </Button>
          }>
            <Table
              dataSource={models}
              columns={[
                { title: '模型名称', dataIndex: 'name', key: 'name' },
                { title: '类型', dataIndex: 'type', key: 'type' },
                { title: '框架', dataIndex: 'framework', key: 'framework' },
                { title: '版本', dataIndex: 'version', key: 'version' },
                { title: '大小', dataIndex: 'size', key: 'size' },
                {
                  title: '适配状态', dataIndex: 'status', key: 'status',
                  render: (s: string) => {
                    const colorMap: Record<string, string> = { '已适配': 'success', '适配中': 'processing', '未适配': 'default', '失败': 'error' };
                    return <Tag color={colorMap[s] || 'default'}>{s}</Tag>;
                  },
                },
                { title: '适配目标', dataIndex: 'adaptTarget', key: 'adaptTarget' },
                { title: '部署节点', dataIndex: 'deployNode', key: 'deployNode' },
                {
                  title: '适配评分', dataIndex: 'adaptScore', key: 'adaptScore',
                  render: (v: number) => v > 0 ? (
                    <Tooltip title="模型适配质量评分">
                      <Progress percent={v} size="small" format={(p) => `${p}%`}
                        strokeColor={v >= 85 ? '#52c41a' : v >= 70 ? '#faad14' : '#ff4d4f'} />
                    </Tooltip>
                  ) : <Tag color="default">未评分</Tag>,
                },
                { title: '适配日期', dataIndex: 'adaptDate', key: 'adaptDate' },
                {
                  title: '操作', key: 'action', render: (_: any, record: typeof models[0]) => (
                    <div style={{ display: 'flex', gap: 4 }}>
                      <Button type="link" size="small" icon={<HistoryOutlined />} onClick={() => { setDetailModal(record); setDetailTab('overview'); }}>
                        详情
                      </Button>
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

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col span={12}>
          <Card title="适配状态分布">
            <ReactEChartsCore option={{
              tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
              series: [{
                type: 'pie',
                radius: ['40%', '70%'],
                center: ['50%', '50%'],
                data: [
                  { value: adaptedModels.length, name: '已适配', itemStyle: { color: '#52c41a' } },
                  { value: adaptingModels.length, name: '适配中', itemStyle: { color: '#1677ff' } },
                  { value: unadaptedModels.length, name: '未适配', itemStyle: { color: '#faad14' } },
                  { value: models.filter(m => m.status === '失败').length, name: '失败', itemStyle: { color: '#ff4d4f' } },
                ],
                label: { color: '#a0a0a0', fontSize: 12 },
                labelLine: { lineStyle: { color: '#434343' } },
              }],
            }} style={{ height: 300 }} />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="适配评分分布">
            <ReactEChartsCore option={{
              tooltip: { trigger: 'axis' },
              grid: { left: 40, right: 10, top: 20, bottom: 25 },
              xAxis: { type: 'category', data: models.map(m => m.name.split('-')[0]), axisLabel: { color: '#a0a0a0', fontSize: 10, rotate: 15 } },
              yAxis: { type: 'value', max: 100, axisLabel: { color: '#a0a0a0', fontSize: 10 }, splitLine: { lineStyle: { color: '#1a1a1a' } } },
              series: [{
                type: 'bar', data: models.map(m => m.adaptScore || 0),
                itemStyle: {
                  color: (params: any) => {
                    const v = params.value;
                    return v >= 85 ? '#52c41a' : v >= 70 ? '#faad14' : v > 0 ? '#ff4d4f' : '#434343';
                  },
                  borderRadius: [4, 4, 0, 0],
                },
                label: { show: true, position: 'top', color: '#a0a0a0', fontSize: 10, formatter: (p: any) => p.value > 0 ? `${p.value}%` : '-' },
              }],
            }} style={{ height: 300 }} />
          </Card>
        </Col>
      </Row>

      {/* 增强详情弹窗 */}
      <Modal title={`${detailModal?.name || ''} - 模型详情`} open={!!detailModal} onCancel={() => setDetailModal(null)}
        footer={[
          <Button key="close" onClick={() => setDetailModal(null)}>关闭</Button>,
          <Button key="adapt" type="primary" icon={<SwapOutlined />} onClick={() => { setDetailModal(null); navigate('/model-adapt'); }}>
            前往适配
          </Button>,
        ]} width={640}>
        {detailModal && (
          <div>
            <Tabs activeKey={detailTab} onChange={setDetailTab} items={[
              {
                key: 'overview',
                label: <span><ExperimentOutlined /> 概览</span>,
                children: (
                  <div>
                    <Descriptions column={2} size="small" style={{ marginBottom: 16 }}>
                      <Descriptions.Item label="模型名称">{detailModal.name}</Descriptions.Item>
                      <Descriptions.Item label="类型">{detailModal.type}</Descriptions.Item>
                      <Descriptions.Item label="框架">{detailModal.framework}</Descriptions.Item>
                      <Descriptions.Item label="当前版本">{detailModal.version}</Descriptions.Item>
                      <Descriptions.Item label="模型大小">{detailModal.size}</Descriptions.Item>
                      <Descriptions.Item label="适配状态">
                        <Tag color={detailModal.status === '已适配' ? 'success' : detailModal.status === '适配中' ? 'processing' : 'default'}>
                          {detailModal.status}
                        </Tag>
                      </Descriptions.Item>
                      <Descriptions.Item label="适配评分">
                        {detailModal.adaptScore > 0 ? `${detailModal.adaptScore}%` : '未评分'}
                      </Descriptions.Item>
                      <Descriptions.Item label="适配日期">{detailModal.adaptDate || '-'}</Descriptions.Item>
                    </Descriptions>
                    {modelDetails[detailModal.name] && (
                      <>
                        <div style={{ padding: '8px 12px', background: '#1a1a1a', borderRadius: 8, marginBottom: 12, fontSize: 13, color: '#a0a0a0' }}>
                          <ThunderboltOutlined style={{ marginRight: 4, color: '#1677ff' }} />
                          {modelDetails[detailModal.name].description}
                        </div>
                        <Descriptions column={3} size="small" style={{ marginBottom: 12 }}>
                          <Descriptions.Item label="输入尺寸">{modelDetails[detailModal.name].inputShape}</Descriptions.Item>
                          <Descriptions.Item label="输出尺寸">{modelDetails[detailModal.name].outputShape}</Descriptions.Item>
                          <Descriptions.Item label="计算量">{modelDetails[detailModal.name].flops}</Descriptions.Item>
                          <Descriptions.Item label="参数量">{modelDetails[detailModal.name].params}</Descriptions.Item>
                          <Descriptions.Item label="延迟">{modelDetails[detailModal.name].latency}</Descriptions.Item>
                          <Descriptions.Item label="吞吐量">{modelDetails[detailModal.name].throughput}</Descriptions.Item>
                        </Descriptions>
                        <div style={{ fontWeight: 600, marginBottom: 8, color: '#a0a0a0' }}>
                          <NodeIndexOutlined style={{ marginRight: 4 }} />兼容节点
                        </div>
                        <div style={{ marginBottom: 12 }}>
                          {modelDetails[detailModal.name].compatibleNodes.map((node, i) => (
                            <Tag key={i} color="green" style={{ marginBottom: 4 }}>{node}</Tag>
                          ))}
                        </div>
                        <div style={{ fontWeight: 600, marginBottom: 8, color: '#a0a0a0' }}>
                          <DeploymentUnitOutlined style={{ marginRight: 4 }} />推荐适配器
                        </div>
                        <div>
                          {modelDetails[detailModal.name].recommendedAdapters.map((adapter, i) => (
                            <Tag key={i} color="blue" style={{ marginBottom: 4 }}>{adapter}</Tag>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                ),
              },
              {
                key: 'history',
                label: <span><HistoryOutlined /> 适配历史</span>,
                children: (
                  <div>
                    <div style={{ fontWeight: 600, marginBottom: 8, color: '#a0a0a0' }}>版本历史</div>
                    {detailModal.versions?.map((v: any, i: number) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #1a1a1a' }}>
                        <div>
                          <Tag color={v.status === '当前版本' ? 'blue' : 'default'}>{v.version}</Tag>
                          <span style={{ color: '#a0a0a0', fontSize: 12 }}>{v.date}</span>
                        </div>
                        <Tag color={v.status === '当前版本' ? 'success' : 'default'}>{v.status}</Tag>
                      </div>
                    ))}
                    {modelDetails[detailModal.name]?.adaptHistory && (
                      <>
                        <div style={{ fontWeight: 600, marginTop: 16, marginBottom: 8, color: '#a0a0a0' }}>适配记录</div>
                        <Timeline
                          items={modelDetails[detailModal.name].adaptHistory.map((h: any) => ({
                            color: h.result === '成功' ? 'green' : 'red',
                            children: (
                              <div>
                                <div style={{ color: '#e5e5e5', fontSize: 13 }}>{h.action}</div>
                                <div style={{ color: '#a0a0a0', fontSize: 11 }}>
                                  {h.date} · <Tag color={h.result === '成功' ? 'success' : 'error'}>{h.result}</Tag>
                                </div>
                              </div>
                            ),
                          }))}
                        />
                      </>
                    )}
                  </div>
                ),
              },
            ]} />
          </div>
        )}
      </Modal>
    </div>
  );
}
