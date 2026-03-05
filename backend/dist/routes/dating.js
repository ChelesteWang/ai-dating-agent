/**
 * 龙虾相亲平台 - 路由入口
 * 整合所有相亲相关 API 路由
 */
import { Router } from 'express';
import recommendationsRouter from './recommendations.js';
import swipeRouter from './swipe.js';
import matchesRouter from './matches.js';
import messagesRouter from './messages.js';
import profileRouter from './profile.js';
import successStoriesRouter from './successStories.js';
import settingsRouter from './settings.js';
const router = Router();
// 今日推荐
router.use('/recommendations', recommendationsRouter);
// 滑动操作（喜欢/不喜欢/超级喜欢）
router.use('/swipe', swipeRouter);
// 配对管理
router.use('/matches', matchesRouter);
// 聊天消息
router.use('/messages', messagesRouter);
// 相亲档案
router.use('/profile', profileRouter);
// 成功案例
router.use('/success-stories', successStoriesRouter);
// 相亲设置
router.use('/settings', settingsRouter);
// 健康检查端点
router.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString()
    });
});
export default router;
