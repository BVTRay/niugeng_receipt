/**
 * 主应用入口
 * 导出 Supabase 功能供 index.html 使用
 */

import { uploadPDFToSupabase } from './supabase-pdf-uploader';
import { uploadFile } from './supabase-storage';
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
} from './supabase-database';

// 将函数挂载到 window 对象，供 Vue 应用使用
(window as any).uploadPDFToSupabase = uploadPDFToSupabase;
(window as any).uploadFileToSupabase = uploadFile;
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

console.log('✅ Supabase 功能已加载（PDF上传、配置同步、流水编号、确认函记录）');

