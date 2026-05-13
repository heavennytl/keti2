import { create } from 'zustand';

export interface Pipeline {
  key: string;
  name: string;
  nodes: number;
  status: 'running' | 'stopped';
  models: string[];
  latency: number;
  throughput: number;
}

export interface PipelineTemplate {
  key: string;
  name: string;
  nodes: string[];
  description: string;
}

interface PipelineState {
  pipelines: Pipeline[];
  templates: PipelineTemplate[];
  savedPipelines: string[];
  loading: boolean;
  error: string | null;
  fetchPipelines: () => Promise<void>;
  fetchTemplates: () => Promise<void>;
  savePipeline: (name: string) => void;
  clearCanvas: () => void;
}

const mockPipelines: Pipeline[] = [
  { key: '1', name: '焊接质量检测链', nodes: 5, status: 'running', models: ['WeldDetect-v2', 'DefectClassify-v1'], latency: 120, throughput: 85 },
  { key: '2', name: '装配精度检测链', nodes: 4, status: 'running', models: ['AssemblyCheck-v1', 'AlignCheck-v2'], latency: 95, throughput: 110 },
  { key: '3', name: '表面缺陷检测链', nodes: 6, status: 'stopped', models: ['SurfaceDefect-v3', 'PolishingCheck-v1'], latency: 0, throughput: 0 },
  { key: '4', name: '综合质检链', nodes: 7, status: 'running', models: ['QualityCheck-v2', 'DimensionCheck-v1', 'AppearanceCheck-v2'], latency: 180, throughput: 55 },
];

const mockTemplates: PipelineTemplate[] = [
  { key: '1', name: '视觉检测标准链', nodes: ['图像采集', '预处理', 'AI推理', '结果判定', '输出'], description: '适用于通用视觉检测场景' },
  { key: '2', name: '多模型融合链', nodes: ['图像采集', '模型A推理', '模型B推理', '融合分析', '结果输出'], description: '适用于多模型协同推理场景' },
  { key: '3', name: '端到端质检链', nodes: ['信号采集', '预处理', 'AI推理', '逻辑判定', '执行控制', '结果反馈'], description: '适用于完整质检流程' },
];

export const usePipelineStore = create<PipelineState>((set) => ({
  pipelines: [],
  templates: [],
  savedPipelines: [],
  loading: true,
  error: null,

  fetchPipelines: async () => {
    set({ loading: true, error: null });
    try {
      await new Promise((r) => setTimeout(r, 300));
      set({ pipelines: mockPipelines, loading: false });
    } catch {
      set({ error: '加载推理链失败', loading: false });
    }
  },

  fetchTemplates: async () => {
    try {
      await new Promise((r) => setTimeout(r, 200));
      set({ templates: mockTemplates });
    } catch {
      set({ error: '加载模板失败' });
    }
  },

  savePipeline: (name: string) => {
    set((state) => ({ savedPipelines: [...state.savedPipelines, name] }));
  },

  clearCanvas: () => {
    set({ savedPipelines: [] });
  },
}));
