# AI 红娘 Agent - API 文档

## 概述

本文档描述了 AI 红娘系统的 API 接口，供 AI Agent 调用。

## 基础信息

- **Base URL**: `http://localhost:4000/api`
- **认证方式**: API Key (暂定)
- **响应格式**: JSON

## 通用响应格式

```json
{
  "success": true,
  "data": {},
  "message": "操作成功"
}
```

错误响应：

```json
{
  "success": false,
  "error": "错误信息"
}
```

---

## Agent 核心接口

这些是 AI Agent 主要调用的接口，用于执行智能匹配和用户互动。

### 1. Agent 动作

**POST** `/api/agent/action`

AI Agent 的核心动作接口，支持多种操作。

**请求参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| action | string | 是 | 操作类型：recommend, message, followup, match, analyze |
| userId | string | 是 | 用户 ID |
| params | object | 否 | 附加参数 |

**action 说明：**

| action | 说明 | params |
|--------|------|--------|
| recommend | 获取推荐 | limit: 数量 |
| message | 发送消息 | content, type |
| followup | 跟进用户 | - |
| match | 发起配对 | targetUserId |
| analyze | 分析用户 | analyzeType |

**响应示例：**

```json
{
  "success": true,
  "action": "recommend",
  "data": {
    "recommendations": [
      {
        "id": "rec-xxx",
        "userId": "u1",
        "user": { ... },
        "matchScore": 92,
        "matchReasons": ["兴趣爱好相似", "年龄匹配"],
        "similarity": 0.85
      }
    ],
    "totalCount": 2
  },
  "messages": [
    {
      "id": "msg-xxx",
      "userId": "current-user",
      "content": "为你精选了几位优质对象，来看看有没有心仪的吧~",
      "type": "recommendation"
    }
  ]
}
```

### 2. 发送消息

**POST** `/api/agent/message`

Agent 发送消息给用户。

**请求参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| userId | string | 是 | 接收消息的用户 ID |
| content | string | 是 | 消息内容 |
| type | string | 否 | 消息类型：greeting, recommendation, followup, reminder, match |

---

## 用户相关接口

### 3. 获取用户档案

**GET** `/api/users/:id`

### 4. 更新用户档案

**PUT** `/api/users/:id`

### 5. 创建用户

**POST** `/api/users`

---

## 推荐相关接口

### 6. 获取推荐

**GET** `/api/recommendations/:userId`

获取用户的推荐列表。

### 7. 推荐反馈

**POST** `/api/recommendations/:recommendationId/feedback`

用户对推荐进行反馈（喜欢/不喜欢）。

**请求参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| userId | string | 是 | 用户 ID |
| action | string | 是 | like / dislike / superlike |

---

## 配对相关接口

### 8. 获取配对列表

**GET** `/api/matches/:userId`

### 9. 接受配对

**POST** `/api/matches/:matchId/accept`

### 10. 拒绝配对

**POST** `/api/matches/:matchId/reject`

---

## 成功案例接口

### 11. 获取成功案例列表

**GET** `/api/success-stories`

### 12. 获取单个案例

**GET** `/api/success-stories/:id`

---

## 举报接口

### 13. 创建举报

**POST** `/api/reports`

**请求参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| reporterId | string | 是 | 举报人 ID |
| reportedUserId | string | 是 | 被举报人 ID |
| reason | string | 是 | 举报原因 |
| description | string | 否 | 详细描述 |

### 14. 获取举报列表

**GET** `/api/reports?status=pending`

---

## 配置接口

### 15. 获取配置

**GET** `/api/config`

### 16. 更新配置

**PUT** `/api/config/:key`

---

## Agent 交互流程

```
┌─────────────────────────────────────────────────────────────┐
│                     AI Agent 工作流程                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. 新用户注册                                              │
│     └→ POST /api/agent/action (action=message, type=greeting) │
│                                                             │
│  2. 获取推荐                                                │
│     └→ POST /api/agent/action (action=recommend)            │
│                                                             │
│  3. 用户反馈                                                │
│     └→ POST /api/recommendations/:id/feedback               │
│                                                             │
│  4. 配对成功                                                │
│     └→ POST /api/agent/action (action=match)                │
│                                                             │
│  5. 跟进用户                                                │
│     └→ POST /api/agent/action (action=followup)             │
│                                                             │
│  6. 用户分析                                                │
│     └→ POST /api/agent/action (action=analyze)             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 错误码

| 错误码 | 说明 |
|--------|------|
| 400 | 请求参数错误 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |
