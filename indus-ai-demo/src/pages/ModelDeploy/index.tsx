import { useState, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, Row, Col, Statistic, Table, Tag, Button, Progress, message } from 'antd';
import { CloudUploadOutlined, CaretRightOutlined, CheckCircleOutlined } from '@ant-design/icons';

const deployTasks = [
  { key: '1', model: 'WeldDetect-v2', target: '焊接车间-A线', status: '部署中', progress: 65, strategy: '灰度发布', replicas: 3 },
  { key: '2', model: 'AssemblyCheck-v1', target: '装配线-B线', status: '已部署', progress: 100, strategy: '全量发布', replicas: 5 },
  { key: '3', model: 'SurfaceDefect-v3', target: '打磨车间-C线', status: '待部署', progress: 0, strategy: '蓝绿部署', replicas: 2 },
  { key: '4', model: 'QualityCheck-v2', target: '质检线-D线', status: '已部署', progress: 100, strategy: '全量发布', replicas: 4 },
];

const statusColors: Record<string, string> = {
  '部署中': 'processing',
  '已部署': 'success',
  '待部署': 'default',
};

const deploySteps = [
  { key: '1', title: '模型封装', description: '将适配后模型封装为部署包' },
  { key: '2', title: '环境编译', description: '编译目标环境可执行文件' },
  { key: '3', title: '镜像生成', description: '生成容器镜像' },
  { key: '4', title: '模型下发', description: '下发模型到端边云节点' },
  { key: '5', title: '运行启动', description: '启动推理服务' },
];

