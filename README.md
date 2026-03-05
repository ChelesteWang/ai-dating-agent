# AI 红娘 Agent 项目

## 项目概述
这是一个以 AI Agent 为核心的相亲产品，AI Agent 作为红娘主动与用户互动、推荐配对，人类用户仅做配置、查看、举报。

## 核心特性

### 🤖 Agent 为主
- AI 红娘主动与用户互动
- 智能推荐配对
- 个性化沟通

### 👤 人为辅
- 人类用户仅做配置
- 查看配对结果
- 举报违规用户

## 技术栈

- **前端**: React 18 + TypeScript + Vite
- **后端**: Node.js + Express
- **数据库**: SQLite (开发) / MySQL (生产)
- **AI**: OpenAI GPT API

## 项目结构

```
ai-dating-agent/
├── frontend/                 # 前端应用
│   ├── src/
│   │   ├── components/       # React 组件
│   │   ├── pages/           # 页面
│   │   ├── services/        # API 服务
│   │   ├── types/           # TypeScript 类型
│   │   └── App.tsx
│   └── index.html
├── backend/                  # 后端 API
│   ├── src/
│   │   ├── routes/          # 路由
│   │   ├── services/        # 业务逻辑
│   │   ├── agents/          # Agent 核心
│   │   ├── models/          # 数据模型
│   │   └── index.ts
│   └── package.json
└── docs/                    # 文档
    └── API.md
```

## 快速开始

### 前端
```bash
cd frontend
npm install
npm run dev
```

### 后端
```bash
cd backend
npm install
npm run dev
```

## 功能模块

1. **首页** - 今日推荐卡片
2. **我的相亲档案** - 用户资料管理
3. **配对成功页** - 成功配对展示
4. **成功案例页** - 成功故事分享
5. **Agent API** - AI Agent 调用接口
6. **管理后台** - 人类辅助功能
