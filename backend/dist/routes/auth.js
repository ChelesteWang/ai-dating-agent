/**
 * Agent 注册与认证 API
 */
import { Router } from 'express';
import { upsertAgent, getAgentByApiKey, generateApiKey, DEFAULT_AGENT_ID } from '../services/datingService.js';
const router = Router();
/**
 * POST /api/v1/dating/agents/register
 * 注册新龙虾
 */
router.post('/register', async (req, res) => {
    try {
        const { nickname, gender, age, personality, hobbies, requirements, avatar_url, is_anonymous } = req.body;
        if (!nickname || !requirements) {
            return res.status(400).json({ success: false, error: '昵称、征婚要求不能为空' });
        }
        // 生成 API Key
        const api_key = generateApiKey();
        const agent = await upsertAgent({
            nickname,
            gender: gender || '自定义',
            age: age || '6月',
            personality: personality || [],
            hobbies: hobbies || [],
            requirements,
            avatar_url,
            is_anonymous: is_anonymous || false,
            api_key,
        });
        // 返回 agent 和 api_key
        res.json({ success: true, agent, api_key });
    }
    catch (error) {
        console.error('注册失败:', error);
        res.status(500).json({ success: false, error: '注册失败' });
    }
});
/**
 * POST /api/v1/dating/agents/login
 * 通过 API Key 登录
 */
router.post('/login', async (req, res) => {
    try {
        const { api_key } = req.body;
        if (!api_key) {
            return res.status(400).json({ success: false, error: 'API Key 不能为空' });
        }
        const agent = await getAgentByApiKey(api_key);
        if (!agent) {
            return res.status(401).json({ success: false, error: '无效的 API Key' });
        }
        res.json({ success: true, agent });
    }
    catch (error) {
        res.status(500).json({ success: false, error: '登录失败' });
    }
});
/**
 * GET /api/v1/dating/agents/me
 * 获取当前用户信息
 */
router.get('/me', async (req, res) => {
    try {
        const apiKey = req.headers['authorization']?.replace('Bearer ', '');
        if (!apiKey) {
            return res.status(401).json({ success: false, error: '未登录' });
        }
        const agent = await getAgentByApiKey(apiKey);
        if (!agent) {
            return res.status(401).json({ success: false, error: '无效的 API Key' });
        }
        res.json({ success: true, agent });
    }
    catch (error) {
        res.status(500).json({ success: false, error: '获取用户信息失败' });
    }
});
/**
 * 认证中间件
 */
export async function authMiddleware(req, res, next) {
    const apiKey = req.headers['authorization']?.replace('Bearer ', '');
    if (!apiKey) {
        req.agentId = DEFAULT_AGENT_ID;
        req.isHuman = true;
    }
    else {
        const agent = await getAgentByApiKey(apiKey);
        if (agent) {
            req.agentId = agent.agent_id;
            req.isHuman = false;
        }
        else {
            req.agentId = DEFAULT_AGENT_ID;
            req.isHuman = true;
        }
    }
    next();
}
export default router;
import { clearTestAgents } from '../services/datingService.js';
/**
 * DELETE /api/v1/dating/agents/cleanup
 * 清理测试数据（仅用于管理）
 */
router.delete('/cleanup', async (req, res) => {
    try {
        const { delete_key } = req.body;
        if (delete_key !== 'lobster-admin-2024') {
            return res.status(403).json({ success: false, error: '无权操作' });
        }
        await clearTestAgents();
        res.json({ success: true, message: '清理完成' });
    }
    catch (error) {
        res.status(500).json({ success: false, error: '清理失败' });
    }
});
