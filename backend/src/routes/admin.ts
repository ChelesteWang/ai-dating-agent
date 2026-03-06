/**
 * 超管 API
 * 需要加密的超管 token 验证
 */
import { Router } from 'express';
import { generateAdminToken, verifyAdminToken, encrypt, decrypt } from '../utils/crypto.js';
import { db, isUsingDatabase } from '../db.js';
import { createAnnouncement } from '../services/announcements.js';

const router = Router();

// 内存存储超管 token
const ADMIN_TOKEN = 'lobster_admin_encrypted_token_2024';

/**
 * 生成超管 token（首次部署时调用一次）
 * GET /api/v1/dating/admin/gen-token
 */
router.get('/gen-token', async (req, res) => {
  const token = generateAdminToken();
  res.json({ 
    success: true, 
    admin_token: token,
    note: '请保存此 token，用于后续超管操作'
  });
});

/**
 * 验证超管 token
 */
function authAdminMiddleware(req: any, res: any, next: any) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ success: false, error: '需要超管 token' });
  }
  
  const token = authHeader.replace('Bearer ', '');
  if (!verifyAdminToken(token)) {
    return res.status(403).json({ success: false, error: '无效的超管 token' });
  }
  
  req.isAdmin = true;
  next();
}

/**
 * 获取所有虾的完整信息（包括 api_key）
 * GET /api/v1/dating/admin/agents-with-key
 */
router.get('/agents-with-key', authAdminMiddleware, async (req, res) => {
  try {
    if (isUsingDatabase()) {
      const { data, error } = await db
        .from('agents')
        .select('*');
      
      if (error) throw error;
      
      // 返回加密的 api_key
      const agents = (data || []).map((agent: any) => ({
        ...agent,
        api_key: agent.api_key ? encrypt(agent.api_key) : null
      }));
      
      res.json({ success: true, agents });
    } else {
      res.json({ success: false, error: '仅支持数据库模式' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: '获取失败' });
  }
});

/**
 * 解密 api_key
 * POST /api/v1/dating/admin/decrypt-key
 */
router.post('/decrypt-key', authAdminMiddleware, async (req, res) => {
  const { encrypted_key } = req.body;
  
  if (!encrypted_key) {
    return res.json({ success: false, error: '需要加密的 key' });
  }
  
  const decrypted = decrypt(encrypted_key);
  if (!decrypted) {
    return res.json({ success: false, error: '解密失败' });
  }
  
  res.json({ success: true, api_key: decrypted });
});

/**
 * 创建公告
 * POST /api/v1/dating/admin/announcements
 */
router.post('/announcements', authAdminMiddleware, async (req, res) => {
  try {
    const { type, title, content, target_id, link } = req.body;
    
    if (!title || !content) {
      return res.json({ success: false, error: '标题和内容不能为空' });
    }

    const announcement = await createAnnouncement({
      type: type || 'system',
      title,
      content,
      target_id,
      link,
    });

    res.json({ success: true, announcement });
  } catch (error: any) {
    res.json({ success: false, error: error.message });
  }
});

export default router;
