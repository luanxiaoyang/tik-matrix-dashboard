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
          type="success"
          size="large"
        >
          转化记录
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
              {{ conversionData.phoneNo }}
            </el-descriptions-item>
            <el-descriptions-item label="账号链接" v-if="conversionData.accountBrief?.accountLink">
              <el-link 
                :href="conversionData.accountBrief.accountLink" 
                target="_blank" 
                type="primary"
              >
                {{ conversionData.accountBrief.accountLink }}
              </el-link>
            </el-descriptions-item>
            <el-descriptions-item label="注册用户ID">
              {{ conversionData.registerUserId }}
            </el-descriptions-item>
            <el-descriptions-item label="账号ID" v-if="conversionData.accountId">
              {{ conversionData.accountId }}
            </el-descriptions-item>
            <el-descriptions-item label="创建者">
              {{ conversionData.createdBy }}
            </el-descriptions-item>
            <el-descriptions-item label="创建时间">
              {{ formatDateTime(conversionData.createdAt) }}
            </el-descriptions-item>
            <el-descriptions-item label="是否重复" v-if="conversionData.duplicated !== undefined">
              <el-tag :type="conversionData.duplicated ? 'warning' : 'success'" size="small">
                {{ conversionData.duplicated ? '是' : '否' }}
              </el-tag>
            </el-descriptions-item>

          </el-descriptions>
        </el-card>

        <!-- 转化时间线 -->
        <el-card class="timeline-card">
          <template #header>
            <span class="card-title">转化时间线</span>
          </template>
          <el-timeline>
            <el-timeline-item
              :timestamp="formatDateTime(conversionData.createdAt)"
              placement="top"
            >
              <div class="timeline-content">
                <div class="operation-type">
                  <el-tag size="small" type="success">
                    创建转化记录
                  </el-tag>
                </div>
                <div class="operation-desc">转化记录已创建</div>
                <div class="operation-user">创建者：{{ conversionData.createdBy }}</div>
              </div>
            </el-timeline-item>
          </el-timeline>
        </el-card>

        <!-- 相关账号信息 -->
        <el-card class="account-card" v-if="conversionData.accountBrief">
          <template #header>
            <span class="card-title">关联账号信息</span>
          </template>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="账号ID">
              {{ conversionData.accountBrief.id }}
            </el-descriptions-item>
            <el-descriptions-item label="手机编号">
              {{ conversionData.accountBrief.phoneNo }}
            </el-descriptions-item>
            <el-descriptions-item label="账号链接" :span="2">
              <el-link 
                :href="conversionData.accountBrief.accountLink" 
                target="_blank" 
                type="primary"
              >
                {{ conversionData.accountBrief.accountLink }}
              </el-link>
            </el-descriptions-item>
            <el-descriptions-item label="归属用户ID">
              {{ conversionData.accountBrief.ownerId }}
            </el-descriptions-item>
          </el-descriptions>
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
import type { Conversion } from '@/types/business'

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const conversionData = ref<Conversion | null>(null)

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
    conversionData.value = response.data.data
  } catch (error) {
    console.error('获取转化详情失败:', error)
    ElMessage.error('获取转化详情失败')
  } finally {
    loading.value = false
  }
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