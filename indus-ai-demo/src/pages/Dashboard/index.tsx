import { useEffect, useRef, useState } from 'react';
import { Card, Row, Col, Statistic, Tag, Modal } from 'antd';
import { useSceneStore } from '@/stores/useSceneStore';
import ReactEChartsCore from 'echarts-for-react';

// 拓扑图节点数据
interface TopoNode {
  id: string;
  label: string;
  type: 'cloud' | 'edge' | 'camera' | 'plc' | 'robot';
  status: 'online' | 'warning' | 'offline';
  x: number;
  y: number;
  detail: string;
}

interface TopoEdge {
  source: string;
  target: string;
  label: string;
}

const topoNodes: TopoNode[] = [
  // 云中心
  { id: 'cloud-1', label: '云中心\nAI训练集群', type: 'cloud', status: 'online', x: 400, y: 60, detail: 'GPU集群: 8×A100\n存储: 100TB\n状态: 正常运行' },
  { id: 'cloud-2', label: '云中心\n模型仓库', type: 'cloud', status: 'online', x: 550, y: 60, detail: '模型数: 126\n存储: 50TB\n状态: 正常运行' },

  // 边缘节点
  { id: 'edge-1', label: '焊接车间\n边缘服务器', type: 'edge', status: 'warning', x: 200, y: 200, detail: 'GPU: 92%\n延迟: 85ms\n状态: 高负载' },
  { id: 'edge-2', label: '装配线\n边缘服务器', type: 'edge', status: 'online', x: 400, y: 200, detail: 'GPU: 67%\n延迟: 62ms\n状态: 正常' },
  { id: 'edge-3', label: '质检线\n边缘服务器', type: 'edge', status: 'online', x: 600, y: 200, detail: 'GPU: 72%\n延迟: 55ms\n状态: 正常' },

  // 终端设备
  { id: 'cam-1', label: '焊接相机\nHikVision', type: 'camera', status: 'online', x: 100, y: 360, detail: '分辨率: 1920×1080\n帧率: 30fps\n协议: OPC UA' },
  { id: 'plc-1', label: '西门子PLC\nS7-1200', type: 'plc', status: 'online', x: 250, y: 360, detail: '型号: S7-1200\n协议: Profinet\n状态: 正常' },
  { id: 'robot-1', label: 'ABB机器人\nIRB-6700', type: 'robot', status: 'online', x: 400, y: 360, detail: '型号: IRB-6700\n负载: 150kg\n状态: 正常运行' },
  { id: 'cam-2', label: '质检相机\nBasler', type: 'camera', status: 'online', x: 550, y: 360, detail: '分辨率: 2592×1944\n帧率: 60fps\n协议: GigE Vision' },
  { id: 'plc-2', label: '三菱PLC\nFX5U', type: 'plc', status: 'offline', x: 700, y: 360, detail: '型号: FX5U\n协议: Modbus TCP\n状态: 离线' },
];

const topoEdges: TopoEdge[] = [
  // 云到边缘
  { source: 'cloud-1', target: 'edge-1', label: '模型下发' },
  { source: 'cloud-1', target: 'edge-2', label: '模型下发' },
  { source: 'cloud-1', target: 'edge-3', label: '模型下发' },
  { source: 'cloud-2', target: 'edge-1', label: '模型同步' },
  { source: 'cloud-2', target: 'edge-2', label: '模型同步' },
  { source: 'cloud-2', target: 'edge-3', label: '模型同步' },

  // 边缘到终端
  { source: 'edge-1', target: 'cam-1', label: '推理结果' },
  { source: 'edge-1', target: 'plc-1', label: '控制指令' },
  { source: 'edge-1', target: 'robot-1', label: '控制指令' },
  { source: 'edge-3', target: 'cam-2', label: '推理结果' },
  { source: 'edge-3', target: 'plc-2', label: '控制指令' },
];

