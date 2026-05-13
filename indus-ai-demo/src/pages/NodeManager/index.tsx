import { useState } from 'react';
import { Card, Row, Col, Statistic, Table, Tag, Button, Segmented } from 'antd';
import ReactEChartsCore from 'echarts-for-react';

const nodes = [
  { key: '1', name: '焊接车间-A线', type: 'edge', status: 'online', model: 'WeldDetect-v2', cpu: 78, gpu: 92, memory: 65, network: '正常', compatibleModels: 5, adaptedProtocols: ['OPC UA', 'Modbus TCP'] },
  { key: '2', name: '装配线-B线', type: 'edge', status: 'online', model: 'AssemblyCheck-v1', cpu: 45, gpu: 67, memory: 52, network: '正常', compatibleModels: 4, adaptedProtocols: ['Profinet', 'EtherCAT'] },
  { key: '3', name: '打磨车间-C线', type: 'edge', status: 'warning', model: 'SurfaceDefect-v3', cpu: 32, gpu: 45, memory: 38, network: '不稳定', compatibleModels: 3, adaptedProtocols: ['Modbus TCP'] },
  { key: '4', name: '质检线-D线', type: 'edge', status: 'online', model: 'QualityCheck-v2', cpu: 55, gpu: 72, memory: 58, network: '正常', compatibleModels: 6, adaptedProtocols: ['OPC UA', 'Profinet'] },
  { key: '5', name: '云端推理节点', type: 'cloud', status: 'online', model: '-', cpu: 82, gpu: 95, memory: 78, network: '正常', compatibleModels: 12, adaptedProtocols: ['全部协议'] },
  { key: '6', name: '焊接相机-01', type: 'camera', status: 'online', model: 'WeldDetect-v2', cpu: 15, gpu: 0, memory: 22, network: '正常', compatibleModels: 1, adaptedProtocols: ['RTSP'] },
];

const typeColors: Record<string, string> = {
  cloud: 'blue',
  edge: 'purple',
  camera: 'cyan',
  plc: 'orange',
  robot: 'geekblue',
};

// 兼容性矩阵数据
const modelNames = ['WeldDetect-v2', 'AssemblyCheck-v1', 'SurfaceDefect-v3', 'QualityCheck-v2', 'DefectClassify-v1', 'AlignCheck-v2'];
const nodeNames = ['焊接车间-A线', '装配线-B线', '打磨车间-C线', '质检线-D线', '云端推理节点', '焊接相机-01'];

// 兼容性评分矩阵 (0-100)
const compatibilityMatrix = [
  [95, 45, 30, 20, 88, 92],  // 焊接车间-A线
  [40, 92, 35, 85, 25, 90],  // 装配线-B线
  [30, 35, 88, 25, 82, 20],  // 打磨车间-C线
  [20, 82, 28, 90, 22, 78],  // 质检线-D线
  [95, 92, 90, 88, 85, 90],  // 云端推理节点
  [88, 20, 15, 10, 85, 18],  // 焊接相机-01
];

