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
        <h2>{{ isEdit ? '编辑账号' : '创建账号' }}</h2>
      </div>
    </div>

    <div class="page-content" v-loading="loading">
      <el-card class="form-card">
        <el-form
          ref="formRef"
          :model="formData"
          :rules="formRules"
          label-width="100px"
          size="default"
        >
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="手机编号" prop="phoneNo">
                <el-input
                  v-model="formData.phoneNo"
                  placeholder="请输入手机编号（如：us-1、美国1、云845）"
                  :disabled="isEdit"
                  maxlength="50"
                  show-word-limit
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="账号链接" prop="accountLink">
                <el-input
                  v-model="formData.accountLink"
                  placeholder="请输入账号链接"
                  type="url"
                />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="账号状态" prop="status">
                <el-select
                  v-model="formData.status"
                  placeholder="请选择账号状态"
                  style="width: 100%"
                >
                  <el-option
                    v-for="option in statusOptions"
                    :key="option.value"
                    :label="option.label"
                    :value="option.value"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="归属用户" prop="ownerId">
                <el-select
                  v-model="formData.ownerId"
                  placeholder="请选择归属用户"
                  style="width: 100%"
                  filterable
                  clearable
                >
                  <el-option
                    v-for="user in userOptions"
                    :key="user.value"
                    :label="user.label"
                    :value="user.value"
                  />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>

          <el-form-item label="备注" prop="remark">
            <el-input
              v-model="formData.remark"
              type="textarea"
              :rows="4"
              placeholder="请输入备注信息"
              maxlength="500"
              show-word-limit
            />
          </el-form-item>

          <el-form-item>
            <el-button
              type="primary"
              @click="handleSubmit"
              :loading="submitting"
            >
              {{ isEdit ? '更新' : '创建' }}
            </el-button>
            <el-button @click="handleReset">
              重置
            </el-button>
            <el-button @click="$router.go(-1)">
              取消
            </el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox, type FormRules, type FormInstance } from 'element-plus'
import { ArrowLeft } from '@element-plus/icons-vue'
import { createAccount, getAccountDetail, updateAccount } from '@/api/accounts'
import { useUserStore } from '@/stores/user'
import type { Account } from '@/types/business'
import { AccountStatus } from '@/types/business'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const formRef = ref<FormInstance>()
const loading = ref(false)
const submitting = ref(false)

// 判断是否为编辑模式
const isEdit = computed(() => !!route.params.id)

// 表单数据
const formData = reactive<Partial<Account>>({
  phoneNo: '',
  accountLink: '',
  status: AccountStatus.ACTIVE,
  ownerId: '',
  remark: ''
})

// 状态选项
const statusOptions = [
  { label: '正常', value: 'active' },
  { label: '待激活', value: 'inactive' },
  { label: '暂停', value: 'suspended' },
  { label: '封禁', value: 'banned' }
]

// 用户选项（模拟数据）
const userOptions = ref([
  { label: '张三', value: '张三' },
  { label: '李四', value: '李四' },
  { label: '王五', value: '王五' },
  { label: '赵六', value: '赵六' }
])

// 表单验证规则
const formRules: FormRules = {
  phoneNo: [
    { required: true, message: '请输入手机编号', trigger: 'blur' },
    { min: 1, max: 50, message: '手机编号长度为1-50个字符', trigger: 'blur' }
  ],
  accountLink: [
    { required: true, message: '请输入账号链接', trigger: 'blur' },
    { pattern: /^https:\/\/www\.tiktok\.com\/@[a-zA-Z0-9_.]+$/, message: '账号链接格式不正确，应为 https://www.tiktok.com/@username', trigger: 'blur' }
  ],
  status: [
    { required: true, message: '请选择账号状态', trigger: 'change' }
  ],
  ownerId: [
    { required: true, message: '请选择归属用户', trigger: 'change' }
  ]
}

// 获取账号详情（编辑模式）
const fetchAccountDetail = async () => {
  const accountId = route.params.id as string
  if (!accountId) return

  loading.value = true
  try {
    const response = await getAccountDetail(accountId)
    const account = response.data.data
    
    // 填充表单数据
    Object.assign(formData, {
      phoneNo: account.phoneNo,
      accountLink: account.accountLink,
      status: account.status,
      ownerId: account.ownerId || '',
      remark: account.remark || ''
    })
  } catch (error) {
    console.error('获取账号详情失败:', error)
    ElMessage.error('获取账号详情失败')
    router.go(-1)
  } finally {
    loading.value = false
  }
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    const valid = await formRef.value.validate()
    if (!valid) return

    submitting.value = true

    if (isEdit.value) {
      // 编辑模式
      await updateAccount(route.params.id as string, {
        phoneNo: formData.phoneNo!,
        accountLink: formData.accountLink!,
        ownerId: formData.ownerId,
        status: formData.status!,
        remark: formData.remark
      })
      ElMessage.success('账号更新成功')
    } else {
      // 创建模式
      await createAccount({
        phone: formData.phoneNo!,
        phoneNo: formData.phoneNo!,
        accountUrl: formData.accountLink!,
        accountLink: formData.accountLink!,
        ownerId: formData.ownerId,
        status: formData.status!.toString(),
        remark: formData.remark
      })
      ElMessage.success('账号创建成功')
    }

    router.push('/accounts')
  } catch (error) {
    console.error('操作失败:', error)
    ElMessage.error(isEdit.value ? '账号更新失败' : '账号创建失败')
  } finally {
    submitting.value = false
  }
}

// 重置表单
const handleReset = () => {
  if (!formRef.value) return
  formRef.value.resetFields()
}

// 权限检查
const checkPermission = () => {
  const requiredPermission = isEdit.value ? 'account:edit' : 'account:create'
  if (!userStore.hasPermission(requiredPermission)) {
    ElMessage.error('您没有权限执行此操作')
    router.go(-1)
    return false
  }
  return true
}

onMounted(() => {
  if (!checkPermission()) return
  
  if (isEdit.value) {
    fetchAccountDetail()
  }
})
</script>

<style scoped>
.form-card {
  max-width: 800px;
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

:deep(.el-form-item__label) {
  font-weight: 500;
}

:deep(.el-textarea__inner) {
  resize: vertical;
}
</style>