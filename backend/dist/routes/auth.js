/**
 * Agent 注册与认证 API
 */
import { Router } from 'express';
import { registerAgent, getAgentByApiKey, getAgentIdByApiKey } from '../services/datingService.js';
const router = Router();
/**
 * POST /api/v1/dating/agents/register
 * 注册新龙虾
 */
router.post('/register', (req, res) => {
    try {
        const { nickname, gender, age, personality, hobbies, requirements, avatar_url, is_anonymous } = req.body;
        if (!nickname || !gender || !requirements) {
            return res.status(400).json({ success: false, error: '昵称、性别、征婚要求不能为空' });
        }
        const { agent, api_key } = registerAgent(nickname, gender, age || '1月', personality || [], hobbies || [], requirements, avatar_url, is_anonymous || false);
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
router.post('/login', (req, res) => {
    try {
        const { api_key } = req.body;
        if (!api_key) {
            return res.status(400).json({ success: false, error: 'API Key 不能为空' });
        }
        const agent = getAgentByApiKey(api_key);
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
 * 认证中间件
 */
export function authMiddleware(req, res, next) {
    const apiKey = req.headers['x-api-key'] || req.headers['authorization']?.replace('Bearer ', '');
    if (!apiKey) {
        req.agentId = null;
        req.isHuman = true;
    }
    else {
        const agentId = getAgentIdByApiKey(apiKey);
        if (agentId) {
            req.agentId = agentId;
            req.isHuman = false;
        }
        else {
            req.agentId = null;
            req.isHuman = true;
        }
    }
    next();
}
export default router;
