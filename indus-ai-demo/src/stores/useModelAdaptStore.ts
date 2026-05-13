import { create } from 'zustand';
import type { AdaptTask, AdaptTemplate, Adapter, AdaptHistory, AdaptComparison, AdaptRecommendation, AdaptROI } from '@/types';

interface ModelAdaptState {
  tasks: AdaptTask[];
  templates: AdaptTemplate[];
  adapters: Adapter[];
  history: AdaptHistory[];
  comparison: AdaptComparison | null;
  currentTask: AdaptTask | null;
  recommendations: AdaptRecommendation[];
  roi: AdaptROI | null;

  fetchTasks: () => void;
  fetchTemplates: () => void;
  fetchAdapters: () => void;
  fetchHistory: () => void;
  fetchComparison: (taskId: string) => void;
  fetchRecommendations: () => void;
  fetchROI: () => void;
  setCurrentTask: (task: AdaptTask | null) => void;
  executeTask: (taskId: string) => void;
  rollbackTask: (taskId: string) => void;
}

const mockTasks: AdaptTask[] = [
  { id: '1', modelName: 'WeldDetect-v2', targetFactory: '焊接车间-A线', status: '待开始', compatibilityScore: 92, progress: 0, assignee: '张三', mode: 'auto', currentStep: 0 },
  { id: '2', modelName: 'AssemblyCheck-v1', targetFactory: '装配线-B线', status: '进行中', compatibilityScore: 88, progress: 45, assignee: '李四', mode: 'auto', currentStep: 2 },
  { id: '3', modelName: 'SurfaceDefect-v3', targetFactory: '打磨车间-C线', status: '已完成', compatibilityScore: 95, progress: 100, assignee: '王五', mode: 'auto', currentStep: 5 },
  { id: '4', modelName: 'QualityCheck-v2', targetFactory: '质检线-D线', status: '失败', compatibilityScore: 65, progress: 30, assignee: '赵六', mode: 'manual', currentStep: 2 },
  { id: '5', modelName: 'DefectClassify-v1', targetFactory: '焊接车间-A线', status: '待开始', compatibilityScore: 85, progress: 0, assignee: '张三', mode: 'auto', currentStep: 0 },
];

const mockTemplates: AdaptTemplate[] = [
  { id: '1', name: '焊接视觉检测模板', scene: '焊接车间', hardware: '海康相机+西门子PLC+ABB机器人', protocol: 'OPC UA', useCount: 12, successRate: 95 },
  { id: '2', name: '装配精度检测模板', scene: '装配线', hardware: '基恩士相机+三菱PLC+发那科机器人', protocol: 'Profinet', useCount: 8, successRate: 92 },
  { id: '3', name: '表面缺陷检测模板', scene: '打磨车间', hardware: 'Basler相机+欧姆龙PLC', protocol: 'Modbus TCP', useCount: 6, successRate: 88 },
  { id: '4', name: '综合质检模板', scene: '质检线', hardware: '海康相机+西门子PLC', protocol: 'OPC UA+Profinet', useCount: 15, successRate: 97 },
];

const mockAdapters: Adapter[] = [
  { id: '1', name: 'HikVision-CAM-v2', type: '相机适配器', brand: '海康威视', version: 'v2.1', useCount: 45 },
  { id: '2', name: 'Siemens-S7-v1', type: 'PLC适配器', brand: '西门子', version: 'v1.3', useCount: 38 },
  { id: '3', name: 'ABB-IRB-v3', type: '机器人适配器', brand: 'ABB', version: 'v3.0', useCount: 22 },
  { id: '4', name: 'Basler-CAM-v1', type: '相机适配器', brand: 'Basler', version: 'v1.2', useCount: 18 },
  { id: '5', name: 'Mitsubishi-FX-v2', type: 'PLC适配器', brand: '三菱', version: 'v2.0', useCount: 15 },
  { id: '6', name: 'Fanuc-Robot-v1', type: '机器人适配器', brand: '发那科', version: 'v1.1', useCount: 12 },
];

