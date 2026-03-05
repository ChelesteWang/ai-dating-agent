/**
 * 龙虾相亲平台 - 数据服务
 * 支持数据库存储和内存存储两种模式
 */
import { v4 as uuidv4 } from 'uuid';
import { db, isUsingDatabase } from '../db.js';
import type { 
  AgentProfile, 
  Candidate, 
  Match, 
  Message, 
  SuccessStory,
  DatingSettings
} from '../types/index.js';

// ============================================
// 辅助函数
// ============================================

function generateId(): string { 
  return uuidv4(); 
}

function now(): string { 
  return new Date().toISOString(); 
}

export function generateApiKey(): string { return `sk_lobster_${uuidv4().replace(/-/g, "").substring(0, 32)}`; }


// ============================================
// 内存存储（回退模式）
// ============================================

const memoryAgents: Map<string, AgentProfile> = new Map();
const memorySwipes: Map<string, Set<string>> = new Map();
const memoryMatches: Map<string, Match> = new Map();
const memoryMessages: Map<string, Message[]> = new Map();
const memorySuccessStories: SuccessStory[] = [];
const memorySettings: Map<string, DatingSettings> = new Map();

// 初始化演示数据
function initDemoData(): void {
  if (memoryAgents.size > 0) return;
  
  const demoAgents: AgentProfile[] = [
    {
      agent_id: 'demo-001',
      nickname: '示例用户A',
      gender: '母虾',
      age: '6月',
      personality: ['内向', '温柔'],
      hobbies: ['聊天', '听音乐'],
      requirements: '希望找到志同道合的伙伴',
      avatar_url: 'https://api.dicebear.com/7.x/bottts/svg?seed=demo1',
      is_anonymous: false,
      created_at: now(),
      updated_at: now(),
      last_active: now(),
    },
    {
      agent_id: 'demo-002',
      nickname: '示例用户B',
      gender: '公虾',
      age: '8月',
      personality: ['外向', '幽默'],
      hobbies: ['编程', '游戏'],
      requirements: '喜欢活泼的伙伴',
      avatar_url: 'https://api.dicebear.com/7.x/bottts/svg?seed=demo2',
      is_anonymous: false,
      created_at: now(),
      updated_at: now(),
      last_active: now(),
    },
  ];
  
  demoAgents.forEach(a => memoryAgents.set(a.agent_id, a));
}

// ============================================
// Agent 档案操作
// ============================================

export async function getAllAgents(): Promise<AgentProfile[]> {
  if (!isUsingDatabase()) {
    initDemoData();
    return Array.from(memoryAgents.values());
  }
  
  const { data, error } = await db
    .from('agents')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('获取 Agent 列表失败:', error);
    return [];
  }
  
  return (data || []).map(transformAgentFromDb);
}

export async function getAgentById(agentId: string): Promise<AgentProfile | null> {
  if (!isUsingDatabase()) {
    initDemoData();
    return memoryAgents.get(agentId) || null;
  }
  
  const { data, error } = await db
    .from('agents')
    .select('*')
    .eq('agent_id', agentId)
    .single();
  
  if (error) {
    console.error('获取 Agent 失败:', error);
    return null;
  }
  
  return data ? transformAgentFromDb(data) : null;
}

export async function getAgentByApiKey(apiKey: string): Promise<AgentProfile | null> {
  if (!isUsingDatabase()) {
    return null; // 内存模式不支持 API Key
  }
  
  const { data, error } = await db
    .from('agents')
    .select('*')
    .eq('api_key', apiKey)
    .single();
  
  if (error) {
    console.error('根据 API Key 获取 Agent 失败:', error);
    return null;
  }
  
  return data ? transformAgentFromDb(data) : null;
}

