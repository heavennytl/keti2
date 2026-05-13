import { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Table, Tag, Button, Progress, Tooltip, Badge, Modal } from 'antd';
import { SwapOutlined, ThunderboltOutlined, HeatMapOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useNodeStore } from '@/stores/useNodeStore';
import ReactEChartsCore from 'echarts-for-react';
import LoadingState from '@/components/LoadingState';
import ErrorState from '@/components/ErrorState';

// 兼容性矩阵数据
const modelNames = ['WeldDetect-v2', 'AssemblyCheck-v1', 'SurfaceDefect-v3', 'QualityCheck-v2', 'DefectClassify-v1', 'AlignCheck-v2'];
const nodeNames = ['焊接车间-A线', '装配线-B线', '打磨车间-C线', '质检线-D线', '云端推理节点', '焊接相机-01'];

const compatibilityMatrix: Record<string, Record<string, { level: 'full' | 'partial' | 'none'; score: number; suggestion?: string }>> = {
  '焊接车间-A线': {
    'WeldDetect-v2': { level: 'full', score: 95, suggestion: '完全兼容，推荐部署' },
    'AssemblyCheck-v1': { level: 'partial', score: 72, suggestion: '需协议适配' },
    'SurfaceDefect-v3': { level: 'none', score: 35, suggestion: '硬件不兼容' },
    'QualityCheck-v2': { level: 'partial', score: 68, suggestion: '需环境补偿' },
    'DefectClassify-v1': { level: 'full', score: 92, suggestion: '完全兼容' },
    'AlignCheck-v2': { level: 'partial', score: 78, suggestion: '需协议适配' },
  },
  '装配线-B线': {
    'WeldDetect-v2': { level: 'partial', score: 65, suggestion: '需硬件适配' },
    'AssemblyCheck-v1': { level: 'full', score: 93, suggestion: '完全兼容，推荐部署' },
    'SurfaceDefect-v3': { level: 'partial', score: 70, suggestion: '需环境补偿' },
    'QualityCheck-v2': { level: 'full', score: 88, suggestion: '完全兼容' },
    'DefectClassify-v1': { level: 'partial', score: 75, suggestion: '需协议适配' },
    'AlignCheck-v2': { level: 'full', score: 96, suggestion: '完全兼容，推荐部署' },
  },
  '打磨车间-C线': {
    'WeldDetect-v2': { level: 'none', score: 28, suggestion: '硬件不兼容' },
    'AssemblyCheck-v1': { level: 'none', score: 32, suggestion: '硬件不兼容' },
    'SurfaceDefect-v3': { level: 'full', score: 88, suggestion: '完全兼容，推荐部署' },
    'QualityCheck-v2': { level: 'partial', score: 62, suggestion: '需环境补偿' },
    'DefectClassify-v1': { level: 'none', score: 25, suggestion: '硬件不兼容' },
    'AlignCheck-v2': { level: 'partial', score: 55, suggestion: '需协议适配' },
  },
  '质检线-D线': {
    'WeldDetect-v2': { level: 'partial', score: 70, suggestion: '需协议适配' },
    'AssemblyCheck-v1': { level: 'full', score: 85, suggestion: '完全兼容' },
    'SurfaceDefect-v3': { level: 'partial', score: 72, suggestion: '需环境补偿' },
    'QualityCheck-v2': { level: 'full', score: 94, suggestion: '完全兼容，推荐部署' },
    'DefectClassify-v1': { level: 'full', score: 82, suggestion: '完全兼容' },
    'AlignCheck-v2': { level: 'partial', score: 76, suggestion: '需协议适配' },
  },
  '云端推理节点': {
    'WeldDetect-v2': { level: 'full', score: 98, suggestion: '完全兼容' },
    'AssemblyCheck-v1': { level: 'full', score: 96, suggestion: '完全兼容' },
    'SurfaceDefect-v3': { level: 'full', score: 95, suggestion: '完全兼容' },
    'QualityCheck-v2': { level: 'full', score: 97, suggestion: '完全兼容' },
    'DefectClassify-v1': { level: 'full', score: 98, suggestion: '完全兼容' },
    'AlignCheck-v2': { level: 'full', score: 96, suggestion: '完全兼容' },
  },
  '焊接相机-01': {
    'WeldDetect-v2': { level: 'full', score: 90, suggestion: '完全兼容' },
    'AssemblyCheck-v1': { level: 'none', score: 15, suggestion: '设备不适用' },
    'SurfaceDefect-v3': { level: 'none', score: 10, suggestion: '设备不适用' },
    'QualityCheck-v2': { level: 'none', score: 12, suggestion: '设备不适用' },
    'DefectClassify-v1': { level: 'partial', score: 60, suggestion: '需固件升级' },
    'AlignCheck-v2': { level: 'none', score: 8, suggestion: '设备不适用' },
  },
};