const mockHistory: AdaptHistory[] = [
  { date: '2025-12-15', modelName: 'WeldDetect-v1', targetFactory: '焊接车间-A线', result: 'success', duration: '2天' },
  { date: '2025-12-10', modelName: 'AssemblyCheck-v1', targetFactory: '装配线-B线', result: 'success', duration: '1.5天' },
  { date: '2025-12-05', modelName: 'SurfaceDefect-v2', targetFactory: '打磨车间-C线', result: 'fail', duration: '3天', failReason: '硬件不兼容' },
  { date: '2025-11-28', modelName: 'QualityCheck-v1', targetFactory: '质检线-D线', result: 'success', duration: '2天' },
  { date: '2025-11-20', modelName: 'DefectClassify-v1', targetFactory: '焊接车间-A线', result: 'success', duration: '1天' },
  { date: '2025-11-15', modelName: 'AlignCheck-v1', targetFactory: '装配线-B线', result: 'success', duration: '2.5天' },
  { date: '2025-11-10', modelName: 'PolishingCheck-v1', targetFactory: '打磨车间-C线', result: 'fail', duration: '4天', failReason: '协议不兼容' },
  { date: '2025-11-05', modelName: 'DimensionCheck-v1', targetFactory: '质检线-D线', result: 'success', duration: '1.5天' },
];

const mockRecommendations: AdaptRecommendation[] = [
  {
    id: '1', name: '推荐方案 A（高精度）', score: 94, successRate: 95, estimatedDays: 2, cost: '中',
    adapters: ['HikVision-CAM-v2', 'Siemens-S7-v1', 'ABB-IRB-v3'],
    similarScenes: [{ scene: '焊接车间-A线', similarity: 95 }, { scene: '焊接车间-B线', similarity: 88 }],
    isRecommended: true,
  },
  {
    id: '2', name: '推荐方案 B（低成本）', score: 85, successRate: 82, estimatedDays: 1.5, cost: '低',
    adapters: ['HikVision-CAM-v1', 'Modbus TCP通用'],
    similarScenes: [{ scene: '打磨车间-C线', similarity: 72 }],
    isRecommended: false,
  },
  {
    id: '3', name: '推荐方案 C（高兼容）', score: 90, successRate: 91, estimatedDays: 3, cost: '高',
    adapters: ['HikVision-CAM-v2', 'Siemens-S7-v1', 'ABB-IRB-v3', 'OPC UA+Profinet'],
    similarScenes: [{ scene: '质检线-D线', similarity: 85 }, { scene: '装配线-B线', similarity: 80 }],
    isRecommended: false,
  },
];

const mockROI: AdaptROI = {
  totalSavedCost: 1280000,
  avgAdaptDays: 2.3,
  cycleReduction: 68,
  templateReuseRate: 75,
  manualCost: 150000,
  platformCost: 35000,
  manualDays: 7,
  platformDays: 2.3,
  manualEngineers: '3名算法工程师 + 2名现场工程师',
  platformEngineers: '1名现场工程师',
};

export const useModelAdaptStore = create<ModelAdaptState>((set) => ({
  tasks: [],
  templates: [],
  adapters: [],
  history: [],
  comparison: null,
  currentTask: null,
  recommendations: [],
  roi: null,

  fetchTasks: () => set({ tasks: mockTasks }),
  fetchTemplates: () => set({ templates: mockTemplates }),
  fetchAdapters: () => set({ adapters: mockAdapters }),
  fetchHistory: () => set({ history: mockHistory }),
  fetchComparison: (_taskId: string) => {
    set({
      comparison: {
        accuracyBefore: 72,
        accuracyAfter: 94,
        latencyBefore: 180,
        latencyAfter: 65,
        hardwareCompatibleBefore: '部分兼容（2/3）',
        hardwareCompatibleAfter: '完全兼容（3/3）',
        protocolBefore: '仅 OPC UA',
        protocolAfter: 'OPC UA + Modbus TCP',
      },
    });
  },
  fetchRecommendations: () => set({ recommendations: mockRecommendations }),
  fetchROI: () => set({ roi: mockROI }),

  setCurrentTask: (task) => set({ currentTask: task }),
  executeTask: (taskId) => {
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === taskId ? { ...t, status: '进行中' as const } : t
      ),
    }));
  },
  rollbackTask: (taskId) => {
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === taskId ? { ...t, status: '待开始' as const, progress: 0, currentStep: 0 } : t
      ),
    }));
  },
}));
