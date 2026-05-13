import { create } from 'zustand';
import type { DashboardOverview, TopologyNode, TopologyEdge } from '@/types';
import { mockDashboardOverview, mockTopoNodes, mockTopoEdges } from '@/mocks/data/dashboard';

interface DashboardState {
  overview: DashboardOverview | null;
  topoNodes: TopologyNode[];
  topoEdges: TopologyEdge[];
  loading: boolean;
  error: string | null;
  fetchOverview: () => Promise<void>;
  fetchTopology: () => Promise<void>;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  overview: null,
  topoNodes: [],
  topoEdges: [],
  loading: true,
  error: null,

  fetchOverview: async () => {
    set({ loading: true, error: null });
    try {
      await new Promise((r) => setTimeout(r, 300));
      set({ overview: mockDashboardOverview, loading: false });
    } catch {
      set({ error: '加载概览数据失败', loading: false });
    }
  },

  fetchTopology: async () => {
    try {
      await new Promise((r) => setTimeout(r, 200));
      set({ topoNodes: mockTopoNodes, topoEdges: mockTopoEdges });
    } catch {
      set({ error: '加载拓扑数据失败' });
    }
  },
}));
