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
        <h2>提交转化</h2>
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
                  <el-form-item label="手机编号" prop="phone">
                    <el-input
                      v-model="singleForm.phone"
                      placeholder="请输入手机编号（如：us-1、美国1、云845）"
                      maxlength="50"
                      show-word-limit
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="账号链接" prop="accountUrl">
                    <el-input
                      v-model="singleForm.accountUrl"
                      placeholder="请输入TikTok账号链接（https://www.tiktok.com/@username）"
                      type="url"
                    />
                  </el-form-item>
                </el-col>
              </el-row>

              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="转化类型" prop="conversionType">
                    <el-select
                      v-model="singleForm.conversionType"
                      placeholder="请选择转化类型"
                      style="width: 100%"
                    >
                      <el-option
                        v-for="option in conversionTypeOptions"
                        :key="option.value"
                        :label="option.label"
                        :value="option.value"
                      />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="转化金额" prop="amount" v-if="singleForm.conversionType === 'recharge'">
                    <el-input-number
                      v-model="singleForm.amount"
                      :min="0"
                      :precision="2"
                      placeholder="请输入转化金额"
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
                  placeholder="请输入备注信息"
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
                  提交转化
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
                    <p>支持两种方式批量提交转化：</p>
                    <p>1. 直接在文本框中输入，每行一条记录，格式：手机号,账号链接,转化类型[,转化金额][,备注]</p>
                    <p>2. 上传CSV文件，文件格式与文本输入相同</p>
                    <p>转化类型：register(注册)、recharge(充值)、withdraw(提现)</p>
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

                <el-form-item label="转化数据" prop="data" v-if="batchInputType === 'text'">
                  <el-input
                    v-model="batchForm.data"
                    type="textarea"
                    :rows="10"
                    placeholder="请输入转化数据，每行一条记录&#10;格式：手机编号,账号链接,转化类型[,转化金额][,备注]&#10;示例：us-1,https://www.tiktok.com/@user1,register,注册转化"
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

                <!-- 数据预览 -->
                <el-form-item label="数据预览" v-if="previewData.length > 0">
                  <el-table
                    :data="previewData.slice(0, 10)"
                    border
                    size="small"
                    style="width: 100%"
                  >
                    <el-table-column prop="phone" label="手机编号" width="120" />
                    <el-table-column prop="accountUrl" label="账号链接" min-width="200" show-overflow-tooltip />
                    <el-table-column prop="conversionType" label="转化类型" width="100" />
                    <el-table-column prop="amount" label="转化金额" width="100" />
                    <el-table-column prop="remark" label="备注" width="150" show-overflow-tooltip />
                  </el-table>
                  <div v-if="previewData.length > 10" class="preview-tip">
                    仅显示前10条数据，共 {{ previewData.length }} 条
                  </div>
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
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, type FormInstance, type FormRules, type UploadFile } from 'element-plus'
import { ArrowLeft } from '@element-plus/icons-vue'
import { submitConversion } from '@/api/conversions'
import { useUserStore } from '@/stores/user'
import type { CreateConversionParams } from '@/types/business'

const router = useRouter()
const userStore = useUserStore()

const singleFormRef = ref<FormInstance>()
const batchFormRef = ref<FormInstance>()
const uploadRef = ref()
const submitting = ref(false)
const activeTab = ref('single')
const batchInputType = ref('text')
const previewData = ref<CreateConversionParams[]>([])

// 单个提交表单
const singleForm = reactive<CreateConversionParams>({
  phone: '',
  accountUrl: '',
  conversionType: '',
  amount: undefined,
  remark: ''
})

// 批量提交表单
const batchForm = reactive({
  data: '',
  file: null as File | null
})

// 转化类型选项
const conversionTypeOptions = [
  { label: '注册', value: 'register' },
  { label: '充值', value: 'recharge' },
  { label: '提现', value: 'withdraw' }
]

// 单个提交表单验证规则
const singleFormRules: FormRules = {
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    {
      pattern: /^1[3-9]\d{9}$/,
      message: '请输入正确的手机号格式',
      trigger: 'blur'
    }
  ],
  accountUrl: [
    { required: true, message: '请输入账号链接', trigger: 'blur' },
    {
      type: 'url',
      message: '请输入正确的URL格式',
      trigger: 'blur'
    }
  ],
  conversionType: [
    { required: true, message: '请选择转化类型', trigger: 'change' }
  ],
  amount: [
    {
      validator: (rule, value, callback) => {
        if (singleForm.conversionType === 'recharge' && (!value || value <= 0)) {
          callback(new Error('充值转化必须输入转化金额'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

// 批量提交表单验证规则
const batchFormRules: FormRules = {
  data: [
    {
      validator: (rule, value, callback) => {
        if (batchInputType.value === 'text' && !value) {
          callback(new Error('请输入转化数据'))
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

// 单个提交
const handleSingleSubmit = async () => {
  if (!singleFormRef.value) return

  try {
    const valid = await singleFormRef.value.validate()
    if (!valid) return

    submitting.value = true
    await submitConversion(singleForm)
    ElMessage.success('转化提交成功')
    router.push('/conversions')
  } catch (error) {
    console.error('提交转化失败:', error)
    ElMessage.error('提交转化失败')
  } finally {
    submitting.value = false
  }
}

// 单个提交重置
const handleSingleReset = () => {
  if (!singleFormRef.value) return
  singleFormRef.value.resetFields()
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
    if (parts.length < 3) continue

    const [phone, accountUrl, conversionType, amount, remark] = parts
    parsed.push({
      phone,
      accountUrl,
      conversionType,
      amount: amount && !isNaN(Number(amount)) ? Number(amount) : undefined,
      remark: remark || ''
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
    const promises = previewData.value.map(item => submitConversion(item))
    await Promise.all(promises)
    
    ElMessage.success(`批量提交成功，共 ${previewData.value.length} 条转化`)
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
</script>

<style scoped>
.form-card {
  max-width: 1000px;
  margin: 0 auto;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-left h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.batch-container {
  padding: 20px 0;
}

.upload-section {
  margin-bottom: 20px;
}

.preview-tip {
  margin-top: 8px;
  color: var(--el-text-color-secondary);
  font-size: 12px;
}

:deep(.el-form-item__label) {
  font-weight: 500;
}

:deep(.el-textarea__inner) {
  resize: vertical;
}

:deep(.el-upload__tip) {
  margin-top: 8px;
}
</style>