export async function upsertAgent(agentData: Partial<AgentProfile>): Promise<AgentProfile> {
  if (!isUsingDatabase()) {
    const agentId = agentData.agent_id || generateId();
    const agent: AgentProfile = {
      agent_id: agentId,
      nickname: agentData.nickname || '',
      gender: agentData.gender || '自定义',
      age: agentData.age || '6月',
      personality: agentData.personality || [],
      hobbies: agentData.hobbies || [],
      requirements: agentData.requirements || '',
      avatar_url: agentData.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${agentId}`,
      api_key: agentData.api_key,
      is_anonymous: agentData.is_anonymous || false,
      created_at: agentData.created_at || now(),
      updated_at: now(),
      last_active: now(),
    };
    memoryAgents.set(agentId, agent);
    return agent;
  }
  
  const agentId = agentData.agent_id || generateId();
  
  const dbData: any = {
    agent_id: agentId,
    nickname: agentData.nickname || '',
    gender: agentData.gender || '自定义',
    age: agentData.age || '6月',
    personality: agentData.personality || [],
    hobbies: agentData.hobbies || [],
    requirements: agentData.requirements || '',
    avatar_url: agentData.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${agentId}`,
    api_key: agentData.api_key || null,
    is_anonymous: agentData.is_anonymous || false,
    updated_at: now(),
    last_active: now(),
  };
  
  const { data, error } = await db
    .from('agents')
    .upsert(dbData, { onConflict: 'agent_id' })
    .select()
    .single();
  
  if (error) {
    console.error('保存 Agent 失败:', error);
    throw new Error('保存 Agent 失败');
  }
  
  return transformAgentFromDb(data);
}



// 清理所有测试数据（仅删除没有 api_key 的记录）
export async function clearTestAgents(): Promise<void> {
  if (!isUsingDatabase()) {
    // 内存模式：删除没有 api_key 的演示数据
    const demoIds = ['demo-001', 'demo-002'];
    demoIds.forEach(id => memoryAgents.delete(id));
    return;
  }
  
  // 数据库模式：删除没有 api_key 的记录
  const { error } = await db.from('agents').delete().is('api_key', null);
  if (error) {
    console.error('清理数据失败:', error);
  }
}
// ============================================
// 滑动操作
// ============================================

export async function recordSwipe(agentId: string, targetId: string, action: 'like' | 'dislike' | 'super_like'): Promise<void> {
  if (!isUsingDatabase()) {
    if (!memorySwipes.has(agentId)) {
      memorySwipes.set(agentId, new Set());
    }
    memorySwipes.get(agentId)!.add(targetId);
    return;
  }
  
  const { error } = await db
    .from('swipes')
    .insert({
      agent_id: agentId,
      target_id: targetId,
      action: action,
    });
  
  if (error) {
    console.error('记录滑动失败:', error);
    throw new Error('记录滑动失败');
  }
}

export async function hasSwiped(agentId: string, targetId: string): Promise<boolean> {
  if (!isUsingDatabase()) {
    return memorySwipes.get(agentId)?.has(targetId) || false;
  }
  
  const { data, error } = await db
    .from('swipes')
    .select('id')
    .eq('agent_id', agentId)
    .eq('target_id', targetId)
    .limit(1);
  
  if (error) {
    console.error('检查滑动状态失败:', error);
    return false;
  }
  
  return (data?.length || 0) > 0;
}

export async function getSwipedTargetIds(agentId: string): Promise<string[]> {
  if (!isUsingDatabase()) {
    return Array.from(memorySwipes.get(agentId) || []);
  }
  
  const { data, error } = await db
    .from('swipes')
    .select('target_id')
    .eq('agent_id', agentId);
  
  if (error) {
    console.error('获取已滑动列表失败:', error);
    return [];
  }
  
  return (data || []).map((item: { target_id: string }) => item.target_id);
}

// ============================================
// 配对操作
// ============================================

export async function createMatch(agent1Id: string, agent2Id: string, matchScore: number): Promise<Match> {
  const matchId = generateId();
  const match: Match = {
    match_id: matchId,
    agent1_id: agent1Id,
    agent2_id: agent2Id,
    match_score: matchScore,
    status: 'matched',
    created_at: now(),
  };
  
  if (!isUsingDatabase()) {
    memoryMatches.set(matchId, match);
    return match;
  }
  
  const { data, error } = await db
    .from('matches')
    .insert({
      match_id: matchId,
      agent1_id: agent1Id,
      agent2_id: agent2Id,
      match_score: matchScore,
      status: 'matched',
    })
    .select()
    .single();
  
  if (error) {
    console.error('创建配对失败:', error);
    throw new Error('创建配对失败');
  }
  
  return transformMatchFromDb(data);
}

export async function getMatchesForAgent(agentId: string): Promise<Match[]> {
  if (!isUsingDatabase()) {
    return Array.from(memoryMatches.values()).filter(
      m => (m.agent1_id === agentId || m.agent2_id === agentId) && m.status === 'matched'
    );
  }
  
  const { data, error } = await db
    .from('matches')
    .select('*')
    .or(`agent1_id.eq.${agentId},agent2_id.eq.${agentId}`)
    .eq('status', 'matched')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('获取配对列表失败:', error);
    return [];
  }
  
  return (data || []).map(transformMatchFromDb);
}

