import { create } from 'zustand';
import type { NodeInfo } from '@/types';

interface NodeState {
  nodes: NodeInfo[];
  loading: boolean;
  error: string | null;
  fetchNodes: () => Promise<void>;
}

const mockNodes: NodeInfo[] = [
  { id: '1', name: '焊接车间-A线', type: 'edge', status: 'online', model: 'WeldDetect-v2', cpu: 78, gpu: 92, memory: 65, networkStatus: '正常', compatibleModels: 5, adaptedProtocols: ['OPC UA', 'Modbus TCP'] },
  { id: '2', name: '装配线-B线', type: 'edge', status: 'online', model: 'AssemblyCheck-v1', cpu: 45, gpu: 67, memory: 52, networkStatus: '正常', compatibleModels: 4, adaptedProtocols: ['Profinet', 'EtherCAT'] },
  { id: '3', name: '打磨车间-C线', type: 'edge', status: 'warning', model: 'SurfaceDefect-v3', cpu: 32, gpu: 45, memory: 38, networkStatus: '不稳定', compatibleModels: 3, adaptedProtocols: ['Modbus TCP'] },
  { id: '4', name: '质检线-D线', type: 'edge', status: 'online', model: 'QualityCheck-v2', cpu: 55, gpu: 72, memory: 58, networkStatus: '正常', compatibleModels: 6, adaptedProtocols: ['OPC UA', 'Profinet'] },
  { id: '5', name: '云端推理节点', type: 'cloud', status: 'online', model: '-', cpu: 82, gpu: 95, memory: 78, networkStatus: '正常', compatibleModels: 12, adaptedProtocols: ['全部协议'] },
  { id: '6', name: '焊接相机-01', type: 'camera', status: 'online', model: 'WeldDetect-v2', cpu: 15, gpu: 0, memory: 22, networkStatus: '正常', compatibleModels: 1, adaptedProtocols: ['RTSP'] },
];

export const useNodeStore = create<NodeState>((set) => ({
  nodes: [],
  loading: true,
  error: null,

  fetchNodes: async () => {
    set({ loading: true, error: null });
    try {
      await new Promise((r) => setTimeout(r, 300));
      set({ nodes: mockNodes, loading: false });
    } catch {
      set({ error: '加载节点列表失败', loading: false });
    }
  },
}));
