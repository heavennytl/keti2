import { create } from 'zustand';

export interface DeployTask {
  key: string;
  model: string;
  target: string;
  status: '部署中' | '已部署' | '待部署';
  progress: number;
  strategy: string;
  replicas: number;
}

interface ModelDeployState {
  tasks: DeployTask[];
  loading: boolean;
  error: string | null;
  fetchTasks: () => Promise<void>;
}

const mockDeployTasks: DeployTask[] = [
  { key: '1', model: 'WeldDetect-v2', target: '焊接车间-A线', status: '部署中', progress: 65, strategy: '灰度发布', replicas: 3 },
  { key: '2', model: 'AssemblyCheck-v1', target: '装配线-B线', status: '已部署', progress: 100, strategy: '全量发布', replicas: 5 },
  { key: '3', model: 'SurfaceDefect-v3', target: '打磨车间-C线', status: '待部署', progress: 0, strategy: '蓝绿部署', replicas: 2 },
  { key: '4', model: 'QualityCheck-v2', target: '质检线-D线', status: '已部署', progress: 100, strategy: '全量发布', replicas: 4 },
];

export const useModelDeployStore = create<ModelDeployState>((set) => ({
  tasks: [],
  loading: true,
  error: null,

  fetchTasks: async () => {
    set({ loading: true, error: null });
    try {
      await new Promise((r) => setTimeout(r, 300));
      set({ tasks: mockDeployTasks, loading: false });
    } catch {
      set({ error: '加载部署任务失败', loading: false });
    }
  },
}));