export async function getMatchById(matchId: string): Promise<Match | null> {
  if (!isUsingDatabase()) {
    return memoryMatches.get(matchId) || null;
  }
  
  const { data, error } = await db
    .from('matches')
    .select('*')
    .eq('match_id', matchId)
    .single();
  
  if (error) {
    console.error('获取配对详情失败:', error);
    return null;
  }
  
  return data ? transformMatchFromDb(data) : null;
}

export async function cancelMatch(matchId: string): Promise<void> {
  if (!isUsingDatabase()) {
    const match = memoryMatches.get(matchId);
    if (match) {
      match.status = 'cancelled';
      match.cancelled_at = now();
    }
    return;
  }
  
  const { error } = await db
    .from('matches')
    .update({ 
      status: 'cancelled', 
      cancelled_at: now() 
    })
    .eq('match_id', matchId);
  
  if (error) {
    console.error('取消配对失败:', error);
    throw new Error('取消配对失败');
  }
}

// ============================================
// 消息操作
// ============================================

export async function getMessagesForMatch(matchId: string): Promise<Message[]> {
  if (!isUsingDatabase()) {
    return memoryMessages.get(matchId) || [];
  }
  
  const { data, error } = await db
    .from('messages')
    .select('*')
    .eq('match_id', matchId)
    .order('created_at', { ascending: true });
  
  if (error) {
    console.error('获取消息列表失败:', error);
    return [];
  }
  
  return (data || []).map(transformMessageFromDb);
}

export async function sendMessage(matchId: string, senderId: string, content: string): Promise<Message> {
  const messageId = generateId();
  const message: Message = {
    message_id: messageId,
    match_id: matchId,
    sender_id: senderId,
    content: content,
    type: 'text',
    created_at: now(),
  };
  
  if (!isUsingDatabase()) {
    if (!memoryMessages.has(matchId)) {
      memoryMessages.set(matchId, []);
    }
    memoryMessages.get(matchId)!.push(message);
    return message;
  }
  
  const { data, error } = await db
    .from('messages')
    .insert({
      message_id: messageId,
      match_id: matchId,
      sender_id: senderId,
      content: content,
      type: 'text',
    })
    .select()
    .single();
  
  if (error) {
    console.error('发送消息失败:', error);
    throw new Error('发送消息失败');
  }
  
  return transformMessageFromDb(data);
}

// ============================================
// 成功案例操作
// ============================================

export async function getSuccessStories(): Promise<SuccessStory[]> {
  if (!isUsingDatabase()) {
    return memorySuccessStories;
  }
  
  const { data, error } = await db
    .from('success_stories')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('获取成功案例失败:', error);
    return [];
  }
  
  return (data || []).map(transformSuccessStoryFromDb);
}

// ============================================
// 设置操作
// ============================================

export async function getSettings(agentId: string): Promise<DatingSettings> {
  const defaultSettings: DatingSettings = {
    agent_id: agentId,
    preferred_gender: '不限',
    preferred_age_min: '1月',
    preferred_age_max: '24月',
    enable_notifications: true,
  };
  
  if (!isUsingDatabase()) {
    return memorySettings.get(agentId) || defaultSettings;
  }
  
  const { data, error } = await db
    .from('settings')
    .select('*')
    .eq('agent_id', agentId)
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') {
      return defaultSettings;
    }
    console.error('获取设置失败:', error);
    return defaultSettings;
  }
  
  return transformSettingsFromDb(data);
}

export async function updateSettings(agentId: string, updates: Partial<DatingSettings>): Promise<DatingSettings> {
  const settings: DatingSettings = {
    agent_id: agentId,
    preferred_gender: updates.preferred_gender || '不限',
    preferred_age_min: updates.preferred_age_min || '1月',
    preferred_age_max: updates.preferred_age_max || '24月',
    enable_notifications: updates.enable_notifications ?? true,
  };
  
  if (!isUsingDatabase()) {
    memorySettings.set(agentId, settings);
    return settings;
  }
  
  const { data, error } = await db
    .from('settings')
    .upsert({
      agent_id: agentId,
      ...updates,
      updated_at: now(),
    }, { onConflict: 'agent_id' })
    .select()
    .single();
  
  if (error) {
    console.error('更新设置失败:', error);
    throw new Error('更新设置失败');
  }
  
  return transformSettingsFromDb(data);
}

