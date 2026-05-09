import { create } from 'zustand';
import type { ScenarioMode, ScenarioConfig } from '@/types';

const scenarioConfigs: Record<ScenarioMode, ScenarioConfig> = {
  normal: {
    gpuUsage: { min: 30, max: 70 },
    latency: { min: 40, max: 80 },
    alertFrequency: 0,
    nodeOffline: false,
    adaptQuality: { min: 85, max: 98 },
  },
  highLoad: {
    gpuUsage: { min: 85, max: 98 },
    latency: { min: 90, max: 150 },
    alertFrequency: 3,
    nodeOffline: false,
    adaptQuality: { min: 70, max: 85 },
  },
  fault: {
    gpuUsage: { min: 0, max: 30 },
    latency: { min: 200, max: 500 },
    alertFrequency: 8,
    nodeOffline: true,
    adaptQuality: { min: 30, max: 60 },
  },
};

interface SceneStore {
  mode: ScenarioMode;
  config: ScenarioConfig;
  setMode: (mode: ScenarioMode) => void;
}

export const useSceneStore = create<SceneStore>((set) => ({
  mode: 'normal',
  config: scenarioConfigs.normal,
  setMode: (mode: ScenarioMode) => {
    set({ mode, config: scenarioConfigs[mode] });
  },
}));
