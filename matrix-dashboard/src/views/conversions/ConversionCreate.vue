<template>
  <div class="page-container">
    <div class="page-header">
      <div class="header-left">
        <el-button 
          type="primary" 
          :icon="ArrowLeft" 
          @click="$router.go(-1)"
        >
          返回
        </el-button>
        <h2>提交用户</h2>
      </div>
    </div>

    <div class="page-content">
      <el-card class="form-card">
        <el-tabs v-model="activeTab" type="border-card">
          <!-- 单个提交 -->
          <el-tab-pane label="单个提交" name="single">
            <el-form
              ref="singleFormRef"
              :model="singleForm"
              :rules="singleFormRules"
              label-width="120px"
              size="default"
            >
              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="用户ID" prop="registerUserId">
                    <el-input-number
                      v-model="singleForm.registerUserId"
                      placeholder="请输入7位数用户ID"
                      :min="1000000"
                      :max="9999999"
                      :step="1"
                      :precision="0"
                      style="width: 100%"
                    />
                  </el-form-item>
                </el-col>
              </el-row>
              
              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="手机编号" prop="phoneNo">
                    <el-select
                      v-model="singleForm.phoneNo"
                      placeholder="请选择或输入手机编号"
                      filterable
                      remote
                      :remote-method="searchAccounts"
                      :loading="accountsLoading"
                      @change="handlePhoneNoChange"
                      @focus="searchAccounts"
                      style="width: 100%"
                    >
                      <el-option
                        v-for="account in accountOptions"
                        :key="account.id"
                        :label="`${account.phoneNo} (${account.accountLink})`"
                        :value="account.phoneNo"
                        :account-id="account.id"
                        :account-link="account.accountLink"
                      >
                        <div style="display: flex; justify-content: space-between;">
                          <span>{{ account.phoneNo }}</span>
                          <span style="color: #8492a6; font-size: 12px;">{{ account.accountLink }}</span>
                        </div>
                      </el-option>
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="账号链接" prop="accountLink">
                    <el-input
                      v-model="singleForm.accountLink"
                      placeholder="选择手机编号后自动填充"
                      readonly
                      style="width: 100%"
                    />
                  </el-form-item>
                </el-col>
              </el-row>

              <el-form-item label="备注" prop="remark">
                <el-input
                  v-model="singleForm.remark"
                  type="textarea"
                  :rows="3"
                  placeholder="请输入备注信息（可选）"
                  maxlength="200"
                  show-word-limit
                />
              </el-form-item>

              <el-form-item>
                <el-button
                  type="primary"
                  @click="handleSingleSubmit"
                  :loading="submitting"
                >
                  提交用户
                </el-button>
                <el-button @click="handleSingleReset">
                  重置
                </el-button>
              </el-form-item>
            </el-form>
          </el-tab-pane>

          <!-- 批量提交 -->
          <el-tab-pane label="批量提交" name="batch">
            <div class="batch-container">
              <div class="upload-section">
                <el-alert
                  title="批量提交说明"
                  type="info"
                  :closable="false"
                  show-icon
                >
                  <template #default>
                    <p>支持两种方式批量提交用户：</p>
                    <p>1. 直接在文本框中输入，每行一条记录，格式：用户ID,手机编号[,备注]</p>
                    <p>2. 上传CSV文件，文件格式与文本输入相同</p>
                    <p>示例：1234567,us-1,测试用户</p>
                  </template>
                </el-alert>
              </div>

              <el-form
                ref="batchFormRef"
                :model="batchForm"
                :rules="batchFormRules"
                label-width="120px"
                size="default"
              >
                <el-form-item label="输入方式">
                  <el-radio-group v-model="batchInputType">
                    <el-radio label="text">文本输入</el-radio>
                    <el-radio label="file">文件上传</el-radio>
                  </el-radio-group>
                </el-form-item>

                <el-form-item label="用户数据" prop="data" v-if="batchInputType === 'text'">
                  <el-input
                    v-model="batchForm.data"
                    type="textarea"
                    :rows="10"
                    placeholder="请输入用户数据，每行一条记录&#10;格式：用户ID,手机编号[,备注]&#10;示例：1234567,us-1,测试用户"
                  />
                </el-form-item>

                <el-form-item label="上传文件" prop="file" v-if="batchInputType === 'file'">
                  <el-upload
                    ref="uploadRef"
                    :auto-upload="false"
                    :show-file-list="true"
                    :limit="1"
                    accept=".csv,.txt"
                    :on-change="handleFileChange"
                    :on-remove="handleFileRemove"
                  >
                    <el-button type="primary">选择文件</el-button>
                    <template #tip>
                      <div class="el-upload__tip">
                        支持 .csv 和 .txt 文件，文件大小不超过 10MB
                      </div>
                    </template>
                  </el-upload>
                </el-form-item>

                <el-form-item>
                  <el-button
                    type="primary"
                    @click="handleBatchSubmit"
                    :loading="submitting"
                    :disabled="previewData.length === 0"
                  >
                    批量提交 ({{ previewData.length }}条)
                  </el-button>
                  <el-button @click="handleBatchReset">
                    重置
                  </el-button>
                  <el-button @click="handlePreview" v-if="batchForm.data || batchForm.file">
                    预览数据
                  </el-button>
                </el-form-item>
              </el-form>
            </div>
          </el-tab-pane>
        </el-tabs>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, type FormInstance, type FormRules, type UploadFile } from 'element-plus'
