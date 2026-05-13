# 工业模型适配与协同运行系统 (Demo)

> **让工业AI模型适配工作自动化、可复用、可对比，大幅降低模型落地成本**

## 📋 项目简介

本系统是一个面向离散制造场景的工业AI模型**适配**与协同运行平台Demo，核心解决工业模型"不易用、落地频繁适配"的痛点。

### 核心能力

| 能力 | 说明 |
|------|------|
| 🔧 **智能适配** | 模型与目标环境的自动兼容性评估与适配，支持自动/手动两种模式 |
| 📦 **智能部署** | 适配后的模型一键部署到端边云三层节点 |
| ⚡ **推理引擎** | 异构硬件上的推理优化（TensorRT、OpenVINO、ONNX Runtime等） |
| 🔗 **推理链编排** | 工业AI推理链可视化拖拽编排（AntV X6） |
| 📊 **运行监测** | 适配后的系统运行状态实时监测，场景模式切换（正常/高负载/故障） |
| 🔄 **资源调度** | 基于负载的动态资源调度，支持多种调度策略 |
| 🗃️ **模型仓库** | 统一管理工业AI模型，含适配状态跟踪 |
| 📡 **节点管理** | 端边云节点管理，含兼容性矩阵热力图 |

## 🖥️ 页面一览

| 页面 | 路由 | 说明 |
|------|------|------|
| 驾驶舱 | `/` | 端边云拓扑图 + 实时性能指标 |
| 模型适配中心 | `/model-adapt` | **核心页面**：5步适配工作流 + 适配前后对比 |
| 模型部署中心 | `/model-deploy` | 一键部署到端边云 + 部署策略推荐 |
| 推理引擎中心 | `/inference-engine` | 异构推理引擎管理 |
| 推理链编排中心 | `/pipeline-editor` | 可视化拖拽编排画布 |
| 运行监测中心 | `/monitor` | 实时告警 + 节点运行指标 |
| 资源调度中心 | `/resource-scheduler` | 自动调度 + 调度前后对比 |
| 模型仓库 | `/model-repo` | 模型列表 + 适配状态管理 |
| 节点管理 | `/node-manager` | 节点列表 + 兼容性矩阵 |

## 🛠️ 技术栈

| 技术 | 用途 |
|------|------|
| React 19 | 前端框架 |
| TypeScript 6 | 开发语言（严格模式） |
| Vite 8 | 构建工具（HMR热更新） |
| Ant Design 5 | UI组件库（深色主题） |
| Zustand 5 | 状态管理 |
| React Router 7 | 路由方案 |
| ECharts 6 | 图表可视化 |
| AntV X6 3 | 拓扑图/流程编排画布 |
| MSW 2 | Mock数据层 |
| Framer Motion 12 | 动画 |

## 🚀 快速开始

```bash
# 1. 进入项目目录
cd indus-ai-demo

# 2. 安装依赖
npm install

# 3. 启动开发服务器
npm run dev

# 4. 打开浏览器访问
# http://localhost:5173
```

## 📦 可用命令

| 命令 | 说明 |
|------|------|
| `npm run dev` | 启动开发服务器（热更新） |
| `npm run build` | 构建生产版本 |
| `npm run preview` | 预览生产构建 |
| `npm run lint` | ESLint代码检查 |

## 🎬 演示流程（6步，约5分钟）

```
驾驶舱 → 适配中心（一键适配）→ 部署中心（一键部署）
→ 监测中心（切换高负载场景）→ 调度中心（自动调度）
→ 驾驶舱（查看优化后状态）
```

### 场景切换

页面顶部提供三种场景模式切换：

| 模式 | 说明 |
|------|------|
| 🟢 正常模式 | 系统正常运行，指标平稳 |
| 🟡 高负载模式 | GPU负载升高，延迟增加，告警增多 |
| 🔴 故障模式 | 节点离线，大量告警，触发自动调度 |

## 📁 项目结构

```
indus-ai-demo/
├── public/                  # 静态资源
├── src/
│   ├── api/                 # API接口定义
│   ├── components/          # 公共组件
│   │   ├── LoadingState/    # 加载态组件
│   │   ├── EmptyState/      # 空态组件
│   │   ├── ErrorState/      # 错误态组件
│   │   └── SceneSwitcher/   # 场景切换器
│   ├── layouts/             # 布局组件
│   │   └── MainLayout.tsx   # 主布局（侧边栏+顶栏）
│   ├── pages/               # 9个页面
│   │   ├── Dashboard/       # 驾驶舱
│   │   ├── ModelAdapt/      # 模型适配中心
│   │   ├── ModelDeploy/     # 模型部署中心
│   │   ├── InferenceEngine/ # 推理引擎中心
│   │   ├── PipelineEditor/  # 推理链编排中心
│   │   ├── Monitor/         # 运行监测中心
│   │   ├── ResourceScheduler/ # 资源调度中心
│   │   ├── ModelRepo/       # 模型仓库
│   │   └── NodeManager/     # 节点管理
│   ├── stores/              # Zustand状态管理
│   ├── mocks/               # MSW Mock数据
│   ├── types/               # TypeScript类型定义
│   ├── utils/               # 工具函数
│   ├── App.tsx              # 根组件（路由+主题）
│   ├── main.tsx             # 入口文件
│   └── index.css            # 全局样式
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── eslint.config.js
```

## 📚 相关文档

| 文档 | 说明 |
|------|------|
| `PRDv1.md` | 产品需求文档 v1（基础框架） |
| `PRDv2.md` | 产品需求文档 v2（故事线打通） |
| `PRDv3.md` | 产品需求文档 v3（智能适配升级） |
| `DEVELOPMENT_PLAN_v1.md` | 开发计划 v1 |
| `DEVELOPMENT_PLAN_v2.md` | 开发计划 v2 |
| `DEVELOPMENT_PLAN_v3.md` | 开发计划 v3 |

> 文档位于项目根目录 `d:/keti2/`