export default function NodeManager() {
  const [matrixView, setMatrixView] = useState<string>('model');

  return (
    <div>
      <Row gutter={[16, 16]}>
        <Col span={4}><Card><Statistic title="节点总数" value={18} /></Card></Col>
        <Col span={4}><Card><Statistic title="在线节点" value={16} valueStyle={{ color: '#52c41a' }} /></Card></Col>
        <Col span={4}><Card><Statistic title="边缘节点" value={8} /></Card></Col>
        <Col span={4}><Card><Statistic title="云端节点" value={2} /></Card></Col>
        <Col span={4}><Card><Statistic title="终端设备" value={8} /></Card></Col>
        <Col span={4}><Card><Statistic title="告警节点" value={1} valueStyle={{ color: '#faad14' }} /></Card></Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col span={24}>
          <Card title="节点列表">
            <Table
              dataSource={nodes}
              columns={[
                { title: '节点名称', dataIndex: 'name', key: 'name' },
                { title: '类型', dataIndex: 'type', key: 'type', render: (t: string) => <Tag color={typeColors[t]}>{t === 'cloud' ? '云端' : t === 'edge' ? '边缘' : t === 'camera' ? '相机' : t}</Tag> },
                { title: '状态', dataIndex: 'status', key: 'status', render: (s: string) => (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span className={`status-dot ${s}`} />
                    {s === 'online' ? '在线' : s === 'warning' ? '告警' : '离线'}
                  </span>
                )},
                { title: '运行模型', dataIndex: 'model', key: 'model' },
                { title: 'CPU(%)', dataIndex: 'cpu', key: 'cpu' },
                { title: 'GPU(%)', dataIndex: 'gpu', key: 'gpu', render: (v: number) => (
                  <span style={{ color: v > 80 ? '#ff4d4f' : v > 60 ? '#faad14' : '#52c41a' }}>{v}%</span>
                )},
                { title: '内存(%)', dataIndex: 'memory', key: 'memory' },
                { title: '网络状态', dataIndex: 'network', key: 'network' },
                { title: '兼容模型数', dataIndex: 'compatibleModels', key: 'compatibleModels' },
                { title: '已适配协议', dataIndex: 'adaptedProtocols', key: 'adaptedProtocols', render: (protocols: string[]) => protocols.map(p => <Tag key={p} style={{ marginBottom: 2 }}>{p}</Tag>) },
                { title: '操作', key: 'action', render: () => <Button type="link" size="small">详情</Button> },
              ]}
              rowKey="key"
              size="small"
            />
          </Card>
        </Col>
      </Row>

      {/* 兼容性矩阵热力图 */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col span={24}>
          <Card
            title="模型-节点兼容性矩阵"
            extra={
              <Segmented
                value={matrixView}
                onChange={(v) => setMatrixView(v as string)}
                options={[
                  { value: 'model', label: '按模型' },
                  { value: 'node', label: '按节点' },
                ]}
              />
            }
          >
            <ReactEChartsCore
              option={{
                tooltip: {
                  position: 'top',
                  formatter: (params: any) => {
                    const x = matrixView === 'model' ? modelNames[params.data[1]] : nodeNames[params.data[1]];
                    const y = matrixView === 'model' ? nodeNames[params.data[0]] : modelNames[params.data[0]];
                    return `${y} × ${x}<br/>兼容度: <b>${params.data[2]}%</b>`;
                  },
                },
                grid: { left: 120, right: 40, top: 40, bottom: 80 },
                xAxis: {
                  type: 'category',
                  data: matrixView === 'model' ? modelNames : nodeNames,
                  axisLabel: { color: '#a0a0a0', fontSize: 10, rotate: 30 },
                  splitArea: { show: true },
                },
                yAxis: {
                  type: 'category',
                  data: matrixView === 'model' ? nodeNames : modelNames,
                  axisLabel: { color: '#a0a0a0', fontSize: 10 },
                  splitArea: { show: true },
                },
                visualMap: {
                  min: 0,
                  max: 100,
                  calculable: true,
                  orient: 'horizontal',
                  left: 'center',
                  bottom: 10,
                  inRange: {
                    color: ['#1a1a1a', '#1f3a5f', '#1677ff', '#52c41a'],
                  },
                  textStyle: { color: '#a0a0a0' },
                },
                series: [{
                  type: 'heatmap',
                  data: compatibilityMatrix.flatMap((row, i) =>
                    row.map((val, j) => [i, j, val])
                  ),
                  label: {
                    show: true,
                    color: '#e5e5e5',
                    fontSize: 11,
                    fontWeight: 600,
                    formatter: (params: any) => `${params.data[2]}%`,
                  },
                  emphasis: {
                    itemStyle: { shadowBlur: 10, shadowColor: 'rgba(0, 0, 0, 0.5)' },
                  },
                }],
              }}
              style={{ height: 400 }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