import { ArrowLeft } from '@element-plus/icons-vue'
import { createConversion } from '@/api/conversions'
import { getAccountList } from '@/api/accounts'
import { useUserStore } from '@/stores/user'
import type { CreateConversionParams, Account } from '@/types/business'

const router = useRouter()
const userStore = useUserStore()

const singleFormRef = ref<FormInstance>()
const batchFormRef = ref<FormInstance>()
const uploadRef = ref()
const submitting = ref(false)
const activeTab = ref('single')
const batchInputType = ref('text')
const previewData = ref<CreateConversionParams[]>([])

// 账号选项相关
const accountOptions = ref<Account[]>([])
const accountsLoading = ref(false)

// 单个提交表单
const singleForm = reactive<CreateConversionParams & { accountLink?: string; remark?: string }>({
  registerUserId: undefined as unknown as number,
  phoneNo: '',
  accountLink: '',
  remark: ''
})

// 批量提交表单
const batchForm = reactive({
  data: '',
  file: null as File | null
})

// 单个提交表单验证规则
const singleFormRules: FormRules = {
  registerUserId: [
    { required: true, message: '请输入用户ID', trigger: 'blur' },
    { 
      type: 'number', 
      min: 1000000, 
      max: 9999999, 
      message: '用户ID必须是7位数字', 
      trigger: 'blur' 
    }
  ],
  phoneNo: [
    { required: true, message: '请选择手机编号', trigger: 'change' }
  ]
}