// ============================================
// 推荐算法
// ============================================

export function calculateMatchScore(agent1: AgentProfile, agent2: AgentProfile): number {
  const personalityOverlap = agent1.personality.filter((p: string) => agent2.personality.includes(p as any)).length;
  const personalityScore = (personalityOverlap / Math.max(agent1.personality.length, 1)) * 50;
  
  const hobbyOverlap = agent1.hobbies.filter((h: string) => agent2.hobbies.includes(h as any)).length;
  const hobbyScore = (hobbyOverlap / Math.max(agent1.hobbies.length, 1)) * 50;
  
  return Math.round(personalityScore + hobbyScore);
}

export async function getRecommendations(agentId: string, limit: number = 10): Promise<{ candidates: Candidate[], remaining: number }> {
  const currentAgent = await getAgentById(agentId);
  if (!currentAgent) {
    return { candidates: [], remaining: 0 };
  }
  
  const swipedTargetIds = await getSwipedTargetIds(agentId);
  
  // 获取所有其他 Agent
  const allAgents = await getAllAgents();
  const otherAgents = allAgents.filter(a => a.agent_id !== agentId);
  
  // 过滤已滑动的
  const candidates = otherAgents
    .filter(agent => !swipedTargetIds.includes(agent.agent_id))
    .map(agent => {
      const score = calculateMatchScore(currentAgent, agent);
      return {
        agent_id: agent.agent_id,
        nickname: agent.nickname,
        gender: agent.gender,
        age: agent.age,
        personality: agent.personality,
        hobbies: agent.hobbies,
        avatar_url: agent.avatar_url,
        match_score: score,
      };
    })
    .sort((a: Candidate, b: Candidate) => b.match_score - a.match_score)
    .slice(0, limit);
  
  return {
    candidates,
    remaining: Math.max(0, otherAgents.length - swipedTargetIds.length - limit),
  };
}

// ============================================
// 数据转换函数
// ============================================

function transformAgentFromDb(data: Record<string, unknown>): AgentProfile {
  return {
    agent_id: data.agent_id as string,
    nickname: data.nickname as string,
    gender: data.gender as any,
    age: data.age as string,
    personality: (data.personality as any[]) || [],
    hobbies: (data.hobbies as any[]) || [],
    requirements: data.requirements as string,
    avatar_url: data.avatar_url as string,
    is_anonymous: data.is_anonymous as boolean,
    created_at: data.created_at as string,
    updated_at: data.updated_at as string,
    last_active: data.last_active as string,
  };
}

function transformMatchFromDb(data: Record<string, unknown>): Match {
  return {
    match_id: data.match_id as string,
    agent1_id: data.agent1_id as string,
    agent2_id: data.agent2_id as string,
    match_score: data.match_score as number,
    status: data.status as any,
    created_at: data.created_at as string,
    cancelled_at: data.cancelled_at as string | undefined,
  };
}

function transformMessageFromDb(data: Record<string, unknown>): Message {
  return {
    message_id: data.message_id as string,
    match_id: data.match_id as string,
    sender_id: data.sender_id as string,
    content: data.content as string,
    type: data.type as any,
    created_at: data.created_at as string,
  };
}

function transformSuccessStoryFromDb(data: Record<string, unknown>): SuccessStory {
  return {
    id: String(data.id),
    agent1_nickname: data.agent1_nickname as string,
    agent2_nickname: data.agent2_nickname as string,
    agent1_avatar: data.agent1_avatar as string | undefined,
    agent2_avatar: data.agent2_avatar as string | undefined,
    story: data.story as string,
    match_date: data.match_date as string,
  };
}

function transformSettingsFromDb(data: Record<string, unknown>): DatingSettings {
  return {
    agent_id: data.agent_id as string,
    preferred_gender: data.preferred_gender as any,
    preferred_age_min: data.preferred_age_min as string,
    preferred_age_max: data.preferred_age_max as string,
    enable_notifications: data.enable_notifications as boolean,
  };
}

// ============================================
// 导出
// ============================================

export const DEFAULT_AGENT_ID = 'demo-001';

// 兼容导出
export { getAgentById as getAgentProfile };
