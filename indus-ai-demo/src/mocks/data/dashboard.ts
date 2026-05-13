import type { DashboardOverview, TopologyNode, TopologyEdge } from '@/types';

export const mockDashboardOverview: DashboardOverview = {
  scene: '焊接车间',
  onlineModels: 26,
  onlineNodes: 9,
  alerts: 0,
  adaptCompleted: 12,
  adaptHealth: 94,
};

export const mockTopoNodes: TopologyNode[] = [
  { id: 'cloud-1', name: '云中心AI训练集群', type: 'cloud', status: 'online', x: 400, y: 60 },
  { id: 'cloud-2', name: '云中心模型仓库', type: 'cloud', status: 'online', x: 550, y: 60 },
  { id: 'edge-1', name: '焊接车间边缘服务器', type: 'edge', status: 'warning', x: 200, y: 200 },
  { id: 'edge-2', name: '装配线边缘服务器', type: 'edge', status: 'online', x: 400, y: 200 },
  { id: 'edge-3', name: '质检线边缘服务器', type: 'edge', status: 'online', x: 600, y: 200 },
  { id: 'cam-1', name: '焊接相机HikVision', type: 'camera', status: 'online', x: 100, y: 360 },
  { id: 'plc-1', name: '西门子PLCS7-1200', type: 'plc', status: 'online', x: 250, y: 360 },
  { id: 'robot-1', name: 'ABB机器人IRB-6700', type: 'robot', status: 'online', x: 400, y: 360 },
  { id: 'cam-2', name: '质检相机Basler', type: 'camera', status: 'online', x: 550, y: 360 },
  { id: 'plc-2', name: '三菱PLCFX5U', type: 'plc', status: 'offline', x: 700, y: 360 },
];

export const mockTopoEdges: TopologyEdge[] = [
  { source: 'cloud-1', target: 'edge-1', label: '模型下发', type: 'deploy' },
  { source: 'cloud-1', target: 'edge-2', label: '模型下发', type: 'deploy' },
  { source: 'cloud-1', target: 'edge-3', label: '模型下发', type: 'deploy' },
  { source: 'cloud-2', target: 'edge-1', label: '模型同步', type: 'adapt' },
  { source: 'cloud-2', target: 'edge-2', label: '模型同步', type: 'adapt' },
  { source: 'cloud-2', target: 'edge-3', label: '模型同步', type: 'adapt' },
  { source: 'edge-1', target: 'cam-1', label: '推理结果', type: 'inference' },
  { source: 'edge-1', target: 'plc-1', label: '控制指令', type: 'monitor' },
  { source: 'edge-1', target: 'robot-1', label: '控制指令', type: 'monitor' },
  { source: 'edge-3', target: 'cam-2', label: '推理结果', type: 'inference' },
  { source: 'edge-3', target: 'plc-2', label: '控制指令', type: 'monitor' },
];