const nodeColors: Record<string, { bg: string; border: string; text: string }> = {
  cloud: { bg: 'rgba(22, 119, 255, 0.15)', border: '#1677ff', text: '#1677ff' },
  edge: { bg: 'rgba(82, 196, 26, 0.15)', border: '#52c41a', text: '#52c41a' },
  camera: { bg: 'rgba(250, 173, 20, 0.15)', border: '#faad14', text: '#faad14' },
  plc: { bg: 'rgba(114, 46, 209, 0.15)', border: '#722ed1', text: '#722ed1' },
  robot: { bg: 'rgba(255, 77, 79, 0.15)', border: '#ff4d4f', text: '#ff4d4f' },
};

const statusColors: Record<string, string> = {
  online: '#52c41a',
  warning: '#faad14',
  offline: '#ff4d4f',
};

export default function Dashboard() {
  const { config, mode } = useSceneStore();
  const svgRef = useRef<SVGSVGElement>(null);
  const [selectedNode, setSelectedNode] = useState<TopoNode | null>(null);
  const [animOffset, setAnimOffset] = useState(0);

  // 数据流动画
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimOffset((prev) => (prev + 1) % 100);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  // 根据场景模式调整节点状态
  const getNodes = () => {
    if (mode === 'highLoad') {
      return topoNodes.map(n =>
        n.id === 'edge-1' ? { ...n, status: 'warning' as const, detail: 'GPU: 97%\n延迟: 152ms\n状态: 高负载告警' } : n
      );
    }
    if (mode === 'fault') {
      return topoNodes.map(n =>
        n.id === 'edge-1' ? { ...n, status: 'offline' as const, detail: '状态: 离线\n原因: 网络中断' } :
        n.id === 'plc-2' ? { ...n, status: 'offline' as const } : n
      );
    }
    return topoNodes;
  };

  const nodes = getNodes();

  return (
    <div>
      {/* 顶部概览 */}
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
            <Statistic title="在线节点数" value={nodes.filter(n => n.status !== 'offline').length} />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="当前告警数"
              value={config.alertFrequency}
              valueStyle={{ color: config.alertFrequency > 0 ? '#ff4d4f' : '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic title="适配完成数" value={12} />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="适配健康度"
              value={config.adaptQuality.max}
              suffix="%"
              valueStyle={{ color: '#1677ff' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 场景模式提示 */}
      {mode !== 'normal' && (
        <Card style={{ marginTop: 16, borderLeft: `3px solid ${mode === 'highLoad' ? '#faad14' : '#ff4d4f'}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Tag color={mode === 'highLoad' ? 'warning' : 'error'}>
              {mode === 'highLoad' ? '高负载模式' : '故障模式'}
            </Tag>
            <span style={{ color: '#a0a0a0', fontSize: 13 }}>
              {mode === 'highLoad' ? '系统处于高负载状态，部分节点告警' : '系统检测到节点故障'}
            </span>
          </div>
        </Card>
      )}

      {/* 拓扑图 */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col span={24}>
          <Card title="端边云拓扑图">
            <div style={{ width: '100%', height: 480, position: 'relative', overflow: 'hidden' }}>
              <svg
                ref={svgRef}
                width="100%"
                height="100%"
                viewBox="0 0 800 440"
                style={{ background: '#0d0d0d', borderRadius: 8 }}
              >
                {/* 背景网格 */}
                <defs>
                  <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1a1a1a" strokeWidth="0.5" />
                  </pattern>
                  <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
                    <polygon points="0 0, 8 3, 0 6" fill="#434343" />
                  </marker>
                </defs>
                <rect width="800" height="440" fill="url(#grid)" />

                {/* 区域标签 */}
                <text x="400" y="30" textAnchor="middle" fill="#434343" fontSize="12" fontWeight="600">☁️ 云中心</text>
                <text x="400" y="175" textAnchor="middle" fill="#434343" fontSize="12" fontWeight="600">🖥️ 边缘层</text>
                <text x="400" y="340" textAnchor="middle" fill="#434343" fontSize="12" fontWeight="600">📡 终端设备层</text>

                {/* 连线 */}
                {topoEdges.map((edge, i) => {
                  const source = nodes.find(n => n.id === edge.source);
                  const target = nodes.find(n => n.id === edge.target);
                  if (!source || !target) return null;

                  const dx = target.x - source.x;
                  const dy = target.y - source.y;
                  const dist = Math.sqrt(dx * dx + dy * dy);
                  const offsetX = (dx / dist) * 20;
                  const offsetY = (dy / dist) * 20;

                  // 数据流动画点
                  const progress = ((animOffset + i * 20) % 100) / 100;
                  const flowX = source.x + offsetX + dx * progress;
                  const flowY = source.y + offsetY + dy * progress;

                  return (
                    <g key={`edge-${i}`}>
                      {/* 连线 */}
                      <line
                        x1={source.x + offsetX}
                        y1={source.y + offsetY}
                        x2={target.x - offsetX}
                        y2={target.y - offsetY}
                        stroke="#303030"
                        strokeWidth="1.5"
                        markerEnd="url(#arrowhead)"
                      />
                      {/* 连线标签 */}
                      <text
                        x={(source.x + target.x) / 2}
                        y={(source.y + target.y) / 2 - 8}
                        textAnchor="middle"
                        fill="#434343"
                        fontSize="10"
                      >
                        {edge.label}
                      </text>
                      {/* 数据流动画 */}
                      <circle cx={flowX} cy={flowY} r="3" fill="#1677ff" opacity="0.8">
                        <animate attributeName="opacity" values="0.8;0.2;0.8" dur="1.5s" repeatCount="indefinite" />
                      </circle>
                    </g>
                  );
                })}

                {/* 节点 */}
                {nodes.map((node) => {
                  const colors = nodeColors[node.type];
                  const statusColor = statusColors[node.status];
                  return (
                    <g
                      key={node.id}
                      style={{ cursor: 'pointer' }}
                      onClick={() => setSelectedNode(node)}
                    >
                      {/* 节点背景 */}
                      <rect
                        x={node.x - 55}
                        y={node.y - 22}
                        width={110}
                        height={44}
                        rx="8"
                        fill={colors.bg}
                        stroke={node.status === 'offline' ? statusColor : colors.border}
                        strokeWidth={node.status === 'offline' ? 2 : 1.5}
                      />
                      {/* 状态指示灯 */}
                      <circle cx={node.x - 45} cy={node.y - 12} r="4" fill={statusColor}>
                        {node.status === 'warning' && (
                          <animate attributeName="opacity" values="1;0.3;1" dur="1s" repeatCount="indefinite" />
                        )}
                      </circle>
                      {/* 节点标签 */}
                      {node.label.split('\n').map((line, i) => (
                        <text
                          key={i}
                          x={node.x}
                          y={node.y - 4 + i * 16}
                          textAnchor="middle"
                          fill={node.status === 'offline' ? '#666' : '#e5e5e5'}
                          fontSize="11"
                          fontWeight={i === 0 ? 600 : 400}
                        >
                          {line}
                        </text>
                      ))}
                    </g>
                  );
                })}
              </svg>
            </div>
          </Card>
        </Col>
      </Row>

      {/* 性能图表区域 */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col span={6}>
          <Card title="GPU 利用率趋势">
            <ReactEChartsCore
              option={{
                tooltip: { trigger: 'axis' },
                grid: { left: 40, right: 10, top: 20, bottom: 25 },
                xAxis: { type: 'category', data: ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00'], axisLabel: { color: '#a0a0a0', fontSize: 10 } },
                yAxis: { type: 'value', max: 100, axisLabel: { color: '#a0a0a0', fontSize: 10 }, splitLine: { lineStyle: { color: '#1a1a1a' } } },
                series: [{
                  type: 'line', smooth: true, data: mode === 'highLoad' ? [45, 52, 68, 82, 78, 88, 97] : mode === 'fault' ? [42, 48, 55, 60, 0, 0, 0] : [42, 48, 55, 62, 58, 65, 72],
                  lineStyle: { color: '#1677ff', width: 2 },
                  areaStyle: { color: 'rgba(22, 119, 255, 0.1)' },
                  symbol: 'circle', symbolSize: 4,
                }],
              }}
              style={{ height: 180 }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card title="推理延迟趋势">
            <ReactEChartsCore
              option={{
                tooltip: { trigger: 'axis' },
                grid: { left: 40, right: 10, top: 20, bottom: 25 },
                xAxis: { type: 'category', data: ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00'], axisLabel: { color: '#a0a0a0', fontSize: 10 } },
                yAxis: { type: 'value', axisLabel: { color: '#a0a0a0', fontSize: 10 }, splitLine: { lineStyle: { color: '#1a1a1a' } } },
                series: [{
                  type: 'line', smooth: true, data: mode === 'highLoad' ? [42, 48, 58, 72, 68, 85, 152] : mode === 'fault' ? [40, 45, 52, 58, 0, 0, 0] : [42, 48, 55, 62, 58, 65, 72],
                  lineStyle: { color: '#faad14', width: 2 },
                  areaStyle: { color: 'rgba(250, 173, 20, 0.1)' },
                  symbol: 'circle', symbolSize: 4,
                }],
              }}
              style={{ height: 180 }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card title="吞吐量趋势 (FPS)">
            <ReactEChartsCore
              option={{
                tooltip: { trigger: 'axis' },
                grid: { left: 40, right: 10, top: 20, bottom: 25 },
                xAxis: { type: 'category', data: ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00'], axisLabel: { color: '#a0a0a0', fontSize: 10 } },
                yAxis: { type: 'value', axisLabel: { color: '#a0a0a0', fontSize: 10 }, splitLine: { lineStyle: { color: '#1a1a1a' } } },
                series: [{
                  type: 'bar', data: mode === 'highLoad' ? [120, 115, 105, 88, 92, 75, 65] : mode === 'fault' ? [118, 112, 108, 100, 0, 0, 0] : [120, 118, 115, 112, 118, 110, 108],
                  itemStyle: { color: '#52c41a', borderRadius: [4, 4, 0, 0] },
                }],
              }}
              style={{ height: 180 }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card title="适配健康度">
            <ReactEChartsCore
              option={{
                tooltip: { formatter: '{b}: {c}%' },
                series: [{
                  type: 'gauge',
                  startAngle: 220,
                  endAngle: -40,
                  min: 0,
                  max: 100,
                  pointer: { show: false },
                  progress: { show: true, width: 12, itemStyle: { color: { type: 'linear', x: 0, y: 0, x2: 1, y2: 0, colorStops: [{ offset: 0, color: '#1677ff' }, { offset: 1, color: '#52c41a' }] } } },
                  axisLine: { lineStyle: { width: 12, color: [[1, '#1a1a1a']] } },
                  axisTick: { show: false },
                  splitLine: { show: false },
                  axisLabel: { show: false },
                  detail: { fontSize: 24, fontWeight: 600, color: '#e5e5e5', offsetCenter: [0, '40%'] },
                  data: [{ value: config.adaptQuality.max, name: '健康度' }],
                }],
              }}
              style={{ height: 180 }}
            />
          </Card>
        </Col>
      </Row>

      {/* 节点详情弹窗 */}

      <Modal
        title={selectedNode?.label.split('\n')[0]}
        open={!!selectedNode}
        onCancel={() => setSelectedNode(null)}
        footer={null}
        width={320}
      >
        {selectedNode && (
          <div>
            <div style={{ marginBottom: 12 }}>
              <Tag color={selectedNode.status === 'online' ? 'success' : selectedNode.status === 'warning' ? 'warning' : 'error'}>
                {selectedNode.status === 'online' ? '在线' : selectedNode.status === 'warning' ? '告警' : '离线'}
              </Tag>
              <Tag color={nodeColors[selectedNode.type].border}>
                {selectedNode.type === 'cloud' ? '云中心' : selectedNode.type === 'edge' ? '边缘节点' :
                 selectedNode.type === 'camera' ? '相机' : selectedNode.type === 'plc' ? 'PLC' : '机器人'}
              </Tag>
            </div>
            {selectedNode.detail.split('\n').map((line, i) => (
              <div key={i} style={{ fontSize: 13, color: '#a0a0a0', marginBottom: 4 }}>{line}</div>
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
}
