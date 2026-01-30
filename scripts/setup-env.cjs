#!/usr/bin/env node

/**
 * 环境变量配置脚本
 * 运行此脚本可以交互式地创建 .env 文件
 * 
 * 使用方法: node setup-env.js
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const envPath = path.join(__dirname, '.env');

console.log('\n🚀 Supabase 配置向导\n');
console.log('请输入你的 Supabase 配置信息：\n');

const questions = [
  {
    key: 'VITE_SUPABASE_URL',
    prompt: 'Supabase URL (例如: https://xxxxx.supabase.co): '
  },
  {
    key: 'VITE_SUPABASE_ANON_KEY',
    prompt: 'Supabase Anon Key: '
  },
  {
    key: 'GEMINI_API_KEY',
    prompt: 'Gemini API Key (可选，直接回车跳过): ',
    optional: true
  }
];

const answers = {};
let currentQuestion = 0;

function askQuestion() {
  if (currentQuestion >= questions.length) {
    createEnvFile();
    return;
  }

  const question = questions[currentQuestion];
  rl.question(question.prompt, (answer) => {
    if (answer.trim() || question.optional) {
      answers[question.key] = answer.trim();
    } else {
      console.log('❌ 此项为必填项，请重新输入');
      askQuestion();
      return;
    }
    currentQuestion++;
    askQuestion();
  });
}

function createEnvFile() {
  let envContent = '# Supabase 配置 - 自动生成\n';
  envContent += `# 生成时间: ${new Date().toLocaleString('zh-CN')}\n\n`;

  for (const [key, value] of Object.entries(answers)) {
    if (value) {
      envContent += `${key}=${value}\n`;
    } else {
      envContent += `# ${key}=\n`;
    }
  }

  // 检查文件是否已存在
  if (fs.existsSync(envPath)) {
    rl.question('\n⚠️  .env 文件已存在，是否覆盖？(y/N): ', (answer) => {
      if (answer.toLowerCase() === 'y') {
        writeFile(envContent);
      } else {
        console.log('\n✅ 已取消，保留原有配置');
        rl.close();
      }
    });
  } else {
    writeFile(envContent);
  }
}

function writeFile(content) {
  try {
    fs.writeFileSync(envPath, content, 'utf8');
    console.log('\n✅ .env 文件创建成功！');
    console.log(`📁 文件位置: ${envPath}`);
    console.log('\n📝 配置内容:');
    console.log('─────────────────────────────');
    console.log(content);
    console.log('─────────────────────────────');
    console.log('\n💡 提示:');
    console.log('1. 请确保不要将 .env 文件提交到 Git');
    console.log('2. 重启开发服务器以加载新配置');
    console.log('3. 查看 SUPABASE_CONFIG.md 了解更多信息\n');
  } catch (error) {
    console.error('\n❌ 创建文件失败:', error.message);
  } finally {
    rl.close();
  }
}

// 开始询问
askQuestion();

// 处理 Ctrl+C
rl.on('SIGINT', () => {
  console.log('\n\n👋 已取消配置');
  process.exit(0);
});

