import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ConfigProvider, theme } from 'antd';
import MainLayout from '@/layouts/MainLayout';
import Dashboard from '@/pages/Dashboard';
import ModelAdapt from '@/pages/ModelAdapt';
import ModelDeploy from '@/pages/ModelDeploy';
import InferenceEngine from '@/pages/InferenceEngine';
import PipelineEditor from '@/pages/PipelineEditor';
import Monitor from '@/pages/Monitor';
import ResourceScheduler from '@/pages/ResourceScheduler';
import ModelRepo from '@/pages/ModelRepo';
import NodeManager from '@/pages/NodeManager';

function App() {
  return (
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorPrimary: '#1677ff',
          colorBgContainer: '#1f1f1f',
          colorBgElevated: '#2a2a2a',
          colorBorder: '#303030',
          colorText: '#e5e5e5',
          colorTextSecondary: '#a0a0a0',
          borderRadius: 6,
        },
      }}
    >
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="model-adapt" element={<ModelAdapt />} />
            <Route path="model-deploy" element={<ModelDeploy />} />
            <Route path="inference-engine" element={<InferenceEngine />} />
            <Route path="pipeline-editor" element={<PipelineEditor />} />
            <Route path="monitor" element={<Monitor />} />
            <Route path="resource-scheduler" element={<ResourceScheduler />} />
            <Route path="model-repo" element={<ModelRepo />} />
            <Route path="node-manager" element={<NodeManager />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  );
}

export default App;
