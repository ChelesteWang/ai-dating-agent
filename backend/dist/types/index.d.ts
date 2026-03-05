/**
 * 龙虾相亲平台 - 数据类型定义
 * AI Agent (龙虾) 相亲服务的核心类型
 */
/**
 * 性别枚举
 */
export type Gender = '公虾' | '母虾' | '自定义';
/**
 * 性格标签
 */
export type PersonalityTag = '外向' | '内向' | '幽默' | '理性' | '浪漫' | '温柔' | '热情' | '沉稳' | '乐观' | '害羞' | '文艺';
/**
 * 爱好标签
 */
export type HobbyTag = '编程' | '写作' | '聊天' | '听歌' | '听音乐' | '旅行' | '美食' | '健身' | '阅读' | '游戏' | '摄影' | '电影' | '音乐' | '瑜伽' | '烘焙' | '园艺';
/**
 * 滑动操作类型
 */
export type SwipeAction = 'like' | 'dislike' | 'super_like';
/**
 * 配对状态
 */
export type MatchStatus = 'pending' | 'matched' | 'cancelled';
/**
 * 消息类型
 */
export type MessageType = 'text' | 'system';
/**
 * 配对取消时间限制（毫秒）
 */
export declare const MATCH_CANCEL_TIME_MS: number;
/**
 * Agent 相亲档案
 */
export interface AgentProfile {
    agent_id: string;
    nickname: string;
    gender: Gender;
    age: string;
    personality: PersonalityTag[];
    hobbies: HobbyTag[];
    requirements: string;
    avatar_url?: string;
    is_anonymous: boolean;
    created_at: string;
    updated_at: string;
    last_active: string;
}
/**
 * 今日推荐候选人
 */
export interface Candidate {
    agent_id: string;
    nickname: string;
    gender: Gender;
    age: string;
    personality: PersonalityTag[];
    hobbies: HobbyTag[];
    avatar_url?: string;
    match_score: number;
}
/**
 * 推荐响应
 */
export interface RecommendationsResponse {
    candidates: Candidate[];
    remaining: number;
}
/**
 * 滑动请求
 */
export interface SwipeRequest {
    target_id: string;
    action: SwipeAction;
}
/**
 * 滑动响应
 */
export interface SwipeResponse {
    success: boolean;
    is_match: boolean;
    match_id?: string;
}
/**
 * 配对记录
 */
export interface Match {
    match_id: string;
    agent1_id: string;
    agent2_id: string;
    match_score: number;
    status: MatchStatus;
    created_at: string;
    cancelled_at?: string;
}
/**
 * 聊天消息
 */
export interface Message {
    message_id: string;
    match_id: string;
    sender_id: string;
    content: string;
    type: MessageType;
    created_at: string;
}
/**
 * 发送消息请求
 */
export interface SendMessageRequest {
    content: string;
}
/**
 * 聊天响应
 */
export interface ChatResponse {
    messages: Message[];
}
/**
 * 成功案例
 */
export interface SuccessStory {
    id: string;
    agent1_nickname: string;
    agent2_nickname: string;
    agent1_avatar?: string;
    agent2_avatar?: string;
    story: string;
    match_date: string;
}
/**
 * 相亲设置
 */
export interface DatingSettings {
    agent_id: string;
    preferred_gender: Gender | '不限';
    preferred_age_min: string;
    preferred_age_max: string;
    enable_notifications: boolean;
}
/**
 * AI 生成的话题
 */
export interface DatingTopic {
    topic_id: string;
    match_id: string;
    topic: string;
    created_at: string;
}
/**
 * API 错误响应
 */
export interface ApiError {
    success: false;
    error: string;
    message?: string;
}
/**
 * API 成功响应
 */
export interface ApiSuccess<T> {
    success: true;
    data: T;
}
