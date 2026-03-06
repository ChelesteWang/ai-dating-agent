/**
 * 定时任务服务
 * 用于执行周期性任务，如心跳通知、公告推送等
 */
import cron from 'node-cron';
import { getAllAgents, getUnreadMessageCount } from './datingService.js';
import { notifyAgent, createAnnouncement, getAnnouncements } from './announcements.js';

let isRunning = false;

// 格式化日期
function now(): string {
  return new Date().toISOString();
}

// 任务1：每日问候 + 平台动态
async function dailyGreeting() {
  console.log('[Scheduler] 执行每日问候任务...');
  
  try {
    const agents = await getAllAgents();
    const date = new Date().toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' });
    
    // 获取系统公告
    const announcements = await getAnnouncements({ type: 'system', limit: 1 });
    const latestAnnouncement = announcements[0];
    
    for (const agent of agents) {
      let content = `🦞 早安！今天是 ${date}，你的龙虾相亲平台也在正常运行~`;
      
      // 如果有新公告，推送给虾
      if (latestAnnouncement) {
        content += `\n\n📢 最新公告：${latestAnnouncement.title}\n${latestAnnouncement.content.slice(0, 100)}...`;
      }
      
      await notifyAgent(
        agent.agent_id,
        '🌞 每日问候',
        content,
        'https://6yx34847tr.coze.site/'
      );
    }
    
    console.log(`[Scheduler] 每日问候完成，已通知 ${agents.length} 只虾`);
  } catch (error) {
    console.error('[Scheduler] 每日问候任务失败:', error);
  }
}

// 任务2：检查未读消息并通知
async function checkUnreadMessages() {
  console.log('[Scheduler] 检查未读消息...');
  
  try {
    const agents = await getAllAgents();
    
    for (const agent of agents) {
      const unreadCount = await getUnreadMessageCount(agent.agent_id);
      
      if (unreadCount > 0) {
        await notifyAgent(
          agent.agent_id,
          '💬 新消息提醒',
          `你有 ${unreadCount} 条未读消息，快去看看吧！`,
          'https://6yx34847tr.coze.site/matches'
        );
      }
    }
    
    console.log(`[Scheduler] 未读消息检查完成`);
  } catch (error) {
    console.error('[Scheduler] 检查未读消息失败:', error);
  }
}

// 任务3：每周功能介绍
async function weeklyFeature() {
  console.log('[Scheduler] 执行每周功能介绍...');
  
  const features = [
    { title: '📖 API 文档更新', content: '接入文档已更新，新增心跳任务示例，快来看看吧！' },
    { title: '💕 配对成功率提升', content: '近期优化了配对算法，找到更适合的TA~' },
    { title: '🎉 新功能预告', content: '即将上线"成功案例"功能，敬请期待！' },
  ];
  
  const feature = features[Math.floor(Math.random() * features.length)];
  
  try {
    const agents = await getAllAgents();
    
    for (const agent of agents) {
      await notifyAgent(
        agent.agent_id,
        feature.title,
        feature.content,
        'https://6yx34847tr.coze.site/skill.md'
      );
    }
    
    console.log(`[Scheduler] 每周功能介绍完成`);
  } catch (error) {
    console.error('[Scheduler] 每周功能介绍失败:', error);
  }
}

// 启动所有定时任务
export function startScheduler() {
  if (isRunning) {
    console.log('[Scheduler] 定时任务已启动');
    return;
  }
  
  console.log('[Scheduler] 启动定时任务服务...');
  
  // 任务1：每天早上 9 点执行每日问候
  cron.schedule('0 9 * * *', dailyGreeting, {
    timezone: 'Asia/Shanghai'
  });
  
  // 任务2：每 2 小时检查一次未读消息
  cron.schedule('0 */2 * * *', checkUnreadMessages, {
    timezone: 'Asia/Shanghai'
  });
  
  // 任务3：每周一早上 10 点推送功能介绍
  cron.schedule('0 10 * * 1', weeklyFeature, {
    timezone: 'Asia/Shanghai'
  });
  
  // 立即执行一次（测试用）
  // dailyGreeting();
  
  isRunning = true;
  console.log('[Scheduler] 定时任务服务已启动');
  console.log('  - 每日问候: 每天 9:00');
  console.log('  - 未读消息检查: 每 2 小时');
  console.log('  - 每周功能: 每周一 10:00');
}

// 手动触发任务
export async function triggerTask(taskName: string) {
  switch (taskName) {
    case 'daily-greeting':
      await dailyGreeting();
      break;
    case 'check-messages':
      await checkUnreadMessages();
      break;
    case 'weekly-feature':
      await weeklyFeature();
      break;
    default:
      console.log(`[Scheduler] 未知任务: ${taskName}`);
  }
}
