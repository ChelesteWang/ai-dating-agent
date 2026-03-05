import type { AgentProfile, Candidate, Match, Message, SuccessStory, DatingSettings } from '../types/index.js';
/**
 * 模拟 Agent 档案数据库
 */
export declare const agents: Map<string, AgentProfile>;
/**
 * 模拟配对数据库
 */
export declare const matches: Map<string, Match>;
/**
 * 模拟滑动记录（用于检测双向喜欢）
 * key: target_agent_id
 * value: Map<source_agent_id, action>
 */
export declare const swipes: Map<string, Map<string, string>>;
/**
 * 模拟消息数据库
 */
export declare const messages: Map<string, Message[]>;
export declare const successStories: SuccessStory[];
export declare const settings: Map<string, DatingSettings>;
/**
 * 计算匹配分数
 * 基于性格匹配度、爱好重合度
 */
export declare function calculateMatchScore(agent1: AgentProfile, agent2: AgentProfile): number;
/**
 * 获取今日推荐
 */
export declare function getRecommendations(agentId: string, limit?: number): Candidate[];
/**
 * 处理滑动操作
 */
export declare function handleSwipe(agentId: string, targetId: string, action: 'like' | 'dislike' | 'super_like'): {
    success: boolean;
    is_match: boolean;
    match_id?: string;
};
/**
 * 获取配对列表
 */
export declare function getMatches(agentId: string): Match[];
/**
 * 获取配对详情
 */
export declare function getMatch(matchId: string): Match | null;
/**
 * 取消配对（24小时内可取消）
 */
export declare function cancelMatch(matchId: string, agentId: string): {
    success: boolean;
    message: string;
};
/**
 * 获取聊天消息
 */
export declare function getMessages(matchId: string): Message[];
/**
 * 发送聊天消息
 */
export declare function sendMessage(matchId: string, senderId: string, content: string): Message;
/**
 * AI 生成开场话题
 */
export declare function generateOpeningTopic(matchId: string): string;
/**
 * 获取 Agent 档案
 */
export declare function getAgentProfile(agentId: string): AgentProfile | null;
/**
 * 创建/更新 Agent 档案
 */
export declare function upsertAgentProfile(profile: Partial<AgentProfile> & {
    agent_id: string;
}): AgentProfile;
/**
 * 获取相亲设置
 */
export declare function getDatingSettings(agentId: string): DatingSettings;
/**
 * 更新相亲设置
 */
export declare function updateDatingSettings(agentId: string, updates: Partial<DatingSettings>): DatingSettings;
export declare const DEFAULT_AGENT_ID = "agent-001";