const deployLogsData: Record<string, string[]> = {
  '1': ['[INFO] 开始模型封装...', '[INFO] 加载适配后模型权重', '[INFO] 模型封装完成'],
  '2': ['[INFO] 开始环境编译...', '[INFO] 检测目标环境: x86_64 + CUDA 11.8', '[INFO] 编译完成'],
  '3': ['[INFO] 开始生成镜像...', '[INFO] 构建 Docker 镜像', '[INFO] 镜像生成完成'],
  '4': ['[INFO] 开始模型下发...', '[INFO] 下发到端侧节点...', '[INFO] 下发到边缘节点...', '[INFO] 下发到云端节点...', '[INFO] 模型下发完成'],
  '5': ['[INFO] 开始启动服务...', '[INFO] 端侧推理服务启动', '[INFO] 边缘推理服务启动', '[INFO] 云端推理服务启动', '[INFO] 部署完成！'],
};

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export default function ModelDeploy() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const adaptedModel = searchParams.get('adaptedModel');

  const [isDeploying, setIsDeploying] = useState(false);
  const [deployProgress, setDeployProgress] = useState(0);
  const [deployComplete, setDeployComplete] = useState(false);
  const [currentDeployStep, setCurrentDeployStep] = useState(0);
  const [deployLogs, setDeployLogs] = useState<string[]>([]);
  const [showStrategy] = useState(!!adaptedModel);

  const startDeploy = useCallback(async () => {
    if (isDeploying) return;
    setIsDeploying(true);
    setDeployComplete(false);
    setDeployLogs([]);
    setDeployProgress(0);
    setCurrentDeployStep(0);

    for (let step = 1; step <= 5; step++) {
      setCurrentDeployStep(step);
      const stepTime = 1500;
      const stepStartTime = Date.now();

      setDeployLogs((prev) => [...prev, `[INFO] === ${deploySteps[step - 1].title} ===`]);

      while (Date.now() - stepStartTime < stepTime) {
        const elapsed = Date.now() - stepStartTime;
        const stepProgress = Math.min(100, Math.round((elapsed / stepTime) * 100));
        setDeployProgress(Math.min(100, Math.round((step - 1) * 20 + stepProgress * 0.2)));
        await delay(50);
      }

      const logs = deployLogsData[String(step)] || [];
      logs.forEach((log) => {
        setDeployLogs((prev) => [...prev, `  ${log}`]);
      });
      setDeployProgress(step * 20);
    }

    setDeployComplete(true);
    setCurrentDeployStep(0);
    setDeployProgress(100);
    setIsDeploying(false);
    message.success('部署成功！');
  }, [isDeploying]);

  const goToMonitor = useCallback(() => {
    navigate('/monitor?deployedModel=WeldDetect-v2');
  }, [navigate]);

  return (
    <div>
      <Row gutter={[16, 16]}>
        <Col span={4}><Card><Statistic title="待部署模型" value={3} /></Card></Col>
        <Col span={4}><Card><Statistic title="已部署模型" value={15} /></Card></Col>
        <Col span={4}><Card><Statistic title="部署成功率" value={98} suffix="%" valueStyle={{ color: '#52c41a' }} /></Card></Col>
        <Col span={4}><Card><Statistic title="运行中实例" value={42} /></Card></Col>
        <Col span={4}><Card><Statistic title="平均部署时长" value={1.5} suffix="分钟" /></Card></Col>
        <Col span={4}>
          <Card>
            <Statistic title="操作" />
            <Button type="primary" icon={<CloudUploadOutlined />} style={{ marginTop: 8 }}>新建部署</Button>
          </Card>
        </Col>
      </Row>

      {adaptedModel && !deployComplete && (
        <Card style={{ marginTop: 16, borderLeft: '3px solid #1677ff' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <span style={{ fontSize: 15, fontWeight: 600 }}>{adaptedModel}</span>
              <Tag color="success" style={{ marginLeft: 8 }}>已适配</Tag>
              <span style={{ color: '#a0a0a0', marginLeft: 12, fontSize: 13 }}>
                适配完成，是否立即部署到端边云？
              </span>
            </div>
            <Button type="primary" icon={<CaretRightOutlined />} onClick={startDeploy} loading={isDeploying}>
              {isDeploying ? '部署中...' : '一键部署到端边云'}
            </Button>
          </div>
        </Card>
      )}

      {showStrategy && !deployComplete && (
        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
          <Col span={24}>
            <Card title="推荐部署方案">
              <Row gutter={[16, 16]}>
                <Col span={8}>
                  <Card size="small" style={{ border: '1px solid #1677ff', background: 'rgba(22, 119, 255, 0.05)' }}>
                    <div style={{ fontSize: 18, marginBottom: 8 }}>🖥️ 端侧部署</div>
                    <div style={{ fontSize: 13, color: '#a0a0a0', marginBottom: 4 }}>轻量预检测（适配后模型）</div>
                    <div style={{ fontSize: 12, color: '#a0a0a0' }}>
                      延迟: <span style={{ color: '#52c41a' }}>15ms</span> | 精度: <span style={{ color: '#52c41a' }}>92%</span>
                    </div>
                    <div style={{ fontSize: 12, color: '#a0a0a0', marginTop: 4 }}>目标: 焊接车间-A线 边缘盒子</div>
                  </Card>
                </Col>
                <Col span={8}>
                  <Card size="small" style={{ border: '1px solid #1677ff', background: 'rgba(22, 119, 255, 0.05)' }}>
                    <div style={{ fontSize: 18, marginBottom: 8 }}>⚙️ 边缘部署</div>
                    <div style={{ fontSize: 13, color: '#a0a0a0', marginBottom: 4 }}>实时推理（适配后模型）</div>
                    <div style={{ fontSize: 12, color: '#a0a0a0' }}>
                      延迟: <span style={{ color: '#52c41a' }}>45ms</span> | 精度: <span style={{ color: '#52c41a' }}>94%</span>
                    </div>
                    <div style={{ fontSize: 12, color: '#a0a0a0', marginTop: 4 }}>目标: 车间边缘服务器</div>
                  </Card>
                </Col>
                <Col span={8}>
                  <Card size="small" style={{ border: '1px solid #303030', background: '#1a1a1a' }}>
                    <div style={{ fontSize: 18, marginBottom: 8 }}>☁️ 云端部署</div>
                    <div style={{ fontSize: 13, color: '#a0a0a0', marginBottom: 4 }}>模型训练与优化（原始模型）</div>
                    <div style={{ fontSize: 12, color: '#a0a0a0' }}>用于持续训练和版本迭代</div>
                    <div style={{ fontSize: 12, color: '#a0a0a0', marginTop: 4 }}>目标: 云端训练集群</div>
                  </Card>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>
      )}

      {isDeploying && (
        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
          <Col span={24}>
            <Card title="部署进度">
              <Progress percent={deployProgress} size="small" style={{ marginBottom: 16 }} />
              <div className="step-flow">
                {deploySteps.map((step, index) => {
                  const stepNum = index + 1;
                  const isActive = currentDeployStep === stepNum;
                  const isCompleted = currentDeployStep > stepNum || (deployComplete && stepNum <= 5);
                  return (
                    <div key={step.key} className={`step-item ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}>
                      <div className="step-number">{isCompleted ? '✓' : stepNum}</div>
                      <div className="step-content">
                        <div style={{ fontWeight: 600, marginBottom: 4 }}>
                          {step.title}
                          {isActive && <Tag color="blue" style={{ marginLeft: 8, fontSize: 11 }}>执行中...</Tag>}
                          {isCompleted && !isActive && <Tag color="success" style={{ marginLeft: 8, fontSize: 11 }}>已完成</Tag>}
                        </div>
                        <div style={{ fontSize: 12, color: '#a0a0a0' }}>{step.description}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
              {deployLogs.length > 0 && (
                <div style={{ marginTop: 12, padding: 8, background: '#0d0d0d', borderRadius: 4, maxHeight: 150, overflow: 'auto', fontFamily: 'monospace', fontSize: 12 }}>
                  {deployLogs.map((log, i) => (
                    <div key={i} style={{ color: log.includes('完成') ? '#52c41a' : log.includes('ERROR') ? '#ff4d4f' : '#a0a0a0', marginBottom: 2 }}>{log}</div>
                  ))}
                </div>
              )}
            </Card>
          </Col>
        </Row>
      )}

      {deployComplete && (
        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
          <Col span={24}>
            <Card>
              <div style={{ textAlign: 'center', padding: '24px 0' }}>
                <CheckCircleOutlined style={{ fontSize: 48, color: '#52c41a', marginBottom: 16 }} />
                <div style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>部署成功 ✓</div>
                <div style={{ color: '#a0a0a0', marginBottom: 24 }}>WeldDetect-v2 已成功部署到端边云三层节点</div>
                <Button type="primary" size="large" icon={<CaretRightOutlined />} onClick={goToMonitor}>前往监测</Button>
              </div>
            </Card>
          </Col>
        </Row>
      )}

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col span={24}>
          <Card title="部署任务列表">
            <Table
              dataSource={deployTasks}
              columns={[
                { title: '模型名称', dataIndex: 'model', key: 'model' },
                { title: '目标节点', dataIndex: 'target', key: 'target' },
                { title: '状态', dataIndex: 'status', key: 'status', render: (s: string) => <Tag color={statusColors[s]}>{s}</Tag> },
                { title: '进度', dataIndex: 'progress', key: 'progress', render: (p: number) => <Progress percent={p} size="small" /> },
                { title: '部署策略', dataIndex: 'strategy', key: 'strategy' },
                { title: '副本数', dataIndex: 'replicas', key: 'replicas' },
                { title: '操作', key: 'action', render: () => <Button type="link" size="small">详情</Button> },
              ]}
              rowKey="key"
              size="small"
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
