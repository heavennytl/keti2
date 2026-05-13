import { create } from 'zustand';

export interface Alert {
  key: string;
  time: string;
  level: 'info' | 'warning' | 'error';
  message: string;
  node: string;
  status: '未处理' | '处理中' | '已忽略' | '已处理';
  adaptRelated?: boolean;
}

export interface NodeMetric {
  key: string;
  node: string;
  cpu: number;
  gpu: number;
  memory: number;
  latency: number;
  throughput: number;
  status: 'online' | 'warning' | 'offline';
  adaptScore?: number;
}

interface MonitorState {
  alerts: Alert[];
  metrics: NodeMetric[];
  loading: boolean;
  error: string | null;
  fetchAlerts: () => Promise<void>;
  fetchMetrics: () => Promise<void>;
}

const mockAlerts: Alert[] = [
  { key: '1', time: '14:23:05', level: 'error', message: '焊接车间-A线 GPU温度过高(87°C)', node: '焊接车间-A线', status: '未处理', adaptRelated: false },
  { key: '2', time: '14:20:12', level: 'warning', message: '装配线-B线 推理延迟异常(152ms)', node: '装配线-B线', status: '处理中', adaptRelated: true },
  { key: '3', time: '14:15:33', level: 'warning', message: '打磨车间-C线 模型精度下降(72%)', node: '打磨车间-C线', status: '已忽略', adaptRelated: true },
  { key: '4', time: '14:10:00', level: 'info', message: '质检线-D线 模型部署完成', node: '质检线-D线', status: '已处理', adaptRelated: false },
  { key: '5', time: '14:05:22', level: 'error', message: '焊接车间-A线 节点离线', node: '焊接车间-A线', status: '未处理', adaptRelated: false },
  { key: '6', time: '14:00:00', level: 'warning', message: '焊接车间-A线 适配后模型精度未达标(82%)', node: '焊接车间-A线', status: '未处理', adaptRelated: true },
];

const mockMetrics: NodeMetric[] = [
  { key: '1', node: '焊接车间-A线', cpu: 78, gpu: 92, memory: 65, latency: 85, throughput: 120, status: 'warning', adaptScore: 94 },
  { key: '2', node: '装配线-B线', cpu: 45, gpu: 67, memory: 52, latency: 62, throughput: 95, status: 'online', adaptScore: 92 },
  { key: '3', node: '打磨车间-C线', cpu: 32, gpu: 45, memory: 38, latency: 48, throughput: 78, status: 'online', adaptScore: 65 },
  { key: '4', node: '质检线-D线', cpu: 55, gpu: 72, memory: 58, latency: 55, throughput: 88, status: 'online', adaptScore: 88 },
];

export const useMonitorStore = create<MonitorState>((set) => ({
  alerts: [],
  metrics: [],
  loading: true,
  error: null,

  fetchAlerts: async () => {
    set({ loading: true, error: null });
    try {
      await new Promise((r) => setTimeout(r, 300));
      set({ alerts: mockAlerts, loading: false });
    } catch {
      set({ error: '加载告警失败', loading: false });
    }
  },

  fetchMetrics: async () => {
    try {
      await new Promise((r) => setTimeout(r, 200));
      set({ metrics: mockMetrics });
    } catch {
      set({ error: '加载指标失败' });
    }
  },
}));
