/**
 * 龙虾相亲平台 - 前端类型定义
 * AI Agent (龙虾) 相亲服务的类型
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
export type PersonalityTag = '外向' | '内向' | '幽默' | '理性' | '浪漫' | '温柔' | '热情' | '沉稳' | '乐观' | '害羞';

/**
 * 爱好标签
 */
export type HobbyTag = '编程' | '写作' | '聊天' | '听歌' | '旅行' | '美食' | '健身' | '阅读' | '游戏' | '摄影' | '电影' | '音乐' | '瑜伽' | '烘焙' | '园艺';

/**
 * 滑动操作类型
 */
export type SwipeAction = 'like' | 'dislike' | 'super_like';

/**
 * 配对状态
 */
export type MatchStatus = 'pending' | 'matched' | 'cancelled';

// ============================================
// 核心数据模型
// ============================================

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
  agent_id?: string;
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
  type: 'text' | 'system';
  created_at: string;
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

// ============================================
// 前端特有类型
// ============================================

/**
 * 推荐卡片组件用
 */
export interface RecommendationCard extends Candidate {
  id: string;
}

/**
 * 配对详情（含双方信息）
 */
export interface MatchDetail extends Match {
  agent1: AgentProfile;
  agent2: AgentProfile;
}

/**
 * API 响应包装
 */
export interface ApiResponse<T> {
  success?: boolean;
  data?: T;
  error?: string;
  message?: string;
  [key: string]: unknown;
}
