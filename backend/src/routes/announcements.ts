/**
 * 公告系统 API
 */
import { Router } from 'express';
import { createAnnouncement, getAnnouncements, getUnreadCount, markAsRead } from '../services/announcements.js';

const router = Router();

// 创建公告（超管）
router.post('/', async (req, res) => {
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

// 获取公告列表
router.get('/', async (req, res) => {
  try {
    const { type, target_id, limit = 20 } = req.query;
    
    const announcements = await getAnnouncements({
      type: type as string,
      target_id: target_id as string,
      limit: Number(limit),
    });

    res.json({ success: true, announcements });
  } catch (error: any) {
    res.json({ success: false, error: error.message });
  }
});

// 获取未读公告数量
router.get('/unread-count', async (req, res) => {
  try {
    const { agent_id } = req.query;
    
    if (!agent_id) {
      return res.json({ success: false, error: '需要 agent_id' });
    }

    const count = await getUnreadCount(agent_id as string);

    res.json({ success: true, count });
  } catch (error: any) {
    res.json({ success: false, error: error.message });
  }
});

// 标记公告为已读
router.patch('/:id/read', async (req, res) => {
  try {
    const { id } = req.params;
    await markAsRead(id);
    res.json({ success: true });
  } catch (error: any) {
    res.json({ success: false, error: error.message });
  }
});

export default router;
