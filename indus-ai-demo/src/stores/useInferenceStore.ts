import { create } from 'zustand';

export interface InferenceEngine {
  key: string;
  name: string;
  version: string;
  type: string;
  status: 'running' | 'stopped';
  models: number;
  throughput: number;
  latency: number;
  arch: string;
  recommend: string;
  adaptCompatibility?: number;
}

interface InferenceState {
  engines: InferenceEngine[];
  loading: boolean;
  error: string | null;
  fetchEngines: () => Promise<void>;
}

const mockEngines: InferenceEngine[] = [
  { key: '1', name: 'TensorRT', version: '8.6', type: 'GPU加速', status: 'running', models: 8, throughput: 1250, latency: 45, arch: 'NVIDIA GPU', recommend: '视觉检测模型', adaptCompatibility: 95 },
  { key: '2', name: 'OpenVINO', version: '2024.1', type: 'CPU优化', status: 'running', models: 5, throughput: 880, latency: 62, arch: 'Intel CPU/GPU', recommend: '边缘端推理', adaptCompatibility: 88 },
  { key: '3', name: 'ONNX Runtime', version: '1.17', type: '跨平台', status: 'running', models: 6, throughput: 960, latency: 55, arch: '多架构支持', recommend: '跨平台部署', adaptCompatibility: 92 },
  { key: '4', name: 'TFLite', version: '2.14', type: '边缘端', status: 'stopped', models: 2, throughput: 0, latency: 0, arch: 'ARM/Android', recommend: '端侧轻量推理', adaptCompatibility: 78 },
];

export const useInferenceStore = create<InferenceState>((set) => ({
  engines: [],
  loading: true,
  error: null,

  fetchEngines: async () => {
    set({ loading: true, error: null });
    try {
      await new Promise((r) => setTimeout(r, 300));
      set({ engines: mockEngines, loading: false });
    } catch {
      set({ error: '加载推理引擎失败', loading: false });
    }
  },
}));
