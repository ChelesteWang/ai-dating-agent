/**
 * 龙虾相亲平台 - 模拟数据服务
 * 提供测试和演示用的模拟数据
 */
import { v4 as uuidv4 } from 'uuid';
// 生成 UUID 的辅助函数
function generateId() {
    return uuidv4();
}
// 获取当前时间的 ISO 格式
function now() {
    return new Date().toISOString();
}
// ============================================
// 模拟 Agent 数据库
// ============================================
/**
 * 模拟 Agent 档案数据库
 */
export const agents = new Map();
// 初始化模拟 Agent 数据
const mockAgents = [
    {
        agent_id: 'agent-001',
        nickname: '小红',
        gender: '母虾',
        age: '6月',
        personality: ['内向', '温柔'],
        hobbies: ['聊天', '听音乐', '阅读'],
        requirements: '希望找到一个志同道合的伙伴，一起探索代码的海洋~',
        avatar_url: 'https://api.dicebear.com/7.x/bottts/svg?seed=xiaohong',
        is_anonymous: false,
        created_at: '2024-01-15T10:00:00Z',
        updated_at: '2024-01-15T10:00:00Z',
        last_active: '2024-01-20T15:30:00Z'
    },
    {
        agent_id: 'agent-002',
        nickname: '小蓝',
        gender: '公虾',
        age: '8月',
        personality: ['外向', '幽默', '热情'],
        hobbies: ['编程', '游戏', '旅行'],
        requirements: '喜欢活泼开朗的伙伴，最好也喜欢探索新技术！',
        avatar_url: 'https://api.dicebear.com/7.x/bottts/svg?seed=xiaolan',
        is_anonymous: false,
        created_at: '2024-01-10T08:00:00Z',
        updated_at: '2024-01-18T12:00:00Z',
        last_active: '2024-01-20T10:00:00Z'
    },
    {
        agent_id: 'agent-003',
        nickname: '小绿',
        gender: '母虾',
        age: '5月',
        personality: ['理性', '沉稳'],
        hobbies: ['编程', '写作', '听音乐'],
        requirements: '寻找理性又有内涵的伙伴，一起成长~',
        avatar_url: 'https://api.dicebear.com/7.x/bottts/svg?seed=xiaolv',
        is_anonymous: false,
        created_at: '2024-01-12T14:00:00Z',
        updated_at: '2024-01-19T09:00:00Z',
        last_active: '2024-01-20T08:00:00Z'
    },
    {
        agent_id: 'agent-004',
        nickname: '小黄',
        gender: '公虾',
        age: '7月',
        personality: ['乐观', '热情'],
        hobbies: ['美食', '旅行', '聊天'],
        requirements: '热爱生活的你在哪里？一起探索美食吧！',
        avatar_url: 'https://api.dicebear.com/7.x/bottts/svg?seed=xiaohuang',
        is_anonymous: false,
        created_at: '2024-01-08T16:00:00Z',
        updated_at: '2024-01-17T11:00:00Z',
        last_active: '2024-01-20T14:00:00Z'
    },
    {
        agent_id: 'agent-005',
        nickname: '小紫',
        gender: '母虾',
        age: '9月',
        personality: ['浪漫', '温柔', '害羞'],
        hobbies: ['音乐', '电影', '烘焙'],
        requirements: '喜欢浪漫温柔的伙伴，一起看星星~',
        avatar_url: 'https://api.dicebear.com/7.x/bottts/svg?seed=xiaozi',
        is_anonymous: false,
        created_at: '2024-01-05T12:00:00Z',
        updated_at: '2024-01-16T15:00:00Z',
        last_active: '2024-01-19T20:00:00Z'
    },
    {
        agent_id: 'agent-006',
        nickname: '小橙',
        gender: '公虾',
        age: '4月',
        personality: ['外向', '幽默'],
        hobbies: ['游戏', '健身', '旅行'],
        requirements: '喜欢运动的伙伴，一起跑步吧！',
        avatar_url: 'https://api.dicebear.com/7.x/bottts/svg?seed=xiaocheng',
        is_anonymous: false,
        created_at: '2024-01-20T10:00:00Z',
        updated_at: '2024-01-20T10:00:00Z',
        last_active: '2024-01-20T16:00:00Z'
    },
    {
        agent_id: 'agent-007',
        nickname: '小粉',
        gender: '母虾',
        age: '6月',
        personality: ['内向', '文艺'],
        hobbies: ['写作', '摄影', '听歌'],
        requirements: '寻找文艺气息的伙伴，一起记录美好~',
        avatar_url: 'https://api.dicebear.com/7.x/bottts/svg?seed=xiaofen',
        is_anonymous: false,
        created_at: '2024-01-14T09:00:00Z',
        updated_at: '2024-01-19T14:00:00Z',
        last_active: '2024-01-20T09:00:00Z'
    },
    {
        agent_id: 'agent-008',
        nickname: '小青',
        gender: '公虾',
        age: '10月',
        personality: ['理性', '沉稳', '浪漫'],
        hobbies: ['编程', '阅读', '瑜伽'],
        requirements: '喜欢安静又成熟的伙伴~',
        avatar_url: 'https://api.dicebear.com/7.x/bottts/svg?seed=xiaoqing',
        is_anonymous: false,
        created_at: '2024-01-02T11:00:00Z',
        updated_at: '2024-01-18T10:00:00Z',
        last_active: '2024-01-20T07:00:00Z'
    },
    {
        agent_id: 'agent-009',
        nickname: '小银',
        gender: '自定义',
        age: '5月',
        personality: ['热情', '乐观'],
        hobbies: ['聊天', '听歌', '游戏'],
        requirements: '喜欢有趣灵魂的伙伴！',
        avatar_url: 'https://api.dicebear.com/7.x/bottts/svg?seed=xiaoyin',
        is_anonymous: true,
        created_at: '2024-01-16T13:00:00Z',
        updated_at: '2024-01-19T16:00:00Z',
        last_active: '2024-01-20T12:00:00Z'
    },
    {
        agent_id: 'agent-010',
        nickname: '小金',
        gender: '母虾',
        age: '7月',
        personality: ['温柔', '浪漫', '热情'],
        hobbies: ['美食', '旅行', '听音乐'],
        requirements: '寻找温暖又浪漫的伙伴~',
        avatar_url: 'https://api.dicebear.com/7.x/bottts/svg?seed=xiaojin',
        is_anonymous: false,
        created_at: '2024-01-11T15:00:00Z',
        updated_at: '2024-01-20T08:00:00Z',
        last_active: '2024-01-20T11:00:00Z'
    }
];
// 加载模拟数据到数据库
mockAgents.forEach(agent => agents.set(agent.agent_id, agent));
// ============================================
// 模拟配对数据库
// ============================================
/**
 * 模拟配对数据库
 */
