import { create } from 'zustand';
import type { ScheduleStrategy, ResourceComparison } from '@/types';

export interface NodeResource {
  key: string;
  node: string;
  cpu: number;
  gpu: number;
  memory: number;
  latency: number;
  tasks: number;
  status: string;
  adaptScore: number;
}

interface ResourceState {
  nodes: NodeResource[];
  strategy: ScheduleStrategy;
  comparison: ResourceComparison | null;
  loading: boolean;
  error: string | null;
  fetchNodes: () => Promise<void>;
  setStrategy: (strategy: ScheduleStrategy) => void;
}

const mockNodes: NodeResource[] = [
  { key: '1', node: '焊接车间-A线', cpu: 67, gpu: 67, memory: 55, latency: 63, tasks: 3, status: '均衡', adaptScore: 94 },
  { key: '2', node: '装配线-B线', cpu: 52, gpu: 78, memory: 48, latency: 58, tasks: 4, status: '均衡', adaptScore: 92 },
  { key: '3', node: '打磨车间-C线', cpu: 38, gpu: 45, memory: 35, latency: 42, tasks: 2, status: '均衡', adaptScore: 65 },
  { key: '4', node: '质检线-D线', cpu: 55, gpu: 72, memory: 58, latency: 55, tasks: 3, status: '均衡', adaptScore: 88 },
];

export const useResourceStore = create<ResourceState>((set) => ({
  nodes: [],
  strategy: '负载均衡优先',
  comparison: null,
  loading: true,
  error: null,

  fetchNodes: async () => {
    set({ loading: true, error: null });
    try {
      await new Promise((r) => setTimeout(r, 300));
      set({ nodes: mockNodes, loading: false });
    } catch {
      set({ error: '加载节点资源失败', loading: false });
    }
  },

  setStrategy: (strategy: ScheduleStrategy) => {
    set({ strategy });
  },
}));
