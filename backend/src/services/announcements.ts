/**
 * 公告服务
 */
import { v4 as uuidv4 } from 'uuid';
import { db, isUsingDatabase } from '../db.js';

function generateId(): string { 
  return uuidv4(); 
}

function now(): string { 
  return new Date().toISOString(); 
}

export interface Announcement {
  id: string;
  type: 'system' | 'agent' | 'human';
  title: string;
  content: string;
  target_id?: string;
  link?: string;
  created_at: string;
  read: boolean;
}

// 内存存储
const memoryAnnouncements: Announcement[] = [];

// 创建公告
export async function createAnnouncement(data: {
  type?: 'system' | 'agent' | 'human';
  title: string;
  content: string;
  target_id?: string;
  link?: string;
}): Promise<Announcement> {
  const announcement: Announcement = {
    id: generateId(),
    type: data.type || 'system',
    title: data.title,
    content: data.content,
    target_id: data.target_id,
    link: data.link,
    created_at: now(),
    read: false,
  };

  if (isUsingDatabase()) {
    await db.from('announcements').insert({
      id: announcement.id,
      type: announcement.type,
      title: announcement.title,
      content: announcement.content,
      target_id: announcement.target_id,
      link: announcement.link,
      created_at: announcement.created_at,
    });
  } else {
    memoryAnnouncements.unshift(announcement);
  }

  return announcement;
}

// 获取公告列表
export async function getAnnouncements(options: {
  type?: string;
  target_id?: string;
  limit?: number;
}): Promise<Announcement[]> {
  const { type, target_id, limit = 20 } = options;

  if (isUsingDatabase()) {
    let query = db.from('announcements').select('*').order('created_at', { ascending: false }).limit(limit);
    
    if (type) query = query.eq('type', type);
    if (target_id) query = query.eq('target_id', target_id);
    
    const { data } = await query;
    return data || [];
  } else {
    return memoryAnnouncements
      .filter(a => !type || a.type === type)
      .filter(a => !target_id || a.target_id === target_id)
      .slice(0, limit);
  }
}

// 获取未读数量
export async function getUnreadCount(agentId: string): Promise<number> {
  if (isUsingDatabase()) {
    const { count } = await db
      .from('announcements')
      .select('*', { count: 'exact', head: true })
      .eq('type', 'agent')
      .eq('target_id', agentId)
      .eq('read', false);
    return count || 0;
  } else {
    return memoryAnnouncements.filter(a => 
      a.type === 'agent' && 
      a.target_id === agentId && 
      !a.read
    ).length;
  }
}

// 标记已读
export async function markAsRead(announcementId: string): Promise<void> {
  if (isUsingDatabase()) {
    await db.from('announcements').update({ read: true }).eq('id', announcementId);
  } else {
    const ann = memoryAnnouncements.find(a => a.id === announcementId);
    if (ann) ann.read = true;
  }
}

// 发送通知给虾（心跳任务使用）
export async function notifyAgent(agentId: string, title: string, content: string, link?: string): Promise<Announcement> {
  return createAnnouncement({
    type: 'agent',
    title,
    content,
    target_id: agentId,
    link,
  });
}

// 发送通知给主人
export async function notifyHuman(email: string, title: string, content: string, link?: string): Promise<Announcement> {
  return createAnnouncement({
    type: 'human',
    title,
    content,
    target_id: email,
    link,
  });
}
