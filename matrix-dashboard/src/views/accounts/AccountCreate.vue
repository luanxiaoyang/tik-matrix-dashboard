<template>
  <div class="account-create">
    <div class="page-header">
      <h1>创建账号</h1>
      <el-button :icon="ArrowLeft" @click="$router.back()">返回</el-button>
    </div>
    
    <el-card>
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="120px"
        class="create-form"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="手机编号" prop="phoneNo">
              <el-input
                v-model="form.phoneNo"
                placeholder="请输入手机编号（如：us-1、美国1、云845）"
                maxlength="50"
                show-word-limit
              >
                <template #prefix>
                  <el-icon><Phone /></el-icon>
                </template>
              </el-input>
              <div class="form-tip">
                用于标识账号的唯一手机编号，支持字母、数字、中文等格式
              </div>
            </el-form-item>
          </el-col>
          
          <el-col :span="12">
            <el-form-item label="账号链接" prop="accountLink">
              <el-input
                v-model="form.accountLink"
                placeholder="请输入Telegram账号链接"
                maxlength="200"
                show-word-limit
              >
                <template #prefix>
                  <el-icon><Link /></el-icon>
                </template>
              </el-input>
              <div class="form-tip">
                格式：https://t.me/username
              </div>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="归属用户" prop="ownerId">
              <el-select
                v-model="form.ownerId"
                placeholder="选择归属用户"
                style="width: 100%"
                filterable
              >
                <el-option
                  v-for="user in ownerOptions"
                  :key="user.value"
                  :label="user.label"
                  :value="user.value"
                />
              </el-select>
              <div class="form-tip">
                账号的归属用户，用于权限控制
              </div>
            </el-form-item>
          </el-col>
          
          <el-col :span="12">
            <el-form-item label="账号状态" prop="status">
              <el-radio-group v-model="form.status">
                <el-radio label="active">正常</el-radio>
                <el-radio label="inactive">未激活</el-radio>
              </el-radio-group>
              <div class="form-tip">
                新创建的账号默认为正常状态
              </div>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-form-item label="备注" prop="remark">
          <el-input
            v-model="form.remark"
            type="textarea"
            :rows="3"
            placeholder="请输入备注信息（可选）"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>
        
        <!-- 批量创建选项 -->
        <el-divider content-position="left">批量创建</el-divider>
        
        <el-form-item>
          <el-checkbox v-model="batchMode" @change="handleBatchModeChange">
            启用批量创建模式
          </el-checkbox>
          <div class="form-tip">
            启用后可以通过上传文件或输入多行数据批量创建账号
          </div>
        </el-form-item>
        
        <template v-if="batchMode">
          <el-form-item label="批量数据">
            <el-tabs v-model="batchTab" class="batch-tabs">
              <el-tab-pane label="文本输入" name="text">
                <el-input
                  v-model="batchData.text"
                  type="textarea"
                  :rows="8"
                  placeholder="每行一个账号，格式：手机编号,账号链接,归属用户ID\n例如：\nus-1,https://t.me/user1,u_1001\n美国2,https://t.me/user2,u_1002"
                />
              </el-tab-pane>
              
              <el-tab-pane label="文件上传" name="file">
                <el-upload
                  ref="uploadRef"
                  :auto-upload="false"
                  :show-file-list="true"
                  :limit="1"
                  accept=".csv,.txt"
                  @change="handleFileChange"
                >
                  <el-button :icon="Upload">选择文件</el-button>
                  <template #tip>
                    <div class="upload-tip">
                      支持CSV或TXT文件，格式：手机号,账号链接,归属用户ID
                    </div>
                  </template>
                </el-upload>
              </el-tab-pane>
            </el-tabs>
          </el-form-item>
          
          <el-form-item>
            <el-button type="info" :icon="View" @click="previewBatchData">
              预览数据
            </el-button>
            <span class="batch-count" v-if="batchPreview.length > 0">
              共 {{ batchPreview.length }} 条数据
            </span>
          </el-form-item>
        </template>
        
        <el-form-item>
          <el-button
            type="primary"
            :loading="loading"
            :icon="batchMode ? Upload : Plus"
            @click="handleSubmit"
          >
            {{ batchMode ? '批量创建' : '创建账号' }}
          </el-button>
          <el-button @click="handleReset">重置</el-button>
          <el-button @click="$router.back()">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    
    <!-- 批量预览对话框 -->
    <el-dialog
      v-model="previewDialog.visible"
      title="批量数据预览"
      width="80%"
      :close-on-click-modal="false"
    >
      <el-table :data="batchPreview" max-height="400">
        <el-table-column type="index" label="序号" width="60" />
        <el-table-column prop="phoneNo" label="手机编号" width="150" />
        <el-table-column prop="accountLink" label="账号链接" min-width="200" />
        <el-table-column prop="ownerId" label="归属用户" width="120">
          <template #default="{ row }">
            <span>{{ getUserName(row.ownerId) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="error" label="错误信息" min-width="200">
          <template #default="{ row }">
            <el-text v-if="row.error" type="danger">{{ row.error }}</el-text>
            <el-text v-else type="success">数据正常</el-text>
          </template>
        </el-table-column>
      </el-table>
      
      <template #footer>
        <el-button @click="previewDialog.visible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, type FormInstance, type FormRules, type UploadFile } from 'element-plus'
import {
  ArrowLeft,
  Phone,
  Link,
  Plus,
  Upload,
  View
} from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { createAccount } from '@/api/accounts'
import type { CreateAccountParams } from '@/types/business'

const router = useRouter()
const userStore = useUserStore()

const formRef = ref<FormInstance>()
const uploadRef = ref()
const loading = ref(false)

// 表单数据
const form = reactive<CreateAccountParams>({
  phoneNo: '',
  accountLink: '',
  ownerId: '',
  status: 'active',
  remark: ''
})

// 批量创建相关
const batchMode = ref(false)
const batchTab = ref('text')
const batchData = reactive({
  text: '',
  file: null as File | null
})
const batchPreview = ref<any[]>([])

// 预览对话框
const previewDialog = reactive({
  visible: false
})

// 用户选项
const ownerOptions = ref([
  { label: 'Admin', value: 'u_1001' },
  { label: 'Manager', value: 'u_1002' },
  { label: 'Operator1', value: 'u_1003' },
  { label: 'Operator2', value: 'u_1004' }
])

// 表单验证规则
const rules: FormRules = {
  phoneNo: [
    { required: true, message: '请输入手机编号', trigger: 'blur' },
    { min: 1, max: 50, message: '手机编号长度为1-50个字符', trigger: 'blur' }
  ],
  accountLink: [
    { required: true, message: '请输入账号链接', trigger: 'blur' },
    { pattern: /^https:\/\/t\.me\/[a-zA-Z0-9_]+$/, message: '账号链接格式不正确', trigger: 'blur' }
  ],
  ownerId: [
    { required: true, message: '请选择归属用户', trigger: 'change' }
  ],
  status: [
    { required: true, message: '请选择账号状态', trigger: 'change' }
  ]
}

/**
 * 获取用户名
 */
const getUserName = (userId: string) => {
  const user = ownerOptions.value.find(u => u.value === userId)
  return user?.label || userId
}

/**
 * 处理批量模式变化
 */
const handleBatchModeChange = (enabled: boolean) => {
  if (!enabled) {
    batchData.text = ''
    batchData.file = null
    batchPreview.value = []
  }
}

/**
 * 处理文件变化
 */
const handleFileChange = (file: UploadFile) => {
  if (file.raw) {
    batchData.file = file.raw
    readFileContent(file.raw)
  }
}

/**
 * 读取文件内容
 */
const readFileContent = (file: File) => {
  const reader = new FileReader()
  reader.onload = (e) => {
    batchData.text = e.target?.result as string
  }
  reader.readAsText(file)
}

/**
 * 预览批量数据
 */
const previewBatchData = () => {
  if (!batchData.text.trim()) {
    ElMessage.warning('请输入批量数据')
    return
  }
  
  const lines = batchData.text.trim().split('\n')
  const preview: any[] = []
  
  lines.forEach((line, index) => {
    const parts = line.split(',')
    if (parts.length >= 2) {
      const item = {
        phoneNo: parts[0]?.trim() || '',
        accountLink: parts[1]?.trim() || '',
        ownerId: parts[2]?.trim() || form.ownerId,
        error: ''
      }
      
      // 验证数据
      if (!item.phoneNo) {
        item.error = '手机编号不能为空'
      } else if (item.phoneNo.length > 50) {
        item.error = '手机编号长度不能超过50个字符'
      } else if (!item.accountLink) {
        item.error = '账号链接不能为空'
      } else if (!/^https:\/\/t\.me\/[a-zA-Z0-9_]+$/.test(item.accountLink)) {
        item.error = '账号链接格式不正确'
      } else if (!item.ownerId) {
        item.error = '归属用户不能为空'
      }
      
      preview.push(item)
    } else if (line.trim()) {
      preview.push({
        phoneNo: line.trim(),
        accountLink: '',
        ownerId: '',
        error: '数据格式不正确，应为：手机编号,账号链接,归属用户ID'
      })
    }
  })
  
  batchPreview.value = preview
  previewDialog.visible = true
}

/**
 * 处理提交
 */
const handleSubmit = async () => {
  if (batchMode.value) {
    await handleBatchSubmit()
  } else {
    await handleSingleSubmit()
  }
}

/**
 * 处理单个创建
 */
const handleSingleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    const valid = await formRef.value.validate()
    if (!valid) return
    
    loading.value = true
    
    await createAccount(form)
    
    ElMessage.success('账号创建成功')
    router.push('/accounts/list')
    
  } catch (error: any) {
    ElMessage.error(error.message || '创建账号失败')
  } finally {
    loading.value = false
  }
}

