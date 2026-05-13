import { create } from 'zustand';

export interface ModelItem {
  key: string;
  name: string;
  type: string;
  framework: string;
  version: string;
  size: string;
  status: '已适配' | '适配中' | '未适配' | '失败';
  adaptTarget: string;
  deployNode: string;
  adaptScore: number;
  adaptDate: string;
  versions?: { version: string; date: string; status: string }[];
}

interface ModelRepoState {
  models: ModelItem[];
  loading: boolean;
  error: string | null;
  fetchModels: () => Promise<void>;
}

const mockModels: ModelItem[] = [
  { key: '1', name: 'WeldDetect-v2', type: '视觉检测', framework: 'PyTorch', version: 'v2.1', size: '256MB', status: '已适配', adaptTarget: '焊接车间-A线', deployNode: '焊接车间-A线', adaptScore: 94, adaptDate: '2024-05-10',
    versions: [{ version: 'v1.0', date: '2024-01-15', status: '已归档' }, { version: 'v2.0', date: '2024-03-20', status: '已归档' }, { version: 'v2.1', date: '2024-05-10', status: '当前版本' }] },
  { key: '2', name: 'AssemblyCheck-v1', type: '视觉检测', framework: 'TensorFlow', version: 'v1.3', size: '180MB', status: '已适配', adaptTarget: '装配线-B线', deployNode: '装配线-B线', adaptScore: 92, adaptDate: '2024-05-08',
    versions: [{ version: 'v1.0', date: '2024-02-01', status: '已归档' }, { version: 'v1.3', date: '2024-05-08', status: '当前版本' }] },
  { key: '3', name: 'SurfaceDefect-v3', type: '缺陷识别', framework: 'PyTorch', version: 'v3.0', size: '320MB', status: '适配中', adaptTarget: '打磨车间-C线', deployNode: '-', adaptScore: 65, adaptDate: '-',
    versions: [{ version: 'v2.0', date: '2024-03-10', status: '已归档' }, { version: 'v3.0', date: '2024-05-01', status: '当前版本' }] },
  { key: '4', name: 'QualityCheck-v2', type: '工艺决策', framework: 'ONNX', version: 'v2.0', size: '150MB', status: '未适配', adaptTarget: '-', deployNode: '-', adaptScore: 0, adaptDate: '-',
    versions: [{ version: 'v1.0', date: '2024-01-20', status: '已归档' }, { version: 'v2.0', date: '2024-04-15', status: '当前版本' }] },
  { key: '5', name: 'DefectClassify-v1', type: '缺陷识别', framework: 'PyTorch', version: 'v1.2', size: '210MB', status: '已适配', adaptTarget: '焊接车间-A线', deployNode: '焊接车间-A线', adaptScore: 88, adaptDate: '2024-05-06',
    versions: [{ version: 'v1.0', date: '2024-02-15', status: '已归档' }, { version: 'v1.2', date: '2024-05-06', status: '当前版本' }] },
  { key: '6', name: 'AlignCheck-v2', type: '视觉检测', framework: 'TensorFlow', version: 'v2.0', size: '195MB', status: '已适配', adaptTarget: '装配线-B线', deployNode: '装配线-B线', adaptScore: 91, adaptDate: '2024-05-07',
    versions: [{ version: 'v1.0', date: '2024-03-01', status: '已归档' }, { version: 'v2.0', date: '2024-05-07', status: '当前版本' }] },
];

export const useModelRepoStore = create<ModelRepoState>((set) => ({
  models: [],
  loading: true,
  error: null,

  fetchModels: async () => {
    set({ loading: true, error: null });
    try {
      await new Promise((r) => setTimeout(r, 300));
      set({ models: mockModels, loading: false });
    } catch {
      set({ error: '加载模型列表失败', loading: false });
    }
  },
}));
