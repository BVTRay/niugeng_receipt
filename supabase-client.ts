import { createClient, SupabaseClient } from '@supabase/supabase-js';

// 获取环境变量（兼容浏览器和 Node.js 环境）
function getEnvVar(key: string): string | undefined {
  // 在浏览器环境（Vite）中使用 import.meta.env
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env[key];
  }
  // 在 Node.js 环境中使用 process.env
  if (typeof process !== 'undefined' && process.env) {
    return process.env[key];
  }
  return undefined;
}

// Supabase 配置
const supabaseUrl = getEnvVar('VITE_SUPABASE_URL');
const supabaseAnonKey = getEnvVar('VITE_SUPABASE_ANON_KEY');

// 检查环境变量
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase 配置缺失！请在 .env 文件中配置 VITE_SUPABASE_URL 和 VITE_SUPABASE_ANON_KEY');
}

// 创建 Supabase 客户端实例
// 使用占位符 URL 和 Key 来避免初始化错误（当环境变量缺失时）
export const supabase: SupabaseClient = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key'
);

// 导出类型，方便在其他文件中使用
export type { SupabaseClient };

