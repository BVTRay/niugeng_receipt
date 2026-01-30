/**
 * 主应用入口
 * 导出 Supabase 功能供 index.html 使用
 */

import { uploadPDFToSupabase } from './lib/supabase-pdf-uploader';
import { uploadFile, uploadBase64Image } from './lib/supabase-storage';
import { 
  saveConfigToCloud, 
  loadConfigFromCloud, 
  generateNewSerial,
  checkSerialExists,
  saveReceiptRecord,
  getReceiptBySerial,
  getRecentReceipts,
  searchReceipts,
  updateReceiptStatus,
  getReceiptStatistics
} from './lib/supabase-database';
import {
  login,
  logout,
  getCurrentUser,
  isAuthenticated,
  isAdmin,
  canAccessSettings
} from './lib/supabase-auth';

// 将函数挂载到 window 对象，供 Vue 应用使用
(window as any).uploadPDFToSupabase = uploadPDFToSupabase;
(window as any).uploadFileToSupabase = uploadFile;
(window as any).uploadBase64Image = uploadBase64Image;
(window as any).saveConfigToCloud = saveConfigToCloud;
(window as any).loadConfigFromCloud = loadConfigFromCloud;
(window as any).generateNewSerial = generateNewSerial;
(window as any).checkSerialExists = checkSerialExists;
(window as any).saveReceiptRecord = saveReceiptRecord;
(window as any).getReceiptBySerial = getReceiptBySerial;
(window as any).getRecentReceipts = getRecentReceipts;
(window as any).searchReceipts = searchReceipts;
(window as any).updateReceiptStatus = updateReceiptStatus;
(window as any).getReceiptStatistics = getReceiptStatistics;

// 认证相关函数
(window as any).login = login;
(window as any).logout = logout;
(window as any).getCurrentUser = getCurrentUser;
(window as any).isAuthenticated = isAuthenticated;
(window as any).isAdmin = isAdmin;
(window as any).canAccessSettings = canAccessSettings;

console.log('✅ Supabase 功能已加载（PDF上传、配置同步、流水编号、确认函记录、用户认证）');

