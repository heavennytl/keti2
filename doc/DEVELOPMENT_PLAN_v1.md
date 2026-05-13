# 《工业模型适配与端边云协同部署运行系统》Demo 开发计划

> 基于 PRDv1.md 的实施计划
> 核心定位：解决工业模型不易用、落地频繁适配的问题
> 技术栈：React 18 + TypeScript + Vite + Ant Design + Zustand + ECharts + AntV X6 + MSW + Framer Motion

---

## 一、里程碑概览

| 里程碑 | 阶段 | 主要内容 | 预估工时 |
|--------|------|----------|----------|
| M1 | 项目初始化 | 脚手架搭建、依赖安装、目录结构、路由配置 | 1天 |
| M2 | 基础框架 | 全局布局、主题系统、Mock 数据层、公共组件 | 2天 |
| M3 | **模型适配中心** | **核心页面：适配工作流、适配模板库、对比视图** | **3天** |
| M4 | 核心页面 | 驾驶舱、模型部署中心、推理引擎中心 | 3天 |
| M5 | 核心页面 | 推理链编排中心、运行监测中心、资源调度中心 | 3天 |
| M6 | 辅助页面 | 模型仓库、节点管理 | 1天 |
| M7 | 全局增强功能 | 场景切换、推理链模板库、调度对比视图、动效集成 | 2天 |
| M8 | 联调优化 | 全流程联调、性能优化、Bug 修复 | 1天 |

**总计预估：16天**

> 相比 v1.0 计划增加 3 天，主要用于"模型适配中心"核心页面的开发。

---

## 二、详细任务分解

---

### M1：项目初始化（Day 1）

#### 1.1 脚手架搭建
- [ ] 使用 Vite 创建 React + TypeScript 项目
- [ ] 配置 tsconfig.json（严格模式、路径别名 @/）
- [ ] 配置 vite.config.ts（路径别名、代理等）

#### 1.2 安装依赖
```json
{
  "dependencies": {
    "react": "^18.x",
    "react-dom": "^18.x",
    "react-router-dom": "^6.x",
    "antd": "^5.x",
    "@ant-design/pro-layout": "^7.x",
    "@ant-design/icons": "^5.x",
    "echarts": "^5.x",
    "echarts-for-react": "^3.x",
    "@antv/x6": "^2.x",
    "@antv/x6-react-shape": "^2.x",
    "zustand": "^4.x",
    "msw": "^2.x",
    "framer-motion": "^10.x",
    "dayjs": "^1.x",
    "classnames": "^2.x"
  },
  "devDependencies": {
    "typescript": "^5.x",
    "@types/react": "^18.x",
    "@types/react-dom": "^18.x",
    "less": "^4.x",
    "@vitejs/plugin-react": "^4.x",
    "eslint": "^8.x",
    "prettier": "^3.x"
  }
}
```

#### 1.3 项目目录结构创建
- [ ] 按 PRDv1.md 4.3 节创建完整目录结构
- [ ] 创建各页面的初始文件（空组件占位）
- [ ] **特别注意：创建 ModelAdapt 目录（模型适配中心）**

#### 1.4 路由配置
- [ ] 配置 React Router v6 路由表（9个页面）
- [ ] 配置路由懒加载（React.lazy + Suspense）
- [ ] 配置 404 页面

```typescript
// 路由表示例（9个页面）
const routes = [
  { path: '/', element: <Dashboard /> },
  { path: '/model-adapt', element: <ModelAdapt /> },       // ← 新增核心页面
  { path: '/model-deploy', element: <ModelDeploy /> },
  { path: '/inference-engine', element: <InferenceEngine /> },
  { path: '/pipeline-editor', element: <PipelineEditor /> },
  { path: '/monitor', element: <Monitor /> },
  { path: '/resource-scheduler', element: <ResourceScheduler /> },
  { path: '/model-repo', element: <ModelRepo /> },
  { path: '/node-manager', element: <NodeManager /> },
];
```

---

### M2：基础框架（Day 2-3）

#### 2.1 全局布局
- [ ] 基于 Ant Design Pro Layout 实现左侧菜单布局（9个菜单项）
- [ ] 配置菜单项（含图标，模型适配中心使用 `ApiOutlined` 或 `BuildOutlined`）
- [ ] 实现顶部栏（含场景切换器占位）
- [ ] 实现面包屑导航
- [ ] 实现深色主题（自定义 Ant Design 主题变量）

