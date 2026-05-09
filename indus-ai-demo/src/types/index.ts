// ============ 场景 ============
export type ScenarioMode = 'normal' | 'highLoad' | 'fault';

export interface ScenarioConfig {
  gpuUsage: { min: number; max: number };
  latency: { min: number; max: number };
  alertFrequency: number;
  nodeOffline: boolean;
  adaptQuality: { min: number; max: number };
}

// ============ 节点 ============
export type NodeType = 'cloud' | 'edge' | 'camera' | 'plc' | 'robot';
export type NodeStatus = 'online' | 'offline' | 'warning';

export interface NodeInfo {
  id: string;
  name: string;
  type: NodeType;
  status: NodeStatus;
  model: string;
  cpu: number;
  gpu: number;
  memory: number;
  networkStatus: string;
  compatibleModels: number;
  adaptedProtocols: string[];
}

// ============ 模型 ============
export type ModelType = '视觉检测' | '焊接检测' | '缺陷识别' | '工艺决策';
export type ModelStatus = 'running' | 'stopped' | 'error';
export type AdaptStatus = '已适配' | '适配中' | '未适配' | '失败';

export interface ModelInfo {
  id: string;
  name: string;
  type: ModelType;
  framework: string;
  version: string;
  size: string;
  adaptStatus: AdaptStatus;
  adaptTarget: string;
  deployNode: string;
  status: ModelStatus;
}

// ============ 适配 ============
export type AdaptTaskStatus = '待开始' | '进行中' | '已完成' | '失败';
export type AdaptMode = 'auto' | 'manual';

export interface AdaptTask {
  id: string;
  modelName: string;
  targetFactory: string;
  status: AdaptTaskStatus;
  compatibilityScore: number;
  progress: number;
  assignee: string;
  mode: AdaptMode;
  currentStep: number;
}

export interface AdaptTemplate {
  id: string;
  name: string;
  scene: string;
  hardware: string;
  protocol: string;
  useCount: number;
  successRate: number;
}

export interface Adapter {
  id: string;
  name: string;
  type: string;
  brand: string;
  version: string;
  useCount: number;
}

export interface AdaptHistory {
  date: string;
  modelName: string;
  targetFactory: string;
  result: 'success' | 'fail';
  duration: string;
  failReason?: string;
}

export interface AdaptComparison {
  accuracyBefore: number;
  accuracyAfter: number;
  latencyBefore: number;
  latencyAfter: number;
  hardwareCompatibleBefore: string;
  hardwareCompatibleAfter: string;
  protocolBefore: string;
  protocolAfter: string;
}

// ============ 推理链 ============
export type PipelineNodeType = 'ai' | 'logic' | 'execute' | 'output';

export interface PipelineNode {
  id: string;
  name: string;
  type: PipelineNodeType;
  config: Record<string, unknown>;
}

export interface PipelineTemplate {
  id: string;
  name: string;
  nodes: string[];
  description: string;
}

// ============ 告警 ============
export type AlertLevel = 'info' | 'warning' | 'error';

export interface Alert {
  id: string;
  message: string;
  level: AlertLevel;
  time: string;
}

// ============ 资源 ============
export type ScheduleStrategy = '负载均衡优先' | '时延优先' | '能耗优先' | '成本优先';

export interface ResourceComparison {
  latencyBefore: number;
  latencyAfter: number;
  gpuLoadBefore: number;
  gpuLoadAfter: number;
  energyBefore: number;
  energyAfter: number;
  throughputBefore: number;
  throughputAfter: number;
}

// ============ 兼容性矩阵 ============
export type CompatibilityLevel = 'full' | 'partial' | 'none';

export interface CompatibilityMatrix {
  nodeName: string;
  models: Record<string, CompatibilityLevel>;
}

// ============ 驾驶舱 ============
export interface DashboardOverview {
  scene: string;
  onlineModels: number;
  onlineNodes: number;
  alerts: number;
  adaptCompleted: number;
  adaptHealth: number;
}

export interface TopologyNode {
  id: string;
  name: string;
  type: NodeType;
  status: NodeStatus;
  x: number;
  y: number;
}

export interface TopologyEdge {
  source: string;
  target: string;
  label: string;
  type: 'deploy' | 'inference' | 'monitor' | 'adapt';
}