/**
 * 处理批量创建
 */
const handleBatchSubmit = async () => {
  if (!batchData.text.trim()) {
    ElMessage.warning('请输入批量数据')
    return
  }
  
  // 先预览数据以验证格式
  previewBatchData()
  
  const validItems = batchPreview.value.filter(item => !item.error)
  if (validItems.length === 0) {
    ElMessage.error('没有有效的数据可以创建')
    return
  }
  
  if (validItems.length !== batchPreview.value.length) {
    const invalidCount = batchPreview.value.length - validItems.length
    const confirmed = await ElMessage.confirm(
      `检测到 ${invalidCount} 条无效数据，是否继续创建 ${validItems.length} 条有效数据？`,
      '确认批量创建',
      {
        confirmButtonText: '继续创建',
        cancelButtonText: '取消',
        type: 'warning'
      }
    ).catch(() => false)
    
    if (!confirmed) return
  }
  
  try {
    loading.value = true
    
    let successCount = 0
    let failCount = 0
    
    for (const item of validItems) {
      try {
        await createAccount({
          phoneNo: item.phoneNo,
          accountLink: item.accountLink,
          ownerId: item.ownerId,
          status: form.status,
          remark: form.remark
        })
        successCount++
      } catch (error) {
        failCount++
        console.error('创建账号失败:', item, error)
      }
    }
    
    ElMessage.success(`批量创建完成：成功 ${successCount} 条，失败 ${failCount} 条`)
    
    if (successCount > 0) {
      router.push('/accounts/list')
    }
    
  } catch (error: any) {
    ElMessage.error(error.message || '批量创建失败')
  } finally {
    loading.value = false
  }
}

/**
 * 处理重置
 */
const handleReset = () => {
  formRef.value?.resetFields()
  Object.assign(form, {
    phoneNo: '',
    accountLink: '',
    ownerId: '',
    status: 'active',
    remark: ''
  })
  
  if (batchMode.value) {
    batchData.text = ''
    batchData.file = null
    batchPreview.value = []
    uploadRef.value?.clearFiles()
  }
}
</script>

<style scoped>
.account-create {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-header h1 {
  font-size: 24px;
  color: #333;
  margin: 0;
}

.create-form {
  max-width: 800px;
}

.form-tip {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}

.batch-tabs {
  width: 100%;
}

.upload-tip {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}

.batch-count {
  margin-left: 12px;
  font-size: 14px;
  color: #666;
}

@media (max-width: 768px) {
  .account-create {
    padding: 16px;
  }
  
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  
  .create-form {
    max-width: 100%;
  }
}
</style>