#### 2.2 主题系统
- [ ] 定义全局 CSS 变量（颜色、字体、间距等）
- [ ] 配置 Ant Design 5.x 的 ConfigProvider 主题
- [ ] 实现全局样式文件（global.less）

```less
// 主题色变量示例
@primary-color: #1677ff;
@bg-color-dark: #141414;
@bg-color-card: #1f1f1f;
@text-color-primary: #e5e5e5;
@border-color: #303030;
@success-color: #52c41a;
@warning-color: #faad14;
@error-color: #ff4d4f;
```

#### 2.3 公共组件
- [ ] **LoadingState**：骨架屏组件（适配卡片、表格、图表等不同形态）
- [ ] **EmptyState**：空态组件（支持自定义图标、标题、描述、操作按钮）
- [ ] **ErrorState**：错误态组件（支持重试回调、错误信息展示）
- [ ] **PageContainer**：页面容器组件（统一处理加载/空/错误状态）
- [ ] **MetricCard**：指标卡片组件（数字滚动动画）
- [ ] **StatusBadge**：状态徽标组件（在线/离线/告警/运行中/已适配/适配中）
- [ ] **StepFlow**：步骤流程组件（用于适配工作流展示）← 新增
- [ ] **ComparisonView**：对比视图组件（适配前后/调度前后对比）← 新增

#### 2.4 Mock 数据层
- [ ] 初始化 MSW（浏览器端 Service Worker）
- [ ] 创建 Mock 数据工厂函数（生成动态数据）
- [ ] 实现所有 API handlers（参考 PRDv1.md 第7章 API 接口表）
- [ ] **重点实现适配相关 handlers**：← 新增
  - `/api/adapt/tasks` - 适配任务列表/创建
  - `/api/adapt/tasks/:id` - 适配任务详情
  - `/api/adapt/tasks/:id/execute` - 执行适配
  - `/api/adapt/templates` - 适配模板列表
  - `/api/adapt/comparison` - 适配前后对比数据
- [ ] 实现场景数据配置（正常/高负载/故障三种模式）

#### 2.5 状态管理
- [ ] 创建全局场景 Store（当前场景模式）
- [ ] **创建模型适配 Store** ← 新增
- [ ] 创建驾驶舱 Store
- [ ] 创建模型部署 Store
- [ ] 创建推理引擎 Store
- [ ] 创建推理链 Store
- [ ] 创建监测 Store
- [ ] 创建资源调度 Store

```typescript
// 模型适配 Store 示例
interface ModelAdaptStore {
  tasks: AdaptTask[];
  currentTask: AdaptTask | null;
  templates: AdaptTemplate[];
  comparison: AdaptComparison | null;
  
  fetchTasks: () => void;
  createTask: (task: CreateAdaptTaskParams) => void;
  executeTask: (taskId: string) => void;
  fetchTemplates: () => void;
  applyTemplate: (templateId: string) => void;
  fetchComparison: (taskId: string) => void;
}
```

---

### M3：模型适配中心 — 核心页面（Day 4-6）

> **这是本系统的核心页面，优先开发。**

#### 3.1 适配概览区域
- [ ] 顶部指标卡片：待适配模型数、已完成适配数、适配成功率、平均适配周期、适配模板数
- [ ] 数字滚动动画效果

#### 3.2 适配任务列表（左侧）
- [ ] 任务列表展示（模型名称、目标工厂、适配状态、兼容性评分、进度）
- [ ] 搜索/筛选功能（按状态、工厂、模型类型）
- [ ] 新建适配任务按钮 + 弹窗表单
- [ ] 任务详情查看（点击展开或弹窗）

#### 3.3 适配工作流（中间-上，核心交互区）
- [ ] **Step 1: 环境检测**
  - 展示目标产线硬件配置检测结果
  - 展示通信协议检测结果
  - 展示环境条件检测结果
  - 检测动画效果
- [ ] **Step 2: 兼容性评估**
  - 硬件兼容性评分（进度条/环形图）
  - 协议适配难度评估
  - 环境差异影响预测
  - 总体适配建议（推荐/不推荐/需调整）
- [ ] **Step 3: 适配配置**
  - 硬件适配器选择（自动推荐 + 手动切换）
  - 协议参数配置（自动填充 + 可编辑）
  - 环境补偿参数配置（图像增强、滤波等）
  - 适配方案预览