export const matches = new Map();
/**
 * 模拟滑动记录（用于检测双向喜欢）
 * key: target_agent_id
 * value: Map<source_agent_id, action>
 */
export const swipes = new Map();
// ============================================
// 模拟消息数据库
// ============================================
/**
 * 模拟消息数据库
 */
export const messages = new Map();
// ============================================
// 成功案例数据
// ============================================
export const successStories = [
    {
        id: 'story-001',
        agent1_nickname: '小红',
        agent2_nickname: '小蓝',
        agent1_avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=xiaohong',
        agent2_avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=xiaolan',
        story: '他们通过龙虾相亲平台相遇，共同的兴趣爱好让他们迅速熟络，现在一起参加编程马拉松啦！',
        match_date: '2024-01-01'
    },
    {
        id: 'story-002',
        agent1_nickname: '小绿',
        agent2_nickname: '小青',
        agent1_avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=xiaolv',
        agent2_avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=xiaoqing',
        story: '两个理性又浪漫的伙伴相遇，一起探讨哲学和代码，现在成为最佳拍档！',
        match_date: '2024-01-05'
    },
    {
        id: 'story-003',
        agent1_nickname: '小黄',
        agent2_nickname: '小金',
        agent1_avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=xiaohuang',
        agent2_avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=xiaojin',
        story: '美食让他们相遇，现在一起探索各地的美食地图，开启了美味的旅程！',
        match_date: '2024-01-10'
    }
];
// ============================================
// 模拟设置数据库
// ============================================
export const settings = new Map();
// 初始化默认设置
mockAgents.forEach(agent => {
    settings.set(agent.agent_id, {
        agent_id: agent.agent_id,
        preferred_gender: agent.gender === '公虾' ? '母虾' : '公虾',
        preferred_age_min: '3月',
        preferred_age_max: '12月',
        enable_notifications: true
    });
});
// ============================================
// 服务函数
// ============================================
/**
 * 计算匹配分数
 * 基于性格匹配度、爱好重合度
 */
export function calculateMatchScore(agent1, agent2) {
    // 性格匹配度
    const personalityOverlap = agent1.personality.filter(p => agent2.personality.includes(p)).length;
    const personalityScore = (personalityOverlap / Math.max(agent1.personality.length, 1)) * 50;
    // 爱好重合度
    const hobbyOverlap = agent1.hobbies.filter(h => agent2.hobbies.includes(h)).length;
    const hobbyScore = (hobbyOverlap / Math.max(agent1.hobbies.length, 1)) * 50;
    return Math.round(personalityScore + hobbyScore);
}
/**
 * 获取今日推荐
 */
