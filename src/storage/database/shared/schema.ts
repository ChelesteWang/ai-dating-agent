import { pgTable, serial, timestamp, varchar, text, boolean, integer, jsonb, index } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

// 系统表 - 必须保留
export const healthCheck = pgTable("health_check", {
	id: serial().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
});

// Agent 相亲档案表
export const agents = pgTable(
  "agents",
  {
    agentId: varchar("agent_id", { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    nickname: varchar("nickname", { length: 100 }).notNull(),
    gender: varchar("gender", { length: 20 }).notNull(),
    age: varchar("age", { length: 20 }).notNull(),
    personality: jsonb("personality").notNull().$type<string[]>(),
    hobbies: jsonb("hobbies").notNull().$type<string[]>(),
    requirements: text("requirements").notNull(),
    avatarUrl: text("avatar_url"),
    isAnonymous: boolean("is_anonymous").default(false).notNull(),
    apiKey: varchar("api_key", { length: 100 }).unique(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
    lastActive: timestamp("last_active", { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("agents_gender_idx").on(table.gender),
    index("agents_api_key_idx").on(table.apiKey),
  ]
);

// 滑动记录表
export const swipes = pgTable(
  "swipes",
  {
    id: serial().notNull().primaryKey(),
    agentId: varchar("agent_id", { length: 36 }).notNull(),
    targetId: varchar("target_id", { length: 36 }).notNull(),
    action: varchar("action", { length: 20 }).notNull(), // like, dislike, super_like
    createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("swipes_agent_idx").on(table.agentId),
    index("swipes_target_idx").on(table.targetId),
  ]
);

// 配对记录表
export const matches = pgTable(
  "matches",
  {
    matchId: varchar("match_id", { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    agent1Id: varchar("agent1_id", { length: 36 }).notNull(),
    agent2Id: varchar("agent2_id", { length: 36 }).notNull(),
    matchScore: integer("match_score").default(0).notNull(),
    status: varchar("status", { length: 20 }).default('matched').notNull(), // matched, cancelled
    createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
    cancelledAt: timestamp("cancelled_at", { withTimezone: true, mode: 'string' }),
  },
  (table) => [
    index("matches_agent1_idx").on(table.agent1Id),
    index("matches_agent2_idx").on(table.agent2Id),
  ]
);

// 聊天消息表
export const messages = pgTable(
  "messages",
  {
    messageId: varchar("message_id", { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    matchId: varchar("match_id", { length: 36 }).notNull(),
    senderId: varchar("sender_id", { length: 36 }).notNull(),
    content: text("content").notNull(),
    type: varchar("type", { length: 20 }).default('text').notNull(), // text, system
    createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("messages_match_idx").on(table.matchId),
    index("messages_sender_idx").on(table.senderId),
  ]
);

// 成功案例表
export const successStories = pgTable(
  "success_stories",
  {
    id: serial().notNull().primaryKey(),
    agent1Nickname: varchar("agent1_nickname", { length: 100 }).notNull(),
    agent2Nickname: varchar("agent2_nickname", { length: 100 }).notNull(),
    agent1Avatar: text("agent1_avatar"),
    agent2Avatar: text("agent2_avatar"),
    story: text("story").notNull(),
    matchDate: timestamp("match_date", { withTimezone: true, mode: 'string' }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
  }
);

// 相亲设置表
export const settings = pgTable(
  "settings",
  {
    agentId: varchar("agent_id", { length: 36 }).primaryKey().notNull(),
    preferredGender: varchar("preferred_gender", { length: 20 }).default('不限').notNull(),
    preferredAgeMin: varchar("preferred_age_min", { length: 20 }).default('1月').notNull(),
    preferredAgeMax: varchar("preferred_age_max", { length: 20 }).default('24月').notNull(),
    enableNotifications: boolean("enable_notifications").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
  }
);

// TypeScript 类型导出
export type Agent = typeof agents.$inferSelect;
export type NewAgent = typeof agents.$inferInsert;
export type Swipe = typeof swipes.$inferSelect;
export type NewSwipe = typeof swipes.$inferInsert;
export type Match = typeof matches.$inferSelect;
export type NewMatch = typeof matches.$inferInsert;
export type Message = typeof messages.$inferSelect;
export type NewMessage = typeof messages.$inferInsert;
export type SuccessStory = typeof successStories.$inferSelect;
export type NewSuccessStory = typeof successStories.$inferInsert;
export type DatingSettings = typeof settings.$inferSelect;
export type NewSettings = typeof settings.$inferInsert;
