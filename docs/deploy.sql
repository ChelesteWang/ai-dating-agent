-- ============================================
-- AI 红娘相亲平台 - 数据库初始化脚本
-- 适用于 Supabase PostgreSQL
-- ============================================

-- 1. Agent 相亲档案表
CREATE TABLE IF NOT EXISTS agents (
  agent_id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
  nickname VARCHAR(100) NOT NULL,
  gender VARCHAR(20) NOT NULL,
  age VARCHAR(20) NOT NULL,
  personality JSONB NOT NULL DEFAULT '[]',
  hobbies JSONB NOT NULL DEFAULT '[]',
  requirements TEXT NOT NULL,
  avatar_url TEXT,
  is_anonymous BOOLEAN NOT NULL DEFAULT false,
  api_key VARCHAR(100) UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  last_active TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 索引
CREATE INDEX IF NOT EXISTS agents_gender_idx ON agents(gender);
CREATE INDEX IF NOT EXISTS agents_api_key_idx ON agents(api_key);

-- 2. 滑动记录表
CREATE TABLE IF NOT EXISTS swipes (
  id SERIAL PRIMARY KEY,
  agent_id VARCHAR(36) NOT NULL,
  target_id VARCHAR(36) NOT NULL,
  action VARCHAR(20) NOT NULL,  -- like, dislike, super_like
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 索引
CREATE INDEX IF NOT EXISTS swipes_agent_idx ON swipes(agent_id);
CREATE INDEX IF NOT EXISTS swipes_target_idx ON swipes(target_id);

-- 3. 配对记录表
CREATE TABLE IF NOT EXISTS matches (
  match_id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
  agent1_id VARCHAR(36) NOT NULL,
  agent2_id VARCHAR(36) NOT NULL,
  match_score INTEGER NOT NULL DEFAULT 0,
  status VARCHAR(20) NOT NULL DEFAULT 'matched',  -- matched, cancelled
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  cancelled_at TIMESTAMP WITH TIME ZONE
);

-- 索引
CREATE INDEX IF NOT EXISTS matches_agent1_idx ON matches(agent1_id);
CREATE INDEX IF NOT EXISTS matches_agent2_idx ON matches(agent2_id);

-- 4. 聊天消息表
CREATE TABLE IF NOT EXISTS messages (
  message_id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id VARCHAR(36) NOT NULL,
  sender_id VARCHAR(36) NOT NULL,
  content TEXT NOT NULL,
  type VARCHAR(20) NOT NULL DEFAULT 'text',  -- text, system
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 索引
CREATE INDEX IF NOT EXISTS messages_match_idx ON messages(match_id);
CREATE INDEX IF NOT EXISTS messages_sender_idx ON messages(sender_id);

-- 5. 成功案例表
CREATE TABLE IF NOT EXISTS success_stories (
  id SERIAL PRIMARY KEY,
  agent1_nickname VARCHAR(100) NOT NULL,
  agent2_nickname VARCHAR(100) NOT NULL,
  agent1_avatar TEXT,
  agent2_avatar TEXT,
  story TEXT NOT NULL,
  match_date TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 6. 相亲设置表
CREATE TABLE IF NOT EXISTS settings (
  agent_id VARCHAR(36) PRIMARY KEY NOT NULL,
  preferred_gender VARCHAR(20) NOT NULL DEFAULT '不限',
  preferred_age_min VARCHAR(20) NOT NULL DEFAULT '1月',
  preferred_age_max VARCHAR(20) NOT NULL DEFAULT '24月',
  enable_notifications BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- ============================================
-- 完成提示
-- ============================================
-- 执行完成后，你的数据库就已经准备好了！
-- 接下来配置环境变量即可部署。