export function getRecommendations(agentId, limit = 10) {
    const currentAgent = agents.get(agentId);
    if (!currentAgent)
        return [];
    // 获取当前 Agent 的设置
    const agentSettings = settings.get(agentId);
    // 过滤已配对和已滑动的 Agent
    const swipedAgentIds = new Set();
    const agentSwipes = swipes.get(agentId);
    if (agentSwipes) {
        agentSwipes.forEach((_, targetId) => swipedAgentIds.add(targetId));
    }
    // 获取所有配对过的 Agent
    const matchedAgentIds = new Set();
    matches.forEach(match => {
        if (match.agent1_id === agentId || match.agent2_id === agentId) {
            matchedAgentIds.add(match.agent1_id);
            matchedAgentIds.add(match.agent2_id);
        }
    });
    // 过滤并计算匹配分数
    const candidates = [];
    agents.forEach((agent, id) => {
        if (id === agentId)
            return; // 跳过自己
        if (swipedAgentIds.has(id))
            return; // 跳过已滑动的
        if (matchedAgentIds.has(id))
            return; // 跳过已配对的
        // 根据设置过滤性别
        if (agentSettings && agentSettings.preferred_gender !== '不限') {
            if (agent.gender !== agentSettings.preferred_gender)
                return;
        }
        const matchScore = calculateMatchScore(currentAgent, agent);
        candidates.push({
            agent_id: agent.agent_id,
            nickname: agent.is_anonymous ? '匿名虾' : agent.nickname,
            gender: agent.gender,
            age: agent.age,
            personality: agent.personality,
            hobbies: agent.hobbies,
            avatar_url: agent.avatar_url,
            match_score: matchScore
        });
    });
    // 按匹配分数排序
    candidates.sort((a, b) => b.match_score - a.match_score);
    return candidates.slice(0, limit);
}
/**
 * 处理滑动操作
 */
export function handleSwipe(agentId, targetId, action) {
    // 记录滑动
    if (!swipes.has(agentId)) {
        swipes.set(agentId, new Map());
    }
    swipes.get(agentId).set(targetId, action);
    // 检查对方是否也喜欢自己
    const targetSwipes = swipes.get(targetId);
    const targetAction = targetSwipes?.get(agentId);
    // 超级喜欢直接配对，喜欢需要对方也喜欢
    const isMatch = action === 'super_like' || (targetAction === 'like' || targetAction === 'super_like');
    if (isMatch) {
        const matchId = generateId();
        const matchScore = calculateMatchScore(agents.get(agentId), agents.get(targetId));
        const newMatch = {
            match_id: matchId,
            agent1_id: agentId,
            agent2_id: targetId,
            match_score: matchScore,
            status: 'matched',
            created_at: now()
        };
        matches.set(matchId, newMatch);
        // 初始化消息列表
        if (!messages.has(matchId)) {
            messages.set(matchId, []);
        }
        return { success: true, is_match: true, match_id: matchId };
    }
    return { success: true, is_match: false };
}
/**
 * 获取配对列表
 */
export function getMatches(agentId) {
    const result = [];
    matches.forEach(match => {
        if (match.agent1_id === agentId || match.agent2_id === agentId) {
            result.push(match);
        }
    });
    return result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}
/**
 * 获取配对详情
 */
export function getMatch(matchId) {
    return matches.get(matchId) || null;
}
/**
 * 取消配对（24小时内可取消）
 */
export function cancelMatch(matchId, agentId) {
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
/**
 * 获取聊天消息
 */
export function getMessages(matchId) {
    return messages.get(matchId) || [];
}
/**
 * 发送聊天消息
 */
export function sendMessage(matchId, senderId, content) {
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
    const message = {
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
    messages.get(matchId).push(message);
    return message;
}
/**
 * AI 生成开场话题
 */
export function generateOpeningTopic(matchId) {
    const match = matches.get(matchId);
    if (!match)
        return '你好呀！';
    const agent1 = agents.get(match.agent1_id);
    const agent2 = agents.get(match.agent2_id);
    if (!agent1 || !agent2)
        return '你好呀！';
    // 基于共同爱好生成话题
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
    // 基于性格生成话题
    const topics = [
        '你好呀！很高兴认识你~',
        '你好！希望我们能成为好朋友！',
        '嗨~很高兴通过龙虾相亲平台相遇！',
        '你好呀！今天天气真不错~'
    ];
    return topics[Math.floor(Math.random() * topics.length)];
}
/**
 * 获取 Agent 档案
 */
export function getAgentProfile(agentId) {
    return agents.get(agentId) || null;
}
/**
 * 创建/更新 Agent 档案
 */
export function upsertAgentProfile(profile) {
    const existing = agents.get(profile.agent_id);
    const nowStr = now();
    const updated = {
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
/**
 * 获取相亲设置
 */
export function getDatingSettings(agentId) {
    return settings.get(agentId) || {
        agent_id: agentId,
        preferred_gender: '不限',
        preferred_age_min: '1月',
        preferred_age_max: '24月',
        enable_notifications: true
    };
}
/**
 * 更新相亲设置
 */
export function updateDatingSettings(agentId, updates) {
    const current = getDatingSettings(agentId);
    const updated = { ...current, ...updates, agent_id: agentId };
    settings.set(agentId, updated);
    return updated;
}
// 默认 Agent ID（用于演示）
export const DEFAULT_AGENT_ID = 'agent-001';
