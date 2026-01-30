/**
 * Supabase 用户认证
 * 用于简单的账号密码登录
 */

import { supabase } from './supabase-client';

// ==================== 类型定义 ====================

export interface User {
  id: number;
  username: string;
  role: 'admin' | 'user';
  display_name?: string;
  is_active: boolean;
  last_login_at?: string;
  created_at?: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

// ==================== 认证状态管理 ====================

// 当前登录用户（存储在内存中）
let currentUser: User | null = null;

// 从 localStorage 恢复登录状态
function loadUserFromStorage(): User | null {
  try {
    const stored = localStorage.getItem('current_user');
    if (stored) {
      const user = JSON.parse(stored);
      currentUser = user;
      return user;
    }
  } catch (error) {
    console.error('加载用户信息失败:', error);
  }
  return null;
}

// 保存用户信息到 localStorage
function saveUserToStorage(user: User | null): void {
  try {
    if (user) {
      localStorage.setItem('current_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('current_user');
    }
  } catch (error) {
    console.error('保存用户信息失败:', error);
  }
}

// ==================== 密码验证 ====================

/**
 * 验证密码（使用简单的 SHA-256 哈希，生产环境建议使用 bcrypt）
 * 注意：这是一个简化实现，生产环境应该使用更安全的方法
 */
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

/**
 * 验证密码是否匹配
 */
async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const passwordHash = await hashPassword(password);
  return passwordHash === hash;
}

// ==================== 认证功能 ====================

/**
 * 用户登录
 */
export async function login(credentials: LoginCredentials): Promise<{ success: boolean; user?: User; error?: string }> {
  try {
    console.log('🔐 正在验证用户身份...');

    // 查询用户
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', credentials.username)
      .eq('is_active', true)
      .single();

    if (error || !data) {
      console.error('❌ 用户不存在或已被禁用');
      return { success: false, error: '用户名或密码错误' };
    }

    // 验证密码（使用 SHA-256 哈希）
    const passwordMatch = await verifyPassword(credentials.password, data.password_hash);

    if (!passwordMatch) {
      console.error('❌ 密码错误');
      return { success: false, error: '用户名或密码错误' };
    }

    // 更新最后登录时间
    await supabase
      .from('users')
      .update({ last_login_at: new Date().toISOString() })
      .eq('id', data.id);

    // 设置当前用户
    const user: User = {
      id: data.id,
      username: data.username,
      role: data.role,
      display_name: data.display_name,
      is_active: data.is_active,
      last_login_at: new Date().toISOString(),
      created_at: data.created_at
    };

    currentUser = user;
    saveUserToStorage(user);

    console.log('✅ 登录成功:', user.username);
    return { success: true, user };
  } catch (error) {
    console.error('❌ 登录过程出错:', error);
    return { success: false, error: '登录失败，请稍后重试' };
  }
}

/**
 * 用户登出
 */
export function logout(): void {
  currentUser = null;
  saveUserToStorage(null);
  console.log('👋 用户已登出');
}

/**
 * 获取当前登录用户
 */
export function getCurrentUser(): User | null {
  if (!currentUser) {
    currentUser = loadUserFromStorage();
  }
  return currentUser;
}

/**
 * 检查用户是否已登录
 */
export function isAuthenticated(): boolean {
  return getCurrentUser() !== null;
}

/**
 * 检查用户是否为管理员
 */
export function isAdmin(): boolean {
  const user = getCurrentUser();
  return user?.role === 'admin';
}

/**
 * 检查用户是否有权限访问设置
 */
export function canAccessSettings(): boolean {
  return isAdmin();
}

// ==================== 初始化 ====================

// 应用启动时尝试恢复登录状态
if (typeof window !== 'undefined') {
  loadUserFromStorage();
}

