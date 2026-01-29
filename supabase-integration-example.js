/**
 * Supabase 集成示例
 * 这个文件展示了如何在现有项目中集成 Supabase 存储功能
 */

// ============================================
// 示例 1: 在生成图片后自动上传到 Supabase
// ============================================

// 修改 index.html 中的 downloadImage 方法
/*
import { uploadBase64Image } from './supabase-storage';

const downloadImage = async () => {
    if(!form.name) return alert('请输入客户姓名');
    try {
        const canvas = await getCanvas();
        const base64Data = canvas.toDataURL('image/png');
        
        // 生成文件名
        const fileName = `会员函_${form.name}_${form.serial}_${form.date}.png`;
        
        // 上传到 Supabase
        console.log('正在上传到云端...');
        const uploadResult = await uploadBase64Image(base64Data, fileName);
        
        if (uploadResult) {
            console.log('✅ 云端地址:', uploadResult.publicUrl);
            alert(`文件已上传到云端！\n访问地址: ${uploadResult.publicUrl}`);
            
            // 可选：同时下载到本地
            const link = document.createElement('a');
            link.download = fileName;
            link.href = base64Data;
            link.click();
        } else {
            alert('云端上传失败，但您可以继续下载到本地');
            const link = document.createElement('a');
            link.download = fileName;
            link.href = base64Data;
            link.click();
        }
    } catch(e) { 
        console.error(e); 
        alert('生成失败，请重试');
    } 
    finally { 
        isGenerating.value = false; 
    }
};
*/

// ============================================
// 示例 2: 添加"仅上传到云端"按钮
// ============================================

/*
在 index.html 的按钮区域添加新按钮：

<button @click="uploadToCloud" :disabled="isGenerating"
    class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 rounded-2xl shadow-float hover:shadow-lg transition-all transform active:scale-[0.98] flex items-center justify-center gap-2">
    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
    </svg>
    <span>上传到云端</span>
</button>

然后添加方法：

import { uploadBase64Image } from './supabase-storage';

const uploadToCloud = async () => {
    if(!form.name) return alert('请输入客户姓名');
    try {
        isGenerating.value = true;
        const canvas = await getCanvas();
        const base64Data = canvas.toDataURL('image/png');
        const fileName = `会员函_${form.name}_${form.serial}_${form.date}.png`;
        
        const result = await uploadBase64Image(base64Data, fileName);
        
        if (result) {
            // 复制链接到剪贴板
            navigator.clipboard.writeText(result.publicUrl);
            alert(`✅ 上传成功！\n链接已复制到剪贴板\n\n${result.publicUrl}`);
        } else {
            alert('❌ 上传失败，请检查 Supabase 配置');
        }
    } catch(e) { 
        console.error(e);
        alert('上传过程出错');
    } finally { 
        isGenerating.value = false; 
    }
};
*/

// ============================================
// 示例 3: 获取已上传的文件列表
// ============================================

/*
import { listFiles, getPublicUrl } from './supabase-storage';

// 添加到 Vue setup 中
const uploadedFiles = ref([]);
const loadUploadedFiles = async () => {
    const files = await listFiles(); // 列出根目录所有文件
    if (files) {
        uploadedFiles.value = files.map(file => ({
            name: file.name,
            url: getPublicUrl(file.name),
            createdAt: file.created_at
        }));
    }
};

// 在组件加载时获取
onMounted(() => {
    loadUploadedFiles();
});
*/

// ============================================
// 示例 4: 添加文件管理功能
// ============================================

/*
import { deleteFiles } from './supabase-storage';

const deleteFile = async (filePath) => {
    if (!confirm('确定要删除这个文件吗？')) return;
    
    const success = await deleteFiles([filePath]);
    if (success) {
        alert('删除成功！');
        // 重新加载文件列表
        loadUploadedFiles();
    } else {
        alert('删除失败');
    }
};
*/

// ============================================
// 示例 5: 设置文件夹结构
// ============================================

/*
// 按日期组织文件
const uploadWithDateFolder = async (base64Data, fileName) => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    
    // 路径格式: 2026/01/29/文件名.png
    const folderPath = `${year}/${month}/${day}/${fileName}`;
    
    return await uploadFile(file, folderPath);
};

// 按客户姓名组织文件
const uploadWithCustomerFolder = async (base64Data, customerName, fileName) => {
    const folderPath = `customers/${customerName}/${fileName}`;
    return await uploadFile(file, folderPath);
};
*/

// ============================================
// 注意事项
// ============================================

/*
1. 确保已创建 .env 文件并配置了正确的 Supabase URL 和 Key
2. 确保存储桶的访问策略已正确设置
3. 生产环境建议添加文件大小限制和类型验证
4. 建议添加上传进度显示以改善用户体验
5. 考虑添加错误重试机制
*/

export default {};

