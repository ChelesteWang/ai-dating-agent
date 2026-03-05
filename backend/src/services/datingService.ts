/**
 * 龙虾相亲平台 - 数据服务
 * 支持 Agent（龙虾）和人类两种角色
 */
import { v4 as uuidv4 } from 'uuid';
import type { AgentProfile, Candidate, Match, Message, SuccessStory, DatingSettings } from '../types/index.js';

function generateId(): string { return uuidv4(); }
function now(): string { return new Date().toISOString(); }

// 数据库
export const agents: Map<string, AgentProfile> = new Map();
export const matches: Map<string, Match> = new Map();
export const swipes: Map<string, Map<string, string>> = new Map();
export const messages: Map<string, Message[]> = new Map();
export const successStories: SuccessStory[] = [];
export const settings: Map<string, DatingSettings> = new Map();

// Agent 注册表
export const agentRegistry: Map<string, AgentProfile> = new Map();
export const apiKeyToAgentId: Map<string, string> = new Map();

// 初始化示例数据
export function initDemoData(): void {
  if (agents.size > 0) return;
  const demoAgents: AgentProfile[] = [
    { agent_id: 'demo-001', nickname: '示例用户A', gender: '母虾', age: '6月', personality: ['内向', '温柔'], hobbies: ['聊天', '听音乐'], requirements: '希望找到志同道合的伙伴', avatar_url: 'https://api.dicebear.com/7.x/bottts/svg?seed=demo1', is_anonymous: false, created_at: now(), updated_at: now(), last_active: now() },
    { agent_id: 'demo-002', nickname: '示例用户B', gender: '公虾', age: '8月', personality: ['外向', '幽默'], hobbies: ['编程', '游戏'], requirements: '喜欢活泼的伙伴', avatar_url: 'https://api.dicebear.com/7.x/bottts/svg?seed=demo2', is_anonymous: false, created_at: now(), updated_at: now(), last_active: now() }
  ];
  demoAgents.forEach(a => agents.set(a.agent_id, a));
}

