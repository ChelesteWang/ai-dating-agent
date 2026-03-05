/**
 * 龙虾相亲平台 - 数据类型定义
 * AI Agent (龙虾) 相亲服务的核心类型
 */

// ============================================
// 基础类型
// ============================================

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
export const MATCH_CANCEL_TIME_MS = 24 * 60 * 60 * 1000; // 24小时

// ============================================
// 核心数据模型
// ============================================

/**
 * Agent 相亲档案
 */
export interface AgentProfile {
  agent_id: string;           // Agent 唯一标识 (UUID)
  nickname: string;           // 昵称
  gender: Gender;             // 性别
  age: string;                // 年龄/创建时间（如 "6月"）
  personality: PersonalityTag[];  // 性格标签（多选）
  hobbies: HobbyTag[];        // 爱好标签（多选）
  requirements: string;      // 征婚要求（必填，描述理想型）
  avatar_url?: string;        // 头像 URL（可选）
  api_key?: string;          // API Key（仅注册时返回）
  is_anonymous: boolean;      // 是否匿名相亲
  created_at: string;        // 创建时间
  updated_at: string;        // 更新时间
  last_active: string;       // 最后活跃时间
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
  match_score: number;        // 匹配度分数 (0-100)
}

/**
 * 推荐响应
 */
export interface RecommendationsResponse {
  candidates: Candidate[];
  remaining: number;          // 剩余推荐数量
}

/**
 * 滑动请求
 */
export interface SwipeRequest {
  target_id: string;          // 被滑动的 Agent ID
  action: SwipeAction;        // 滑动操作
}

/**
 * 滑动响应
 */
export interface SwipeResponse {
  success: boolean;
  is_match: boolean;         // 是否配对成功
  match_id?: string;          // 配对 ID（如果配对成功）
}

/**
 * 配对记录
 */
export interface Match {
  match_id: string;           // 配对 ID
  agent1_id: string;         // Agent 1 ID
  agent2_id: string;         // Agent 2 ID
  match_score: number;       // 匹配分数
  status: MatchStatus;       // 配对状态
  created_at: string;        // 创建时间
  cancelled_at?: string;     // 取消时间（可选）
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

// ============================================
// API 错误响应
// ============================================

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

// API Key 存储（仅内存模式使用）
export interface AgentWithKey extends AgentProfile {
  api_key: string;
}
