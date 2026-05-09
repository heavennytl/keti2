import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Typography } from 'antd';
import {
  DashboardOutlined,
  ApiOutlined,
  CloudUploadOutlined,
  ThunderboltOutlined,
  ApartmentOutlined,
  MonitorOutlined,
  ScheduleOutlined,
  DatabaseOutlined,
  NodeIndexOutlined,
} from '@ant-design/icons';
import SceneSwitcher from '@/components/SceneSwitcher';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

const menuItems = [
  { key: '/', icon: <DashboardOutlined />, label: '驾驶舱' },
  { key: '/model-adapt', icon: <ApiOutlined />, label: '模型适配中心' },
  { key: '/model-deploy', icon: <CloudUploadOutlined />, label: '模型部署中心' },
  { key: '/inference-engine', icon: <ThunderboltOutlined />, label: '推理引擎中心' },
  { key: '/pipeline-editor', icon: <ApartmentOutlined />, label: '推理链编排中心' },
  { key: '/monitor', icon: <MonitorOutlined />, label: '运行监测中心' },
  { key: '/resource-scheduler', icon: <ScheduleOutlined />, label: '资源调度中心' },
  { key: '/model-repo', icon: <DatabaseOutlined />, label: '模型仓库' },
  { key: '/node-manager', icon: <NodeIndexOutlined />, label: '节点管理' },
];

export default function MainLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        width={200}
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 100,
        }}
      >
        <div style={{
          height: 48,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderBottom: '1px solid #303030',
        }}>
          <Text strong style={{ color: '#1677ff', fontSize: collapsed ? 14 : 16, whiteSpace: 'nowrap' }}>
            {collapsed ? 'IA' : '工业AI适配平台'}
          </Text>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
        />
      </Sider>
      <Layout style={{ marginLeft: collapsed ? 80 : 200, transition: 'margin-left 0.2s' }}>
        <Header
          style={{
            padding: '0 24px',
            background: '#1a1a1a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #303030',
            height: 48,
            position: 'sticky',
            top: 0,
            zIndex: 99,
          }}
        >
          <Text style={{ color: '#e5e5e5', fontSize: 14 }}>
            工业模型适配与协同运行系统
          </Text>
          <SceneSwitcher />
        </Header>
        <Content style={{ padding: 16, minHeight: 'calc(100vh - 48px)' }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
