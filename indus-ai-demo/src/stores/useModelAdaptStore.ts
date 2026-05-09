import { create } from 'zustand';
import type { AdaptTask, AdaptTemplate, Adapter, AdaptHistory, AdaptComparison } from '@/types';

interface ModelAdaptStore {
  tasks: AdaptTask[];
  currentTask: AdaptTask | null;
  templates: AdaptTemplate[];
  adapters: Adapter[];
  history: AdaptHistory[];
  comparison: AdaptComparison | null;

  fetchTasks: () => void;
  createTask: (task: Partial<AdaptTask>) => void;
  setCurrentTask: (task: AdaptTask | null) => void;
  executeTask: (taskId: string) => void;
  rollbackTask: (taskId: string) => void;
  fetchTemplates: () => void;
  applyTemplate: (templateId: string) => void;
  fetchAdapters: () => void;
  fetchHistory: () => void;
  fetchComparison: (taskId: string) => void;
}

export const useModelAdaptStore = create<ModelAdaptStore>((set) => ({
  tasks: [],
  currentTask: null,
  templates: [],
  adapters: [],
  history: [],
  comparison: null,

  fetchTasks: () => {
    // Mock data
    const mockTasks: AdaptTask[] = [
      { id: '1', modelName: 'WeldDetect-v2', targetFactory: '焊接车间-A线', status: '进行中', compatibilityScore: 85, progress: 60, assignee: '张三', mode: 'auto', currentStep: 3 },
      { id: '2', modelName: 'AssemblyCheck-v1', targetFactory: '装配线-B线', status: '已完成', compatibilityScore: 92, progress: 100, assignee: '李四', mode: 'auto', currentStep: 5 },
      { id: '3', modelName: 'SurfaceDefect-v3', targetFactory: '打磨车间-C线', status: '失败', compatibilityScore: 45, progress: 30, assignee: '王五', mode: 'manual', currentStep: 2 },
      { id: '4', modelName: 'QualityCheck-v2', targetFactory: '质检线-D线', status: '待开始', compatibilityScore: 78, progress: 0, assignee: '赵六', mode: 'auto', currentStep: 0 },
    ];
    set({ tasks: mockTasks });
  },

  createTask: (task) => {
    set((state) => ({
      tasks: [...state.tasks, { id: String(Date.now()), ...task } as AdaptTask],
    }));
  },

  setCurrentTask: (task) => {
    set({ currentTask: task });
  },

  executeTask: (taskId) => {
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === taskId ? { ...t, status: '进行中' as const, progress: 10 } : t
      ),
    }));
  },

  rollbackTask: (taskId) => {
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === taskId ? { ...t, currentStep: Math.max(0, t.currentStep - 1) } : t
      ),
    }));
  },

  fetchTemplates: () => {
    const mockTemplates: AdaptTemplate[] = [
      { id: '1', name: '焊接线标准适配', scene: '白车身焊接', hardware: '海康相机+西门子PLC+ABB机器人', protocol: 'OPC UA', useCount: 15, successRate: 95 },
      { id: '2', name: '装配线标准适配', scene: '零部件装配', hardware: '基恩士PLC+发那科机器人', protocol: 'Profinet', useCount: 8, successRate: 90 },
      { id: '3', name: '打磨车间适配', scene: '表面打磨', hardware: '海康相机+三菱PLC', protocol: 'Modbus TCP', useCount: 5, successRate: 88 },
      { id: '4', name: '质检通用适配', scene: '通用质检', hardware: '多品牌兼容', protocol: '多协议兼容', useCount: 20, successRate: 92 },
    ];
    set({ templates: mockTemplates });
  },

  applyTemplate: (templateId) => {
    // In demo, just log
    console.log(`Applied template: ${templateId}`);
  },

  fetchAdapters: () => {
    const mockAdapters: Adapter[] = [
      { id: '1', name: 'HikVision-CAM-v2', type: '相机适配器', brand: '海康威视', version: 'v2.1', useCount: 25 },
      { id: '2', name: 'Siemens-S7-v1', type: 'PLC适配器', brand: '西门子', version: 'v1.3', useCount: 18 },
      { id: '3', name: 'ABB-IRB-v3', type: '机器人适配器', brand: 'ABB', version: 'v3.0', useCount: 12 },
      { id: '4', name: 'Modbus-TCP-v2', type: '协议适配器', brand: '通用', version: 'v2.0', useCount: 30 },
      { id: '5', name: 'OPC-UA-v1', type: '协议适配器', brand: '通用', version: 'v1.5', useCount: 22 },
      { id: '6', name: 'Fanuc-Robot-v2', type: '机器人适配器', brand: '发那科', version: 'v2.1', useCount: 8 },
    ];
    set({ adapters: mockAdapters });
  },

  fetchHistory: () => {
    const mockHistory: AdaptHistory[] = [
      { date: '2026-05-08', modelName: 'WeldDetect-v2', targetFactory: '焊接车间-A线', result: 'success', duration: '2.1天' },
      { date: '2026-05-06', modelName: 'AssemblyCheck-v1', targetFactory: '装配线-B线', result: 'success', duration: '1.8天' },
      { date: '2026-05-03', modelName: 'SurfaceDefect-v3', targetFactory: '打磨车间-C线', result: 'fail', duration: '0.5天', failReason: '硬件不兼容' },
      { date: '2026-04-28', modelName: 'QualityCheck-v2', targetFactory: '质检线-D线', result: 'success', duration: '3.2天' },
    ];
    set({ history: mockHistory });
  },

  fetchComparison: () => {
    const mockComparison: AdaptComparison = {
      accuracyBefore: 72,
      accuracyAfter: 94,
      latencyBefore: 180,
      latencyAfter: 65,
      hardwareCompatibleBefore: '不兼容',
      hardwareCompatibleAfter: '完全兼容',
      protocolBefore: '不支持',
      protocolAfter: '自动适配',
    };
    set({ comparison: mockComparison });
  },
}));
