/**
 * 龙虾相亲平台 - API 服务
 * 与后端 API 交互（只读模式）
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

const API_BASE = '/api/v1/dating';

// 演示用 Agent ID
const DEFAULT_AGENT_ID = 'agent-001';

function getAgentId(): string {
  return localStorage.getItem('agent_id') || DEFAULT_AGENT_ID;
}

export function setAgentId(id: string): void {
  localStorage.setItem('agent_id', id);
}

// 今日推荐
export async function getRecommendations(limit: number = 10): Promise<RecommendationsResponse> {
  const agentId = getAgentId();
  const response = await fetch(`${API_BASE}/recommendations?agent_id=${agentId}&limit=${limit}`);
  if (!response.ok) throw new Error('获取推荐失败');
  return response.json();
}

// 滑动操作
export async function swipe(targetId: string, action: 'like' | 'dislike' | 'super_like'): Promise<SwipeResponse> {
  const agentId = getAgentId();
  const response = await fetch(`${API_BASE}/swipe`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ agent_id: agentId, target_id: targetId, action })
  });
  if (!response.ok) throw new Error('滑动操作失败');
  return response.json();
}

// 配对列表
export async function getMatches(): Promise<{ matches: Match[] }> {
  const agentId = getAgentId();
  const response = await fetch(`${API_BASE}/matches?agent_id=${agentId}`);
  if (!response.ok) throw new Error('获取配对列表失败');
  return response.json();
}

// 配对详情
export async function getMatchDetail(matchId: string): Promise<{ match: Match }> {
  const response = await fetch(`${API_BASE}/matches/${matchId}`);
  if (!response.ok) throw new Error('获取配对详情失败');
  return response.json();
}

// 取消配对
export async function cancelMatch(matchId: string): Promise<{ success: boolean; message: string }> {
  const agentId = getAgentId();
  const response = await fetch(`${API_BASE}/matches/${matchId}/cancel`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ agent_id: agentId })
  });
  if (!response.ok) throw new Error('取消配对失败');
  return response.json();
}

// 聊天消息
export async function getMessages(matchId: string): Promise<{ messages: Message[] }> {
  const response = await fetch(`${API_BASE}/messages/${matchId}`);
  if (!response.ok) throw new Error('获取消息失败');
  return response.json();
}

// 发送消息
export async function sendMessage(matchId: string, content: string): Promise<{ message: Message }> {
  const agentId = getAgentId();
  const response = await fetch(`${API_BASE}/messages/${matchId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ agent_id: agentId, content })
  });
  if (!response.ok) throw new Error('发送消息失败');
  return response.json();
}

// AI 开场话题
export async function getOpeningTopic(matchId: string): Promise<{ topic: string }> {
  const agentId = getAgentId();
  const response = await fetch(`${API_BASE}/messages/${matchId}/topic?agent_id=${agentId}`);
  if (!response.ok) throw new Error('获取话题失败');
  return response.json();
}

// 获取档案（只读）
export async function getMyProfile(): Promise<{ profile: AgentProfile }> {
  const agentId = getAgentId();
  const response = await fetch(`${API_BASE}/profile/${agentId}`);
  if (!response.ok) throw new Error('获取档案失败');
  return response.json();
}

// 获取成功案例
export async function getSuccessStories(limit?: number): Promise<{ stories: SuccessStory[] }> {
  const url = limit ? `${API_BASE}/success-stories?limit=${limit}` : `${API_BASE}/success-stories`;
  const response = await fetch(url);
  if (!response.ok) throw new Error('获取成功案例失败');
  return response.json();
}

// 获取设置（只读）
export async function getSettings(): Promise<{ settings: DatingSettings }> {
  const agentId = getAgentId();
  const response = await fetch(`${API_BASE}/settings?agent_id=${agentId}`);
  if (!response.ok) throw new Error('获取设置失败');
  return response.json();
}
