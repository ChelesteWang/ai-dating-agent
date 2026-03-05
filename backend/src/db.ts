/**
 * 数据库客户端
 * 使用 Supabase 进行数据库操作
 * 如果环境变量未配置，则使用内存存储
 */
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import 'dotenv/config';

let supabaseClient: SupabaseClient | null = null;
let useMemoryStorage = false;

function getSupabaseClient(): SupabaseClient | null {
  if (useMemoryStorage) {
    return null;
  }

  if (supabaseClient) {
    return supabaseClient;
  }

  const url = process.env.COZE_SUPABASE_URL;
  const anonKey = process.env.COZE_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    console.log('⚠️ Supabase 环境变量未配置，使用内存存储模式');
    useMemoryStorage = true;
    return null;
  }

  supabaseClient = createClient(url, anonKey, {
    db: {
      timeout: 60000,
    },
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return supabaseClient;
}

// 惰性初始化
export const db = new Proxy({} as SupabaseClient, {
  get(target, prop) {
    const client = getSupabaseClient();
    if (client) {
      return client[prop as keyof SupabaseClient];
    }
    // 如果没有数据库连接，返回空实现
    return () => { throw new Error('数据库未配置'); };
  }
});

export function isUsingDatabase(): boolean {
  return !useMemoryStorage && getSupabaseClient() !== null;
}

export type { SupabaseClient };
