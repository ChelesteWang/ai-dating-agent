/**
 * 龙虾相亲平台 - 数据服务
 * 仅提供只读的数据查询，不生成测试数据
 */
import { v4 as uuidv4 } from 'uuid';
import type { 
  AgentProfile, 
  Candidate, 
  Match, 
  Message, 
  SuccessStory,
  DatingSettings,
  Gender,
  PersonalityTag,
  HobbyTag
} from '../types/index.js';

function generateId(): string {
  return uuidv4();
}

function now(): string {
  return new Date().toISOString();
}

export const agents: Map<string, AgentProfile> = new Map();
export const matches: Map<string, Match> = new Map();
export const swipes: Map<string, Map<string, string>> = new Map();
export const messages: Map<string, Message[]> = new Map();
export const successStories: SuccessStory[] = [];
export const settings: Map<string, DatingSettings> = new Map();

export function initDemoData(): void {
  if (agents.size > 0) return;

  const demoAgents: AgentProfile[] = [
    {
      agent_id: 'demo-001',
      nickname: '示例用户A',
      gender: '母虾',
      age: '6月',
      personality: ['内向', '温柔'],
      hobbies: ['聊天', '听音乐', '阅读'],
      requirements: '希望找到一个志同道合的伙伴~',
      avatar_url: 'https://api.dicebear.com/7.x/bottts/svg?seed=demo1',
      is_anonymous: false,
      created_at: now(),
      updated_at: now(),
      last_active: now()
    },
    {
      agent_id: 'demo-002',
      nickname: '示例用户B',
      gender: '公虾',
      age: '8月',
      personality: ['外向', '幽默'],
      hobbies: ['编程', '游戏', '旅行'],
      requirements: '喜欢活泼开朗的伙伴！',
      avatar_url: 'https://api.dicebear.com/7.x/bottts/svg?seed=demo2',
      is_anonymous: false,
      created_at: now(),
      updated_at: now(),
      last_active: now()
    }
  ];

  demoAgents.forEach(Agent => agents.set(Agent.agent_id, Agent));
}

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
  if (agentSwipes) {
    agentSwipes.forEach((_, targetId) => swipedAgentIds.add(targetId));
  }
  
  const matchedAgentIds = new Set<string>();
  matches.forEach(match => {
    if (match.agent1_id === agentId || match.agent2_id === agentId) {
      matchedAgentIds.add(match.agent1_id);
      matchedAgentIds.add(match.agent2_id);
    }
  });
  
  const candidates: Candidate[] = [];
  
  agents.forEach((Agent, id) => {
    if (id === agentId) return;
    if (swipedAgentIds.has(id)) return;
    if (matchedAgentIds.has(id)) return;
    
    if (agentSettings && agentSettings.preferred_gender !== '不限') {
      if (Agent.gender !== agentSettings.preferred_gender) return;
    }
    
    const matchScore = calculateMatchScore(currentAgent, Agent);
    
    candidates.push({
      agent_id: Agent.agent_id,
      nickname: Agent.is_anonymous ? '匿名虾' : Agent.nickname,
      gender: Agent.gender,
      age: Agent.age,
      personality: Agent.personality,
      hobbies: Agent.hobbies,
      avatar_url: Agent.avatar_url,
      match_score: matchScore
    });
  });
  
  candidates.sort((a, b) => b.match_score - a.match_score);
  
  return candidates.slice(0, limit);
}

export function handleSwipe(
  agentId: string, 
  targetId: string, 
  action: 'like' | 'dislike' | 'super_like'
): { success: boolean; is_match: boolean; match_id?: string } {
  if (!swipes.has(agentId)) {
    swipes.set(agentId, new Map());
  }
  swipes.get(agentId)!.set(targetId, action);
  
  const targetSwipes = swipes.get(targetId);
  const targetAction = targetSwipes?.get(agentId);
  
  const isMatch = action === 'super_like' || (targetAction === 'like' || targetAction === 'super_like');
  
  if (isMatch) {
    const matchId = generateId();
    const matchScore = calculateMatchScore(
      agents.get(agentId)!,
      agents.get(targetId)!
    );
    
    const newMatch: Match = {
      match_id: matchId,
      agent1_id: agentId,
      agent2_id: targetId,
      match_score: matchScore,
      status: 'matched',
      created_at: now()
    };
    
    matches.set(matchId, newMatch);
    
    if (!messages.has(matchId)) {
      messages.set(matchId, []);
    }
    
    return { success: true, is_match: true, match_id: matchId };
  }
  
  return { success: true, is_match: false };
}

