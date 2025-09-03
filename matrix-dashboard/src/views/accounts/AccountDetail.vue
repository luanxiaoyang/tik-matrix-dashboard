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
        <h2>账号详情</h2>
      </div>
      <div class="header-right" v-if="accountData">
        <el-button 
          type="primary" 
          :icon="Edit"
          @click="handleEdit"
          v-if="userStore.hasPermission('account:edit')"
        >
          编辑
        </el-button>
        <el-button 
          type="danger" 
          :icon="Delete"
          @click="handleDelete"
          v-if="userStore.hasPermission('account:delete')"
        >
          删除
        </el-button>
      </div>
    </div>

    <div class="page-content" v-loading="loading">
      <div v-if="accountData" class="detail-container">
        <!-- 基本信息 -->
        <el-card class="info-card">
          <template #header>
            <span class="card-title">基本信息</span>
          </template>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="手机编号">
              {{ accountData.phone }}
            </el-descriptions-item>
            <el-descriptions-item label="账号链接">
              <el-link 
                :href="accountData.accountUrl" 
                target="_blank" 
                type="primary"
              >
                {{ accountData.accountUrl }}
              </el-link>
            </el-descriptions-item>
            <el-descriptions-item label="账号状态">
              <el-tag 
                :type="getStatusType(accountData.status)"
                size="small"
              >
                {{ getStatusText(accountData.status) }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="归属用户">
              {{ accountData.owner || '未分配' }}
            </el-descriptions-item>
            <el-descriptions-item label="创建者">
              {{ accountData.creator }}
            </el-descriptions-item>
            <el-descriptions-item label="创建时间">
              {{ formatDateTime(accountData.createdAt) }}
            </el-descriptions-item>
            <el-descriptions-item label="更新时间">
              {{ formatDateTime(accountData.updatedAt) }}
            </el-descriptions-item>
            <el-descriptions-item label="备注" :span="2">
              {{ accountData.remark || '无' }}
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
        <el-empty description="账号不存在或已被删除" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowLeft, Edit, Delete } from '@element-plus/icons-vue'
import { getAccountDetail } from '@/api/accounts'
import { useUserStore } from '@/stores/user'
import type { AccountInfo } from '@/types/business'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const loading = ref(false)
const accountData = ref<AccountInfo | null>(null)

// 模拟操作记录数据
const operationHistory = ref([
  {
    type: '创建账号',
    description: '账号创建成功',
    operator: 'admin',
    timestamp: new Date().toISOString()
  },
  {
    type: '状态变更',
    description: '账号状态从"待激活"变更为"正常"',
    operator: 'system',
    timestamp: new Date(Date.now() - 86400000).toISOString()
  },
  {
    type: '归属变更',
    description: '账号归属从"未分配"变更为"张三"',
    operator: 'admin',
    timestamp: new Date(Date.now() - 172800000).toISOString()
  }
])

// 获取账号详情
const fetchAccountDetail = async () => {
  const accountId = route.params.id as string
  if (!accountId) {
    ElMessage.error('账号ID不能为空')
    router.go(-1)
    return
  }

  loading.value = true
  try {
    const response = await getAccountDetail(accountId)
    accountData.value = response.data
  } catch (error) {
    console.error('获取账号详情失败:', error)
    ElMessage.error('获取账号详情失败')
  } finally {
    loading.value = false
  }
}

// 编辑账号
const handleEdit = () => {
  router.push(`/accounts/edit/${route.params.id}`)
}

// 删除账号
const handleDelete = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要删除这个账号吗？删除后无法恢复。',
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    // 这里应该调用删除API
    ElMessage.success('删除成功')
    router.push('/accounts')
  } catch {
    // 用户取消删除
  }
}

// 获取状态类型
const getStatusType = (status: string) => {
  const statusMap: Record<string, string> = {
    'active': 'success',
    'inactive': 'info',
    'suspended': 'warning',
    'banned': 'danger'
  }
  return statusMap[status] || 'info'
}

// 获取状态文本
const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    'active': '正常',
    'inactive': '待激活',
    'suspended': '暂停',
    'banned': '封禁'
  }
  return statusMap[status] || status
}

// 获取操作类型
const getOperationType = (type: string) => {
  const typeMap: Record<string, string> = {
    '创建账号': 'success',
    '状态变更': 'warning',
    '归属变更': 'info',
    '删除账号': 'danger'
  }
  return typeMap[type] || 'info'
}

// 格式化日期时间
const formatDateTime = (dateStr: string) => {
  return new Date(dateStr).toLocaleString('zh-CN')
}

onMounted(() => {
  fetchAccountDetail()
})
</script>

<style scoped>
.detail-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.info-card,
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
  gap: 8px;
}
</style>