- [ ] **Step 4: 适配执行**
  - 适配进度条动画
  - 实时适配日志滚动
  - 各步骤状态标识（成功/警告/失败）
- [ ] **Step 5: 适配验证**
  - 适配前后效果对比展示
  - 精度对比、延迟对比
  - 验证结论

#### 3.4 适配方案推荐（右侧）
- [ ] 推荐适配方案卡片（硬件适配、协议适配、环境补偿）
- [ ] 方案详情展开/收起
- [ ] 多方案对比切换
- [ ] 手动调整参数功能
- [ ] "一键应用适配方案"按钮
- [ ] "保存为适配模板"按钮

#### 3.5 适配对比视图（中间-下）
- [ ] 适配前后对比表格（精度、延迟、硬件兼容性、协议适配）
- [ ] 双柱状图展示（ECharts）
- [ ] 优化幅度百分比标注
- [ ] 对比切换动画

#### 3.6 适配模板库（底部）
- [ ] 模板列表展示（4个预置模板）
- [ ] 模板详情查看
- [ ] 一键应用模板
- [ ] 基于模板创建新适配任务
- [ ] 模板评分和反馈

#### 3.7 状态处理
- [ ] 加载态：适配流程骨架屏
- [ ] 空态：无适配任务时引导
- [ ] 错误态：适配失败时步骤标红 + 错误详情 + 重试/回退
- [ ] 边界态：大量任务时分页 + 批量操作

---

### M4：核心页面 — 第一部分（Day 7-9）

#### 4.1 驾驶舱页面
- [ ] **顶部概览栏**：场景名称、在线模型数、在线节点数、告警数、**适配完成数**
- [ ] **左侧场景树**：树形结构 + 点击切换
- [ ] **中央拓扑图**（AntV X6）：
  - 绘制云/边缘/终端节点
  - 节点间连线（模型下发流、推理数据流、状态监测流、**适配数据流**）
  - 数据流动画
  - 节点状态颜色变化
  - 缩放拖拽
  - 节点点击弹窗
  - 右键菜单
  - 图例说明
- [ ] **右侧性能指标**：
  - 推理延迟折线图（ECharts）
  - GPU占用仪表盘（ECharts）
  - 带宽占用面积图（ECharts）
  - 推理吞吐量柱状图（ECharts）
- [ ] **底部推理链状态**：链式展示 + 状态标识
- [ ] **状态处理**：加载态/空态/错误态/边界态

#### 4.2 模型部署中心
- [ ] **左侧模型列表**：卡片展示 + **适配状态字段** + 搜索/筛选/上传按钮
- [ ] **中间部署策略**：端边云三层推荐展示 + 雷达图
- [ ] **右侧部署拓扑图**：节点拖拽 + 模型拖拽部署 + 部署动画
- [ ] **底部部署日志**：实时滚动日志窗口（含适配配置加载日志）
- [ ] **状态处理**：加载态/空态/错误态/边界态

#### 4.3 推理引擎中心
- [ ] **左侧模型运行列表**：当前运行模型 + 推理框架 + 设备
- [ ] **中间异构推理架构图**：CPU/GPU/NPU/FPGA 流转动画
- [ ] **右侧实时推理指标**：延迟/QPS/利用率/命中率
- [ ] **底部优化效果对比**：优化前后趋势图
- [ ] **状态处理**：加载态/空态/错误态/边界态

---

### M5：核心页面 — 第二部分（Day 10-12）

#### 5.1 推理链编排中心
- [ ] **画布区域**（AntV X6）：
  - 节点拖拽放置
  - 节点连线
  - 节点参数配置弹窗
  - 运行高亮 + 流光动画
  - 实时输出结果
- [ ] **节点面板**：5种节点类型（视觉模型/OCR/工艺决策/PLC控制/报警模块）
- [ ] **模板库侧边栏**：
  - 3个预置模板展示
  - 模板预览
  - 一键加载到画布
- [ ] **操作工具栏**：保存/运行/清空/撤销/重做
- [ ] **状态处理**：加载态/空态/错误态/边界态

