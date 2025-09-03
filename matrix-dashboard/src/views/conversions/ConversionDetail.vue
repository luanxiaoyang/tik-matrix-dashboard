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
        <h2>转化详情</h2>
      </div>
      <div class="header-right" v-if="conversionData">
        <el-tag 
          :type="getStatusColor(conversionData.status)"
          size="large"
        >
          {{ getStatusText(conversionData.status) }}
        </el-tag>
      </div>
    </div>

    <div class="page-content" v-loading="loading">
      <div v-if="conversionData" class="detail-container">
        <!-- 基本信息 -->
        <el-card class="info-card">
          <template #header>
            <span class="card-title">转化信息</span>
          </template>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="转化ID">
              {{ conversionData.id }}
            </el-descriptions-item>
            <el-descriptions-item label="手机编号">
              {{ conversionData.phone }}
            </el-descriptions-item>
            <el-descriptions-item label="账号链接">
              <el-link 
                :href="conversionData.accountUrl" 
                target="_blank" 
                type="primary"
              >
                {{ conversionData.accountUrl }}
              </el-link>
            </el-descriptions-item>
            <el-descriptions-item label="转化类型">
              <el-tag 
                :type="getConversionTypeColor(conversionData.conversionType)"
                size="small"
              >
                {{ getConversionTypeText(conversionData.conversionType) }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="转化金额" v-if="conversionData.amount">
              ¥{{ conversionData.amount?.toFixed(2) }}
            </el-descriptions-item>
            <el-descriptions-item label="转化状态">
              <el-tag 
                :type="getStatusColor(conversionData.status)"
                size="small"
              >
                {{ getStatusText(conversionData.status) }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="提交人">
              {{ conversionData.submitter }}
            </el-descriptions-item>
            <el-descriptions-item label="提交时间">
              {{ formatDateTime(conversionData.submittedAt) }}
            </el-descriptions-item>
            <el-descriptions-item label="处理时间" v-if="conversionData.processedAt">
              {{ formatDateTime(conversionData.processedAt) }}
            </el-descriptions-item>
            <el-descriptions-item label="处理人" v-if="conversionData.processor">
              {{ conversionData.processor }}
            </el-descriptions-item>
            <el-descriptions-item label="备注" :span="2" v-if="conversionData.remark">
              {{ conversionData.remark }}
            </el-descriptions-item>
            <el-descriptions-item label="失败原因" :span="2" v-if="conversionData.failureReason">
              <el-text type="danger">{{ conversionData.failureReason }}</el-text>
            </el-descriptions-item>
          </el-descriptions>
        </el-card>

        <!-- 处理进度 -->
        <el-card class="progress-card">
          <template #header>
            <span class="card-title">处理进度</span>
          </template>
          <el-steps 
            :active="getStepActive(conversionData.status)" 
            :process-status="getProcessStatus(conversionData.status)"
            align-center
          >
            <el-step title="提交转化" :description="formatDateTime(conversionData.submittedAt)" />
            <el-step 
              title="处理中" 
              :description="conversionData.status === 'processing' ? '正在处理...' : ''"
            />
            <el-step 
              :title="conversionData.status === 'failed' ? '处理失败' : '处理完成'"
              :description="conversionData.processedAt ? formatDateTime(conversionData.processedAt) : ''"
            />
          </el-steps>
        </el-card>

        <!-- 相关账号信息 -->
        <el-card class="account-card" v-if="accountInfo">
          <template #header>
            <span class="card-title">关联账号信息</span>
          </template>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="账号状态">
              <el-tag 
                :type="getAccountStatusColor(accountInfo.status)"
                size="small"
              >
                {{ getAccountStatusText(accountInfo.status) }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="归属用户">
              {{ accountInfo.owner || '未分配' }}
            </el-descriptions-item>
            <el-descriptions-item label="创建者">
              {{ accountInfo.creator }}
            </el-descriptions-item>
            <el-descriptions-item label="创建时间">
              {{ formatDateTime(accountInfo.createdAt) }}
            </el-descriptions-item>
          </el-descriptions>
        </el-card>

        <!-- 操作记录 -->
        <el-card class="history-card">
          <template #header>
            <span class="card-title">操作记录</span>
          </template>
          <el-timeline>
            <el-timeline-item
              v-for="(record, index) in operationHistory"
              :key="index"
              :timestamp="formatDateTime(record.timestamp)"
              placement="top"
            >
              <div class="timeline-content">
                <div class="operation-type">
                  <el-tag size="small" :type="getOperationType(record.type)">
                    {{ record.type }}
                  </el-tag>
                </div>
                <div class="operation-desc">{{ record.description }}</div>
                <div class="operation-user">操作人：{{ record.operator }}</div>
              </div>
            </el-timeline-item>
          </el-timeline>
        </el-card>
      </div>

      <div v-else-if="!loading" class="empty-state">
        <el-empty description="转化记录不存在或已被删除" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft } from '@element-plus/icons-vue'
import { getConversionDetail } from '@/api/conversions'
import { getAccountDetail } from '@/api/accounts'
import { useUserStore } from '@/stores/user'
import type { ConversionRecord, AccountInfo } from '@/types/business'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const loading = ref(false)
const conversionData = ref<ConversionRecord | null>(null)
const accountInfo = ref<AccountInfo | null>(null)

// 模拟操作记录数据
const operationHistory = ref([
  {
    type: '提交转化',
    description: '用户提交转化申请',
    operator: 'admin',
    timestamp: new Date().toISOString()
  },
  {
    type: '开始处理',
    description: '系统开始处理转化请求',
    operator: 'system',
    timestamp: new Date(Date.now() - 3600000).toISOString()
  },
  {
    type: '处理完成',
    description: '转化处理成功',
    operator: 'system',
    timestamp: new Date(Date.now() - 1800000).toISOString()
  }
])

// 获取转化详情
const fetchConversionDetail = async () => {
  const conversionId = route.params.id as string
  if (!conversionId) {
    ElMessage.error('转化ID不能为空')
    router.go(-1)
    return
  }

  loading.value = true
  try {
    const response = await getConversionDetail(conversionId)
    conversionData.value = response.data
    
    // 获取关联账号信息
    if (response.data.accountId) {
      try {
        const accountResponse = await getAccountDetail(response.data.accountId)
        accountInfo.value = accountResponse.data
      } catch (error) {
        console.warn('获取账号信息失败:', error)
      }
    }
  } catch (error) {
    console.error('获取转化详情失败:', error)
    ElMessage.error('获取转化详情失败')
  } finally {
    loading.value = false
  }
}

// 获取步骤激活状态
const getStepActive = (status: string) => {
  const stepMap: Record<string, number> = {
    'pending': 0,
    'processing': 1,
    'success': 2,
    'failed': 2
  }
  return stepMap[status] || 0
}

// 获取处理状态
const getProcessStatus = (status: string) => {
  if (status === 'failed') return 'error'
  if (status === 'success') return 'success'
  return 'process'
}

// 获取转化类型颜色
const getConversionTypeColor = (type: string) => {
  const colorMap: Record<string, string> = {
    'register': 'success',
    'recharge': 'warning',
    'withdraw': 'danger'
  }
  return colorMap[type] || 'info'
}

// 获取转化类型文本
const getConversionTypeText = (type: string) => {
  const textMap: Record<string, string> = {
    'register': '注册',
    'recharge': '充值',
    'withdraw': '提现'
  }
  return textMap[type] || type
}

// 获取状态颜色
const getStatusColor = (status: string) => {
  const colorMap: Record<string, string> = {
    'pending': 'info',
    'processing': 'warning',
    'success': 'success',
    'failed': 'danger'
  }
  return colorMap[status] || 'info'
}

// 获取状态文本
const getStatusText = (status: string) => {
  const textMap: Record<string, string> = {
    'pending': '待处理',
    'processing': '处理中',
    'success': '成功',
    'failed': '失败'
  }
  return textMap[status] || status
}

// 获取账号状态颜色
const getAccountStatusColor = (status: string) => {
  const colorMap: Record<string, string> = {
    'active': 'success',
    'inactive': 'info',
    'suspended': 'warning',
    'banned': 'danger'
  }
  return colorMap[status] || 'info'
}

// 获取账号状态文本
const getAccountStatusText = (status: string) => {
  const textMap: Record<string, string> = {
    'active': '正常',
    'inactive': '待激活',
    'suspended': '暂停',
    'banned': '封禁'
  }
  return textMap[status] || status
}

// 获取操作类型
const getOperationType = (type: string) => {
  const typeMap: Record<string, string> = {
    '提交转化': 'success',
    '开始处理': 'warning',
    '处理完成': 'success',
    '处理失败': 'danger'
  }
  return typeMap[type] || 'info'
}

// 格式化日期时间
const formatDateTime = (dateStr: string) => {
  return new Date(dateStr).toLocaleString('zh-CN')
}

onMounted(() => {
  fetchConversionDetail()
})
</script>

<style scoped>
.detail-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.info-card,
.progress-card,
.account-card,
.history-card {
  margin-bottom: 0;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.timeline-content {
  padding: 8px 0;
}

.operation-type {
  margin-bottom: 4px;
}

.operation-desc {
  color: var(--el-text-color-primary);
  margin-bottom: 4px;
}

.operation-user {
  color: var(--el-text-color-secondary);
  font-size: 12px;
}

.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
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

.header-right {
  display: flex;
  align-items: center;
}

:deep(.el-steps) {
  margin: 20px 0;
}
</style>