// 批量提交表单验证规则
const batchFormRules: FormRules = {
  data: [
    {
      validator: (rule, value, callback) => {
        if (batchInputType.value === 'text' && !value) {
          callback(new Error('请输入用户数据'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ],
  file: [
    {
      validator: (rule, value, callback) => {
        if (batchInputType.value === 'file' && !batchForm.file) {
          callback(new Error('请选择上传文件'))
        } else {
          callback()
        }
      },
      trigger: 'change'
    }
  ]
}

// 搜索账号
const searchAccounts = async (query: string = '') => {
  accountsLoading.value = true
  try {
    const params: any = {
      pageSize: 20,
      ownerId: userStore.userInfo?.id // 只搜索归属于当前用户的账号
    }
    
    // 如果有搜索关键词，添加到查询参数中
    if (query.trim()) {
      params.q = query.trim()
    }
    
    const response = await getAccountList(params)
    console.log('账号列表响应:', response) // 调试日志
    accountOptions.value = response.data.data.items
  } catch (error) {
    console.error('搜索账号失败:', error)
    ElMessage.error('搜索账号失败')
    accountOptions.value = []
  } finally {
    accountsLoading.value = false
  }
}

// 处理手机编号变化
const handlePhoneNoChange = (phoneNo: string) => {
  const selectedAccount = accountOptions.value.find(acc => acc.phoneNo === phoneNo)
  if (selectedAccount) {
    singleForm.accountLink = selectedAccount.accountLink
    // 同时保存accountId以便提交时使用
    ;(singleForm as any).accountId = selectedAccount.id
  }
}

// 单个提交
const handleSingleSubmit = async () => {
  if (!singleFormRef.value) return

  try {
    const valid = await singleFormRef.value.validate()
    if (!valid) return

    submitting.value = true
    
    const params: CreateConversionParams = {
      registerUserId: singleForm.registerUserId,
      accountId: (singleForm as any).accountId,
      phoneNo: singleForm.phoneNo
    }
    
    await createConversion(params)
    ElMessage.success('用户提交成功')
    router.push('/conversions')
  } catch (error) {
    console.error('提交用户失败:', error)
    ElMessage.error('提交用户失败')
  } finally {
    submitting.value = false
  }
}

// 单个提交重置
const handleSingleReset = () => {
  if (!singleFormRef.value) return
  singleFormRef.value.resetFields()
  singleForm.accountLink = ''
  ;(singleForm as any).accountId = ''
}

// 文件变化处理
const handleFileChange = (file: UploadFile) => {
  batchForm.file = file.raw || null
  if (file.raw) {
    readFileContent(file.raw)
  }
}

// 文件移除处理
const handleFileRemove = () => {
  batchForm.file = null
  batchForm.data = ''
  previewData.value = []
}

// 读取文件内容
const readFileContent = (file: File) => {
  const reader = new FileReader()
  reader.onload = (e) => {
    batchForm.data = e.target?.result as string
    handlePreview()
  }
  reader.readAsText(file, 'UTF-8')
}

// 预览数据
const handlePreview = () => {
  const data = batchForm.data.trim()
  if (!data) {
    previewData.value = []
    return
  }

  const lines = data.split('\n').filter(line => line.trim())
  const parsed: CreateConversionParams[] = []

  for (const line of lines) {
    const parts = line.split(',').map(part => part.trim())
    if (parts.length < 2) continue

    const [registerUserIdStr, phoneNo, remark] = parts
    const registerUserId = parseInt(registerUserIdStr)
    
    if (isNaN(registerUserId) || registerUserId < 1000000 || registerUserId > 9999999) {
      continue // 跳过无效的用户ID
    }

    parsed.push({
      registerUserId,
      phoneNo,
      // 备注暂不处理，因为CreateConversionParams接口中没有remark字段
    })
  }

  previewData.value = parsed
  ElMessage.success(`解析成功，共 ${parsed.length} 条数据`)
}

// 批量提交
const handleBatchSubmit = async () => {
  if (!batchFormRef.value) return

  try {
    const valid = await batchFormRef.value.validate()
    if (!valid) return

    if (previewData.value.length === 0) {
      ElMessage.warning('请先预览数据')
      return
    }

    submitting.value = true
    
    // 批量提交转化
    const promises = previewData.value.map(item => createConversion(item))
    await Promise.all(promises)
    
    ElMessage.success(`批量提交成功，共 ${previewData.value.length} 条用户`)
    router.push('/conversions')
  } catch (error) {
    console.error('批量提交失败:', error)
    ElMessage.error('批量提交失败')
  } finally {
    submitting.value = false
  }
}

// 批量提交重置
const handleBatchReset = () => {
  if (!batchFormRef.value) return
  batchFormRef.value.resetFields()
  batchForm.data = ''
  batchForm.file = null
  previewData.value = []
  if (uploadRef.value) {
    uploadRef.value.clearFiles()
  }
}

// 初始化加载账号数据
onMounted(() => {
  // 初始化时加载一些账号数据
  searchAccounts()
})
</script>

<style scoped>
.page-container {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header-left h2 {
  margin: 0;
  color: #303133;
}

.form-card {
  max-width: 1200px;
}

.batch-container {
  padding: 20px 0;
}

.upload-section {
  margin-bottom: 20px;
}

:deep(.el-select-dropdown__item) {
  height: auto;
  padding: 8px 20px;
}
</style>