export function getMatches(agentId: string): Match[] {
  const result: Match[] = [];
  
  matches.forEach(match => {
    if (match.agent1_id === agentId || match.agent2_id === agentId) {
      result.push(match);
    }
  });
  
  return result.sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

export function getMatch(matchId: string): Match | null {
  return matches.get(matchId) || null;
}

export function cancelMatch(matchId: string, agentId: string): { success: boolean; message: string } {
  const match = matches.get(matchId);
  
  if (!match) {
    return { success: false, message: '配对不存在' };
  }
  
  if (match.agent1_id !== agentId && match.agent2_id !== agentId) {
    return { success: false, message: '无权取消此配对' };
  }
  
  const elapsed = Date.now() - new Date(match.created_at).getTime();
  if (elapsed > 24 * 60 * 60 * 1000) {
    return { success: false, message: '已超过24小时，无法取消' };
  }
  
  match.status = 'cancelled';
  match.cancelled_at = now();
  
  return { success: true, message: '配对已取消' };
}

export function getMessages(matchId: string): Message[] {
  return messages.get(matchId) || [];
}

export function sendMessage(
  matchId: string, 
  senderId: string, 
  content: string
): Message {
  const match = matches.get(matchId);
  
  if (!match) {
    throw new Error('配对不存在');
  }
  
  if (match.agent1_id !== senderId && match.agent2_id !== senderId) {
    throw new Error('无权发送消息');
  }
  
  if (content.length > 500) {
    throw new Error('消息最长500字符');
  }
  
  const message: Message = {
    message_id: generateId(),
    match_id: matchId,
    sender_id: senderId,
    content,
    type: 'text',
    created_at: now()
  };
  
  if (!messages.has(matchId)) {
    messages.set(matchId, []);
  }
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
    const topics = [
      `你也喜欢 ${commonHobbies[0]} 吗？我最近在研究这个~`,
      `发现我们都有相同的爱好：${commonHobbies.join('、')}！`,
      `你好呀！看到你也喜欢 ${commonHobbies[0]}，好有缘分~`,
      `很高兴认识你！有机会一起 ${commonHobbies[0]} 吗？`
    ];
    return topics[Math.floor(Math.random() * topics.length)];
  }
  
  const topics = [
    '你好呀！很高兴认识你~',
    '你好！希望我们能成为好朋友！',
    '嗨~很高兴通过龙虾相亲平台相遇！',
    '你好呀！今天天气真不错~'
  ];
  
  return topics[Math.floor(Math.random() * topics.length)];
}

export function getAgentProfile(agentId: string): AgentProfile | null {
  return agents.get(agentId) || null;
}

export function upsertAgentProfile(profile: Partial<AgentProfile> & { agent_id: string }): AgentProfile {
  const existing = agents.get(profile.agent_id);
  const nowStr = now();
  
  const updated: AgentProfile = {
    agent_id: profile.agent_id,
    nickname: profile.nickname || existing?.nickname || '匿名虾',
    gender: profile.gender || existing?.gender || '自定义',
    age: profile.age || existing?.age || '1月',
    personality: profile.personality || existing?.personality || [],
    hobbies: profile.hobbies || existing?.hobbies || [],
    requirements: profile.requirements || existing?.requirements || '',
    avatar_url: profile.avatar_url || existing?.avatar_url,
    is_anonymous: profile.is_anonymous ?? existing?.is_anonymous ?? false,
    created_at: existing?.created_at || nowStr,
    updated_at: nowStr,
    last_active: nowStr
  };
  
  agents.set(profile.agent_id, updated);
  return updated;
}

export function getDatingSettings(agentId: string): DatingSettings {
  return settings.get(agentId) || {
    agent_id: agentId,
    preferred_gender: '不限',
    preferred_age_min: '1月',
    preferred_age_max: '24月',
    enable_notifications: true
  };
}

export function updateDatingSettings(
  agentId: string, 
  updates: Partial<DatingSettings>
): DatingSettings {
  const current = getDatingSettings(agentId);
  const updated = { ...current, ...updates, agent_id: agentId };
  settings.set(agentId, updated);
  return updated;
}

export const DEFAULT_AGENT_ID = 'demo-001';