#### 5.2 运行监测中心
- [ ] **左侧节点监测列表**：节点状态 + **适配状态** + 在线/告警/正常标识
- [ ] **中间实时告警**：告警列表 + 等级颜色 + 时间轴 + **适配兼容性警告**
- [ ] **右侧趋势监测图**：CPU/GPU/内存/带宽/延迟/**适配质量评分** 6个图表
- [ ] **底部系统日志**：滚动日志窗口
- [ ] **状态处理**：加载态/空态/错误态/边界态

#### 5.3 资源调度中心
- [ ] **顶部资源概览**：CPU/GPU/NPU/存储/网络 指标卡片
- [ ] **中间资源热力图**：节点负载/网络负载/GPU占用
- [ ] **右侧调度策略**：当前策略展示 + 策略切换（负载均衡/时延/能耗/成本）
- [ ] **底部动态调度事件**：事件列表 + 调度路径动画
- [ ] **调度前后对比视图**：
  - 对比表格（延迟/负载/能耗/吞吐量）
  - 双柱状图或对比折线图
- [ ] **状态处理**：加载态/空态/错误态/边界态

---

### M6：辅助页面（Day 13）

#### 6.1 模型仓库
- [ ] 模型表格（Ant Design Pro Table）
- [ ] **增加适配状态、适配目标字段**
- [ ] 搜索/筛选功能（含按适配状态筛选）
- [ ] 查看详情弹窗（含适配详情）
- [ ] 删除/发布操作
- [ ] 状态处理：加载态/空态/错误态/边界态

#### 6.2 节点管理
- [ ] 树状结构展示（云中心/边缘节点/工业终端，**显示具体型号**）
- [ ] 节点详情面板（CPU/GPU/内存/网络状态/**兼容模型数**/**已适配协议**）
- [ ] 状态处理：加载态/空态/错误态/边界态

---

### M7：增强功能（Day 14-15）

#### 7.1 模拟场景切换器
- [ ] 全局顶部栏场景切换器组件
- [ ] 三种模式：正常/高负载/故障
- [ ] 场景切换时全局 Mock 数据联动变化
- [ ] 切换动画效果

```typescript
// 场景配置示例
const scenarioConfigs = {
  normal: {
    gpuUsage: { min: 30, max: 70 },
    latency: { min: 40, max: 80 },
    alertFrequency: 0,
    nodeOffline: false,
    adaptQuality: { min: 85, max: 98 },  // 适配质量正常
  },
  highLoad: {
    gpuUsage: { min: 85, max: 98 },
    latency: { min: 90, max: 150 },
    alertFrequency: 3,
    nodeOffline: false,
    adaptQuality: { min: 70, max: 85 },  // 适配质量下降
  },
  fault: {
    gpuUsage: { min: 0, max: 30 },
    latency: { min: 200, max: 500 },
    alertFrequency: 8,
    nodeOffline: true,
    adaptQuality: { min: 30, max: 60 },  // 适配质量严重下降
  },
};
```

#### 7.2 推理链模板库
- [ ] 模板列表展示（3个预置模板）
- [ ] 模板预览功能
- [ ] 一键加载到画布
- [ ] 加载后支持二次编辑

#### 7.3 调度前后对比视图
- [ ] 对比数据表格
- [ ] 双柱状图展示
- [ ] 优化幅度百分比标注
- [ ] 切换调度策略时对比数据联动更新

#### 7.4 动效集成
- [ ] 拓扑图数据流动画（AntV X6）
- [ ] 节点告警闪烁动画（Framer Motion）
- [ ] 数字滚动动画（Framer Motion）
- [ ] 推理链流光动画（AntV X6）
- [ ] 部署状态切换动画（Framer Motion）
- [ ] **适配流程步骤流转动画（Framer Motion）** ← 新增
- [ ] **适配前后对比切换动画（Framer Motion）** ← 新增

---

### M8：联调优化（Day 16）

#### 8.1 全流程联调
- [ ] 验证所有页面 Mock 数据正常
- [ ] 验证场景切换全局联动
- [ ] **验证适配流程完整演示（环境检测→评估→配置→执行→验证）** ← 新增
- [ ] 验证推理链创建 → 保存 → 运行流程
- [ ] 验证部署流程动画
- [ ] 验证告警触发 → 调度 → 恢复演示流程

#### 8.2 性能优化
- [ ] 组件懒加载（React.lazy）
- [ ] ECharts 图表按需加载
- [ ] 拓扑图节点数量性能测试
- [ ] 动画帧率优化

