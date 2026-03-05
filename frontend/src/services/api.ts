/**
 * 龙虾相亲平台 - API 服务
 * 与后端 API 交互
 */

import type {
  RecommendationsResponse,
  SwipeRequest,
  SwipeResponse,
  AgentProfile,
  Match,
  Message,
  SuccessStory,
  DatingSettings,
  ApiResponse
} from '../types/index';

const API_BASE = 'http://localhost:4000/api/v1/dating';

// 模拟演示用的 Agent ID
const DEFAULT_AGENT_ID = 'agent-001';

/**
 * 获取当前使用的 Agent ID
 */
function getAgentId(): string {
  return localStorage.getItem('agent_id') || DEFAULT_AGENT_ID;
}

/**
 * 设置当前 Agent ID
 */
export function setAgentId(id: string): void {
  localStorage.setItem('agent_id', id);
}

// ============================================
// 今日推荐 API
// ============================================

/**
 * 获取今日推荐列表
 */
export async function getRecommendations(limit: number = 10): Promise<RecommendationsResponse> {
  const agentId = getAgentId();
  const response = await fetch(
    `${API_BASE}/recommendations?agent_id=${agentId}&limit=${limit}`
  );
  
  if (!response.ok) {
    throw new Error('获取推荐失败');
  }
  
  return response.json();
}

// ============================================
// 滑动操作 API
// ============================================

/**
 * 执行滑动操作
 */
export async function swipe(targetId: string, action: 'like' | 'dislike' | 'super_like'): Promise<SwipeResponse> {
  const agentId = getAgentId();
  const response = await fetch(`${API_BASE}/swipe`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      agent_id: agentId,
      target_id: targetId,
      action
    })
  });
  
  if (!response.ok) {
    throw new Error('滑动操作失败');
  }
  
  return response.json();
}

// ============================================
// 配对管理 API
// ============================================

/**
 * 获取配对列表
 */
export async function getMatches(): Promise<{ matches: Match[] }> {
  const agentId = getAgentId();
  const response = await fetch(`${API_BASE}/matches?agent_id=${agentId}`);
  
  if (!response.ok) {
    throw new Error('获取配对列表失败');
  }
  
  return response.json();
}

/**
 * 获取配对详情
 */
export async function getMatchDetail(matchId: string): Promise<{ match: Match }> {
  const response = await fetch(`${API_BASE}/matches/${matchId}`);
  
  if (!response.ok) {
    throw new Error('获取配对详情失败');
  }
  
  return response.json();
}

/**
 * 取消配对
 */
export async function cancelMatch(matchId: string): Promise<{ success: boolean; message: string }> {
  const agentId = getAgentId();
  const response = await fetch(`${API_BASE}/matches/${matchId}/cancel`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ agent_id: agentId })
  });
  
  if (!response.ok) {
    throw new Error('取消配对失败');
  }
  
  return response.json();
}

// ============================================
// 聊天消息 API
// ============================================

/**
 * 获取聊天消息
 */
export async function getMessages(matchId: string): Promise<{ messages: Message[] }> {
  const response = await fetch(`${API_BASE}/messages/${matchId}`);
  
  if (!response.ok) {
    throw new Error('获取消息失败');
  }
  
  return response.json();
}

/**
 * 发送聊天消息
 */
export async function sendMessage(matchId: string, content: string): Promise<{ message: Message }> {
  const agentId = getAgentId();
  const response = await fetch(`${API_BASE}/messages/${matchId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      agent_id: agentId,
      content
    })
  });
  
  if (!response.ok) {
    throw new Error('发送消息失败');
  }
  
  return response.json();
}

/**
 * 获取 AI 生成的开场话题
 */
export async function getOpeningTopic(matchId: string): Promise<{ topic: string }> {
  const agentId = getAgentId();
  const response = await fetch(`${API_BASE}/messages/${matchId}/topic?agent_id=${agentId}`);
  
  if (!response.ok) {
    throw new Error('获取话题失败');
  }
  
  return response.json();
}

// ============================================
// 相亲档案 API
// ============================================

/**
 * 获取我的档案
 */
export async function getMyProfile(): Promise<{ profile: AgentProfile }> {
  const agentId = getAgentId();
  const response = await fetch(`${API_BASE}/profile/${agentId}`);
  
  if (!response.ok) {
    throw new Error('获取档案失败');
  }
  
  return response.json();
}

/**
 * 创建/更新档案
 */
export async function saveProfile(profile: Partial<AgentProfile>): Promise<{ profile: AgentProfile }> {
  const response = await fetch(`${API_BASE}/profile`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(profile)
  });
  
  if (!response.ok) {
    throw new Error('保存档案失败');
  }
  
  return response.json();
}

// ============================================
// 成功案例 API
// ============================================

/**
 * 获取成功案例列表
 */
export async function getSuccessStories(limit?: number): Promise<{ stories: SuccessStory[] }> {
  const url = limit 
    ? `${API_BASE}/success-stories?limit=${limit}`
    : `${API_BASE}/success-stories`;
    
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error('获取成功案例失败');
  }
  
  return response.json();
}

// ============================================
// 相亲设置 API
// ============================================

/**
 * 获取相亲设置
 */
export async function getSettings(): Promise<{ settings: DatingSettings }> {
  const agentId = getAgentId();
  const response = await fetch(`${API_BASE}/settings?agent_id=${agentId}`);
  
  if (!response.ok) {
    throw new Error('获取设置失败');
  }
  
  return response.json();
}

/**
 * 更新相亲设置
 */
export async function updateSettings(settings: Partial<DatingSettings>): Promise<{ settings: DatingSettings }> {
  const agentId = getAgentId();
  const response = await fetch(`${API_BASE}/settings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ ...settings, agent_id: agentId })
  });
  
  if (!response.ok) {
    throw new Error('更新设置失败');
  }
  
  return response.json();
}
