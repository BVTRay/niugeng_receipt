/**
 * 生成密码哈希工具
 * 用于创建用户账号时生成密码哈希
 * 使用 SHA-256 算法（与浏览器端保持一致）
 */

import * as crypto from 'crypto';

/**
 * 使用 SHA-256 生成密码哈希
 * 注意：这是简化实现，生产环境建议使用 bcrypt
 * 但为了与浏览器端保持一致，这里使用 SHA-256
 */
function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// 从命令行参数获取密码
const password = process.argv[2];

if (!password) {
  console.log('使用方法: tsx scripts/generate-password-hash.ts <密码>');
  console.log('示例: tsx scripts/generate-password-hash.ts admin123');
  process.exit(1);
}

const hash = hashPassword(password);
console.log('密码:', password);
console.log('哈希值:', hash);
console.log('\nSQL 插入语句:');
console.log(`INSERT INTO users (username, password_hash, role, display_name) VALUES ('username', '${hash}', 'user', '显示名称');`);