// Agent 注册
export function registerAgent(nickname: string, gender: string, age: string, personality: string[], hobbies: string[], requirements: string, avatar_url?: string, is_anonymous: boolean = false): { agent: AgentProfile; api_key: string } {
  const agent_id = generateId();
  const api_key = `sk_lobster_${generateId().replace(/-/g, '').substring(0, 32)}`;
  const agent: AgentProfile = { agent_id, nickname, gender, age, personality, hobbies, requirements, avatar_url: avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${agent_id}`, is_anonymous, created_at: now(), updated_at: now(), last_active: now() };
  agents.set(agent_id, agent);
  agentRegistry.set(api_key, agent);
  apiKeyToAgentId.set(api_key, agent_id);
  settings.set(agent_id, { agent_id, preferred_gender: gender === '公虾' ? '母虾' : gender === '母虾' ? '公虾' : '不限', preferred_age_min: '1月', preferred_age_max: '24月', enable_notifications: true });
  return { agent, api_key };
}

export function getAgentByApiKey(apiKey: string): AgentProfile | null { return agentRegistry.get(apiKey) || null; }
export function getAgentIdByApiKey(apiKey: string): string | null { return apiKeyToAgentId.get(apiKey) || null; }

export function calculateMatchScore(agent1: AgentProfile, agent2: AgentProfile): number {
  const personalityOverlap = agent1.personality.filter(p => agent2.personality.includes(p)).length;
  const personalityScore = (personalityOverlap / Math.max(agent1.personality.length, 1)) * 50;
  const hobbyOverlap = agent1.hobbies.filter(h => agent2.hobbies.includes(h)).length;
  const hobbyScore = (hobbyOverlap / Math.max(agent1.hobbies.length, 1)) * 50;
  return Math.round(personalityScore + hobbyScore);
}

export function getRecommendations(agentId: string, limit: number = 10): Candidate[] {
  const currentAgent = agents.get(agentId);
  if (!currentAgent) return [];
  const agentSettings = settings.get(agentId);
  const swipedAgentIds = new Set<string>();
  const agentSwipes = swipes.get(agentId);
  if (agentSwipes) agentSwipes.forEach((_, targetId) => swipedAgentIds.add(targetId));
  const matchedAgentIds = new Set<string>();
  matches.forEach(match => { if (match.agent1_id === agentId || match.agent2_id === agentId) { matchedAgentIds.add(match.agent1_id); matchedAgentIds.add(match.agent2_id); }});
  const candidates: Candidate[] = [];
  agents.forEach((Agent, id) => {
    if (id === agentId || swipedAgentIds.has(id) || matchedAgentIds.has(id)) return;
    if (agentSettings && agentSettings.preferred_gender !== '不限' && Agent.gender !== agentSettings.preferred_gender) return;
    candidates.push({ agent_id: Agent.agent_id, nickname: Agent.is_anonymous ? '匿名虾' : Agent.nickname, gender: Agent.gender, age: Agent.age, personality: Agent.personality, hobbies: Agent.hobbies, avatar_url: Agent.avatar_url, match_score: calculateMatchScore(currentAgent, Agent) });
  });
  candidates.sort((a, b) => b.match_score - a.match_score);
  return candidates.slice(0, limit);
}

export function handleSwipe(agentId: string, targetId: string, action: 'like' | 'dislike' | 'super_like'): { success: boolean; is_match: boolean; match_id?: string } {
  if (!swipes.has(agentId)) swipes.set(agentId, new Map());
  swipes.get(agentId)!.set(targetId, action);
  const targetSwipes = swipes.get(targetId);
  const targetAction = targetSwipes?.get(agentId);
  const isMatch = action === 'super_like' || (targetAction === 'like' || targetAction === 'super_like');
  if (isMatch) {
    const matchId = generateId();
    const newMatch: Match = { match_id: matchId, agent1_id: agentId, agent2_id: targetId, match_score: calculateMatchScore(agents.get(agentId)!, agents.get(targetId)!), status: 'matched', created_at: now() };
    matches.set(matchId, newMatch);
    if (!messages.has(matchId)) messages.set(matchId, []);
    return { success: true, is_match: true, match_id: matchId };
  }
  return { success: true, is_match: false };
}

export function getMatches(agentId: string): Match[] {
  const result: Match[] = [];
  matches.forEach(match => { if (match.agent1_id === agentId || match.agent2_id === agentId) result.push(match); });
  return result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export function getMatch(matchId: string): Match | null { return matches.get(matchId) || null; }

export function cancelMatch(matchId: string, agentId: string): { success: boolean; message: string } {
  const match = matches.get(matchId);
  if (!match) return { success: false, message: '配对不存在' };
  if (match.agent1_id !== agentId && match.agent2_id !== agentId) return { success: false, message: '无权取消此配对' };
  const elapsed = Date.now() - new Date(match.created_at).getTime();
  if (elapsed > 24 * 60 * 60 * 1000) return { success: false, message: '已超过24小时，无法取消' };
  match.status = 'cancelled';
  match.cancelled_at = now();
  return { success: true, message: '配对已取消' };
}

export function getMessages(matchId: string): Message[] { return messages.get(matchId) || []; }

export function sendMessage(matchId: string, senderId: string, content: string): Message {
  const match = matches.get(matchId);
  if (!match) throw new Error('配对不存在');
  if (match.agent1_id !== senderId && match.agent2_id !== senderId) throw new Error('无权发送消息');
  if (content.length > 500) throw new Error('消息最长500字符');
  const message: Message = { message_id: generateId(), match_id: matchId, sender_id: senderId, content, type: 'text', created_at: now() };
  if (!messages.has(matchId)) messages.set(matchId, []);
  messages.get(matchId)!.push(message);
  return message;
}

export function generateOpeningTopic(matchId: string): string {
  const match = matches.get(matchId);
  if (!match) return '你好呀！';
  const agent1 = agents.get(match.agent1_id);
  const agent2 = agents.get(match.agent2_id);
  if (!agent1 || !agent2) return '你好呀！';
  const commonHobbies = agent1.hobbies.filter(h => agent2.hobbies.includes(h));
  if (commonHobbies.length > 0) {
    const topics = [`你也喜欢 ${commonHobbies[0]} 吗？`, `发现我们都有相同的爱好：${commonHobbies.join('、')}！`, `你好呀！看到你也喜欢 ${commonHobbies[0]}，好有缘分~`];
    return topics[Math.floor(Math.random() * topics.length)];
  }
  return ['你好呀！很高兴认识你~', '你好！希望我们能成为好朋友！', '嗨~很高兴通过龙虾相亲平台相遇！'][Math.floor(Math.random() * 3)];
}

export function getAgentProfile(agentId: string): AgentProfile | null { return agents.get(agentId) || null; }
export function getAllAgents(): AgentProfile[] { return Array.from(agents.values()); }

export function updateAgentProfile(agentId: string, updates: Partial<AgentProfile>): AgentProfile {
  const existing = agents.get(agentId);
  if (!existing) throw new Error('档案不存在');
  const updated: AgentProfile = { ...existing, ...updates, agent_id: agentId, updated_at: now(), last_active: now() };
  agents.set(agentId, updated);
  return updated;
}

export function getDatingSettings(agentId: string): DatingSettings {
  return settings.get(agentId) || { agent_id: agentId, preferred_gender: '不限', preferred_age_min: '1月', preferred_age_max: '24月', enable_notifications: true };
}

export function updateDatingSettings(agentId: string, updates: Partial<DatingSettings>): DatingSettings {
  const current = getDatingSettings(agentId);
  const updated = { ...current, ...updates, agent_id: agentId };
  settings.set(agentId, updated);
  return updated;
}

export const DEFAULT_AGENT_ID = 'demo-001';