#### 8.3 Bug 修复
- [ ] 路由切换状态保持
- [ ] Mock 数据定时刷新稳定性
- [ ] 页面状态切换正确性
- [ ] 浏览器兼容性测试

---

## 三、技术要点

### 3.1 状态管理架构

```
useSceneStore (全局场景)
     │
     ├── useModelAdaptStore    ← 新增（模型适配中心）
     ├── useDashboardStore
     ├── useModelDeployStore
     ├── useInferenceStore
     ├── usePipelineStore
     ├── useMonitorStore
     └── useResourceStore
```

- 场景 Store 为全局共享，场景切换时触发其他 Store 数据更新
- 各页面 Store 独立管理，通过场景 Store 的 subscribe 机制联动

### 3.2 Mock 数据架构

```
mocks/
├── handlers/
│   ├── dashboard.ts
│   ├── adapt.ts              ← 新增（适配相关 API）
│   ├── models.ts
│   ├── inference.ts
│   ├── pipelines.ts
│   ├── monitor.ts
│   ├── resources.ts
│   └── nodes.ts
├── data/
│   ├── nodes.ts
│   ├── models.ts
│   ├── alerts.ts
│   └── adapt.ts              ← 新增（适配 Mock 数据）
├── scenarios/
│   ├── normal.ts
│   ├── highLoad.ts
│   └── fault.ts
└── browser.ts
```

### 3.3 动画实现方案

| 动效 | 技术方案 |
|------|----------|
| 数据流动画 | AntV X6 Edge 动画 |
| 节点闪烁 | Framer Motion animate |
| 数字滚动 | Framer Motion useSpring |
| 流光连线 | AntV X6 Edge 样式动画 |
| 状态切换 | CSS Transition + Framer Motion |
| **适配流程步骤流转** | **Framer Motion AnimatePresence** ← 新增 |
| **适配前后对比切换** | **Framer Motion layout 动画** ← 新增 |

---

## 四、交付物清单

| 交付物 | 说明 |
|--------|------|
| 完整前端项目源码 | 包含9个页面和全部功能 |
| PRDv1.md | 优化后的 PRD 文档（核心定位：解决模型适配问题） |
| 项目启动说明 | README.md（含安装和运行步骤） |
| 演示流程说明 | 8步演示流程操作指南（从适配到部署运行） |

---

## 五、风险与应对

| 风险 | 影响 | 应对方案 |
|------|------|----------|
| AntV X6 学习成本 | 拓扑图开发周期延长 | 提前准备 X6 示例代码，复用官方 Demo |
| MSW 兼容性问题 | Mock 数据不稳定 | 准备 fallback 方案（硬编码数据） |
| 动画性能问题 | 低配机器卡顿 | 控制动画帧率，提供关闭动画选项 |
| 时间预估不足 | 延期交付 | 优先保证模型适配中心，其他页面可简化 |
| **适配流程设计过于复杂** | **Demo 实现难度大** | **聚焦 5 步流程的可视化展示，简化内部逻辑** ← 新增 |

---

## 六、开发规范

### 6.1 代码规范
- TypeScript 严格模式
- ESLint + Prettier 统一代码风格
- 组件使用函数组件 + Hooks
- 页面组件放在 `pages/` 目录下
- 公共组件放在 `components/` 目录下

### 6.2 命名规范
- 组件文件：PascalCase（如 `MetricCard.tsx`）
- 工具函数：camelCase（如 `formatTime.ts`）
- 类型定义：PascalCase + 前缀 I（如 `IModelInfo`）
- Store：camelCase + Store 后缀（如 `useSceneStore`）

### 6.3 Git 提交规范
- `feat:` 新功能
- `fix:` Bug 修复
- `docs:` 文档更新
- `refactor:` 重构
- `style:` 样式调整
- `chore:` 构建/工具链

---

## 附录：快速启动命令

```bash
# 创建项目
npm create vite@latest indus-ai-demo -- --template react-ts

# 安装依赖
cd indus-ai-demo
npm install react-router-dom antd @ant-design/pro-layout @ant-design/icons
npm install echarts echarts-for-react
npm install @antv/x6 @antv/x6-react-shape
npm install zustand msw framer-motion dayjs classnames

# 初始化 MSW
npx msw init public/

# 启动开发服务器
npm run dev
```
