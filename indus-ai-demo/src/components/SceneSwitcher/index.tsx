import { useSceneStore } from '@/stores/useSceneStore';
import type { ScenarioMode } from '@/types';

const scenes: { mode: ScenarioMode; label: string; icon: string }[] = [
  { mode: 'normal', label: '正常模式', icon: '🟢' },
  { mode: 'highLoad', label: '高负载模式', icon: '🟡' },
  { mode: 'fault', label: '故障模式', icon: '🔴' },
];

export default function SceneSwitcher() {
  const { mode, setMode } = useSceneStore();

  return (
    <div className="scene-switcher">
      {scenes.map((scene) => (
        <button
          key={scene.mode}
          className={`scene-btn ${mode === scene.mode ? 'active' : ''}`}
          onClick={() => setMode(scene.mode)}
        >
          {scene.icon} {scene.label}
        </button>
      ))}
    </div>
  );
}