const levelColors: Record<string, string> = {
  full: '#52c41a',
  partial: '#faad14',
  none: '#ff4d4f',
};

const levelLabels: Record<string, string> = {
  full: '完全兼容',
  partial: '部分兼容',
  none: '不兼容',
};

export default function NodeManager() {
  const navigate = useNavigate();
  const { nodes, loading, error, fetchNodes } = useNodeStore();
  const [matrixModal, setMatrixModal] = useState<{ node: string; model: string; data: { level: string; score: number; suggestion?: string } } | null>(null);

  useEffect(() => {
    fetchNodes();
  }, [fetchNodes]);

  if (loading) return <LoadingState tip="加载节点数据..." fullPage />;
  if (error) return <ErrorState message={error} onRetry={fetchNodes} />;

  const onlineNodes = nodes.filter(n => n.status === 'online').length;
  const warningNodes = nodes.filter(n => n.status === 'warning').length;
  const edgeNodes = nodes.filter(n => n.type === 'edge').length;
  const cloudNodes = nodes.filter(n => n.type === 'cloud').length;
  const deviceNodes = nodes.filter(n => n.type === 'camera').length;
  const totalCompatibleModels = nodes.reduce((s, n) => s + n.compatibleModels, 0);

  return (
    <div>
      <Row gutter={[16, 16]}>
        <Col span={3}><Card><Statistic title="总节点数" value={nodes.length} /></Card></Col>
        <Col span={3}><Card><Statistic title="在线节点" value={onlineNodes} valueStyle={{ color: '#52c41a' }} /></Card></Col>
        <Col span={3}><Card><Statistic title="告警节点" value={warningNodes} valueStyle={{ color: '#faad14' }} /></Card></Col>
        <Col span={3}><Card><Statistic title="边缘节点" value={edgeNodes} /></Card></Col>
        <Col span={3}><Card><Statistic title="云节点" value={cloudNodes} /></Card></Col>
        <Col span={3}><Card><Statistic title="终端设备" value={deviceNodes} /></Card></Col>
        <Col span={3}><Card><Statistic title="兼容模型数" value={totalCompatibleModels} /></Card></Col>
        <Col span={3}>
          <Card>
            <Statistic title="操作" />
            <Button size="small" icon={<SwapOutlined />} style={{ marginTop: 8 }} onClick={() => navigate('/model-adapt')}>
              适配关联
            </Button>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col span={24}>
          <Card title="节点列表" extra={
            <Button size="small" icon={<SwapOutlined />} onClick={() => navigate('/model-adapt')}>
              适配关联
            </Button>
          }>
            <Table
              dataSource={nodes}
              columns={[
                { title: '节点名称', dataIndex: 'name', key: 'name' },
                {
                  title: '类型', dataIndex: 'type', key: 'type',
                  render: (t: string) => {
                    const colorMap: Record<string, string> = { edge: 'green', cloud: 'blue', camera: 'orange', plc: 'purple', robot: 'red' };
                    const labelMap: Record<string, string> = { edge: '边缘', cloud: '云中心', camera: '相机', plc: 'PLC', robot: '机器人' };
                    return <Tag color={colorMap[t] || 'default'}>{labelMap[t] || t}</Tag>;
                  },
                },
                {
                  title: '状态', dataIndex: 'status', key: 'status',
                  render: (s: string) => (
                    <Badge status={s === 'online' ? 'success' : s === 'warning' ? 'warning' : 'error'}
                      text={s === 'online' ? '在线' : s === 'warning' ? '告警' : '离线'} />
                  ),
                },
                { title: '运行模型', dataIndex: 'model', key: 'model' },
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
                { title: '网络状态', dataIndex: 'networkStatus', key: 'networkStatus', render: (s: string) => <Tag color={s === '正常' ? 'success' : 'warning'}>{s}</Tag> },
                { title: '兼容模型数', dataIndex: 'compatibleModels', key: 'compatibleModels' },
                {
                  title: '已适配协议', dataIndex: 'adaptedProtocols', key: 'adaptedProtocols',
                  render: (protocols: string[]) => protocols.map(p => <Tag key={p} color="blue" style={{ marginBottom: 2 }}>{p}</Tag>),
                },
                {
                  title: '操作', key: 'action', render: (_: any, _record: typeof nodes[0]) => (
                    <Button type="link" size="small" icon={<SwapOutlined />} onClick={() => navigate('/model-adapt')}>
                      适配
                    </Button>
                  ),
                },
              ]}
              rowKey="id"
              size="small"
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col span={12}>
          <Card title="节点类型分布">
            <ReactEChartsCore option={{
              tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
              series: [{
                type: 'pie',
                radius: ['40%', '70%'],
                center: ['50%', '50%'],
                data: [
                  { value: edgeNodes, name: '边缘节点', itemStyle: { color: '#52c41a' } },
                  { value: cloudNodes, name: '云中心', itemStyle: { color: '#1677ff' } },
                  { value: deviceNodes, name: '终端设备', itemStyle: { color: '#faad14' } },
                  { value: nodes.filter(n => n.type === 'plc').length, name: 'PLC', itemStyle: { color: '#722ed1' } },
                  { value: nodes.filter(n => n.type === 'robot').length, name: '机器人', itemStyle: { color: '#ff4d4f' } },
                ],
                label: { color: '#a0a0a0', fontSize: 12 },
                labelLine: { lineStyle: { color: '#434343' } },
              }],
            }} style={{ height: 300 }} />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="节点资源概览">
            <ReactEChartsCore option={{
              tooltip: { trigger: 'axis' },
              legend: { data: ['CPU', 'GPU', '内存'], textStyle: { color: '#a0a0a0' } },
              grid: { left: 40, right: 10, top: 40, bottom: 25 },
              xAxis: { type: 'category', data: nodes.map(n => n.name.split('-')[0]), axisLabel: { color: '#a0a0a0', fontSize: 10, rotate: 15 } },
              yAxis: { type: 'value', max: 100, axisLabel: { color: '#a0a0a0', fontSize: 10 }, splitLine: { lineStyle: { color: '#1a1a1a' } } },
              series: [
                { name: 'CPU', type: 'bar', data: nodes.map(n => n.cpu), itemStyle: { color: '#1677ff', borderRadius: [4, 4, 0, 0] } },
                { name: 'GPU', type: 'bar', data: nodes.map(n => n.gpu), itemStyle: { color: '#52c41a', borderRadius: [4, 4, 0, 0] } },
                { name: '内存', type: 'bar', data: nodes.map(n => n.memory), itemStyle: { color: '#faad14', borderRadius: [4, 4, 0, 0] } },
              ],
            }} style={{ height: 300 }} />
          </Card>
        </Col>
      </Row>

      {/* 兼容性矩阵热力图 */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col span={24}>
          <Card title={<span><HeatMapOutlined style={{ marginRight: 6 }} />节点×模型兼容性矩阵</span>}
            extra={
              <Button size="small" icon={<SwapOutlined />} onClick={() => navigate('/model-adapt')}>
                适配优化
              </Button>
            }>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead>
                  <tr>
                    <th style={{ padding: '8px 12px', textAlign: 'left', color: '#a0a0a0', borderBottom: '1px solid #303030', minWidth: 120 }}>节点 \\ 模型</th>
                    {modelNames.map(m => (
                      <th key={m} style={{ padding: '8px 6px', textAlign: 'center', color: '#a0a0a0', borderBottom: '1px solid #303030', minWidth: 100 }}>{m}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {nodeNames.map(node => (
                    <tr key={node}>
                      <td style={{ padding: '8px 12px', color: '#e5e5e5', borderBottom: '1px solid #1a1a1a', fontWeight: 600 }}>{node}</td>
                      {modelNames.map(model => {
                        const cell = compatibilityMatrix[node]?.[model];
                        if (!cell) return <td key={model} style={{ padding: 4, borderBottom: '1px solid #1a1a1a' }}>-</td>;
                        return (
                          <td key={model} style={{ padding: 4, borderBottom: '1px solid #1a1a1a', cursor: 'pointer' }}
                            onClick={() => setMatrixModal({ node, model, data: cell })}>
                            <Tooltip title={`${levelLabels[cell.level]} · 评分 ${cell.score}`}>
                              <div style={{
                                background: cell.level === 'full' ? 'rgba(82, 196, 26, 0.2)' : cell.level === 'partial' ? 'rgba(250, 173, 20, 0.2)' : 'rgba(255, 77, 79, 0.15)',
                                border: `1px solid ${levelColors[cell.level]}`,
                                borderRadius: 4,
                                padding: '6px 4px',
                                textAlign: 'center',
                                transition: 'all 0.2s',
                              }}
                                onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.boxShadow = `0 0 8px ${levelColors[cell.level]}40`; }}
                                onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = 'none'; }}>
                                <div style={{ fontSize: 16, fontWeight: 700, color: levelColors[cell.level] }}>{cell.score}</div>
                                <div style={{ fontSize: 10, color: '#a0a0a0', marginTop: 2 }}>{levelLabels[cell.level]}</div>
                              </div>
                            </Tooltip>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ marginTop: 12, display: 'flex', gap: 16, fontSize: 12, color: '#a0a0a0', justifyContent: 'center' }}>
              <span><span style={{ color: '#52c41a' }}>■</span> 完全兼容 (≥85分)</span>
              <span><span style={{ color: '#faad14' }}>■</span> 部分兼容 (60-84分)</span>
              <span><span style={{ color: '#ff4d4f' }}>■</span> 不兼容 ({'<'}60分)</span>
              <span style={{ color: '#666' }}>点击单元格查看详情</span>
            </div>
          </Card>
        </Col>
      </Row>

      {/* 兼容性详情弹窗 */}
      <Modal title={`${matrixModal?.node} × ${matrixModal?.model}`} open={!!matrixModal} onCancel={() => setMatrixModal(null)} footer={[
        <Button key="close" onClick={() => setMatrixModal(null)}>关闭</Button>,
        <Button key="adapt" type="primary" icon={<SwapOutlined />} onClick={() => { setMatrixModal(null); navigate('/model-adapt'); }}>
          前往适配
        </Button>,
      ]} width={400}>
        {matrixModal && (
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <div style={{ fontSize: 48, fontWeight: 700, color: levelColors[matrixModal.data.level], marginBottom: 8 }}>
              {matrixModal.data.score}<span style={{ fontSize: 18, color: '#a0a0a0' }}>分</span>
            </div>
            <Tag color={levelColors[matrixModal.data.level]} style={{ fontSize: 14, padding: '2px 12px', marginBottom: 12 }}>
              {levelLabels[matrixModal.data.level]}
            </Tag>
            {matrixModal.data.suggestion && (
              <div style={{ fontSize: 13, color: '#a0a0a0', marginTop: 8, padding: '8px 16px', background: '#1a1a1a', borderRadius: 8 }}>
                <ThunderboltOutlined style={{ marginRight: 4, color: '#faad14' }} />
                {matrixModal.data.suggestion}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
