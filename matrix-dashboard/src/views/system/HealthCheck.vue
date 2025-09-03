<template>
  <div class="health-check">
    <el-card class="status-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span>系统状态</span>
          <el-button type="primary" @click="fetchHealthData">
            <el-icon><Refresh /></el-icon>
            刷新
          </el-button>
        </div>
      </template>
      
      <div v-loading="loading" class="status-content">
        <div v-if="healthData" class="status-grid">
          <!-- 系统状态 -->
          <div class="status-item">
            <div class="status-label">系统状态</div>
            <div class="status-value">
              <el-tag :type="healthData.status === 'ok' ? 'success' : 'danger'" size="large">
                {{ healthData.status === 'ok' ? '正常' : '异常' }}
              </el-tag>
            </div>
          </div>
          
          <!-- 运行时间 -->
          <div class="status-item">
            <div class="status-label">运行时间</div>
            <div class="status-value">{{ formatUptime(healthData.uptime) }}</div>
          </div>
          
          <!-- 环境 -->
          <div class="status-item">
            <div class="status-label">运行环境</div>
            <div class="status-value">
              <el-tag :type="healthData.environment === 'production' ? 'success' : 'warning'">
                {{ healthData.environment }}
              </el-tag>
            </div>
          </div>
          
          <!-- 最后更新时间 -->
          <div class="status-item">
            <div class="status-label">检查时间</div>
            <div class="status-value">{{ formatDateTime(healthData.timestamp) }}</div>
          </div>
        </div>
        
        <!-- 内存使用情况 -->
        <div v-if="healthData" class="memory-section">
          <h3>内存使用情况</h3>
          <div class="memory-grid">
            <div class="memory-item">
              <div class="memory-label">RSS 内存</div>
              <div class="memory-value">{{ formatBytes(healthData.memory.rss) }}</div>
              <div class="memory-bar">
                <el-progress
                  :percentage="getMemoryPercentage('rss')"
                  :color="getMemoryColor(getMemoryPercentage('rss'))"
                />
              </div>
            </div>
            
            <div class="memory-item">
              <div class="memory-label">堆内存总量</div>
              <div class="memory-value">{{ formatBytes(healthData.memory.heapTotal) }}</div>
              <div class="memory-bar">
                <el-progress
                  :percentage="getMemoryPercentage('heapTotal')"
                  :color="getMemoryColor(getMemoryPercentage('heapTotal'))"
                />
              </div>
            </div>
            
            <div class="memory-item">
              <div class="memory-label">堆内存使用</div>
              <div class="memory-value">{{ formatBytes(healthData.memory.heapUsed) }}</div>
              <div class="memory-bar">
                <el-progress
                  :percentage="getHeapUsagePercentage()"
                  :color="getMemoryColor(getHeapUsagePercentage())"
                />
              </div>
            </div>
            
            <div class="memory-item">
              <div class="memory-label">外部内存</div>
              <div class="memory-value">{{ formatBytes(healthData.memory.external) }}</div>
              <div class="memory-bar">
                <el-progress
                  :percentage="getMemoryPercentage('external')"
                  :color="getMemoryColor(getMemoryPercentage('external'))"
                />
              </div>
            </div>
          </div>
        </div>
        
        <div v-if="!healthData && !loading" class="no-data">
          <el-empty description="暂无数据" />
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Refresh } from '@element-plus/icons-vue'
import { HealthService, type HealthCheckResponse } from '@/services/health'

const loading = ref(false)
const healthData = ref<HealthCheckResponse | null>(null)

// 获取健康检查数据
const fetchHealthData = async () => {
  try {
    loading.value = true
    const response = await HealthService.getHealthCheck()
    healthData.value = response.data
  } catch (error) {
    console.error('获取健康检查数据失败:', error)
    ElMessage.error('获取系统状态失败')
  } finally {
    loading.value = false
  }
}

// 格式化运行时间
const formatUptime = (seconds: number) => {
  const days = Math.floor(seconds / 86400)
  const hours = Math.floor((seconds % 86400) / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)
  
  if (days > 0) {
    return `${days}天 ${hours}小时 ${minutes}分钟`
  } else if (hours > 0) {
    return `${hours}小时 ${minutes}分钟`
  } else if (minutes > 0) {
    return `${minutes}分钟 ${secs}秒`
  } else {
    return `${secs}秒`
  }
}

// 格式化字节数
const formatBytes = (bytes: number) => {
  if (bytes === 0) return '0 B'
  
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 格式化日期时间
const formatDateTime = (dateTime: string) => {
  return new Date(dateTime).toLocaleString('zh-CN')
}

// 获取内存使用百分比
const getMemoryPercentage = (type: keyof HealthCheckResponse['memory']) => {
  if (!healthData.value || !healthData.value.memory) return 0
  
  const maxMemory = Math.max(
    healthData.value.memory.heapUsed,
    healthData.value.memory.heapTotal,
    healthData.value.memory.external
  )
  
  const memoryValue = healthData.value.memory[type]
  if (typeof memoryValue !== 'number') return 0
  return Math.round((memoryValue / maxMemory) * 100)
}

// 获取堆内存使用百分比
const getHeapUsagePercentage = () => {
  if (!healthData.value || !healthData.value.memory) return 0
  
  return Math.round(
    (healthData.value.memory.heapUsed / healthData.value.memory.heapTotal) * 100
  )
}

// 获取内存使用颜色
const getMemoryColor = (percentage: number) => {
  if (percentage < 50) return '#67c23a'
  if (percentage < 80) return '#e6a23c'
  return '#f56c6c'
}

// 初始化
onMounted(() => {
  fetchHealthData()
  
  // 每30秒自动刷新一次
  setInterval(() => {
    fetchHealthData()
  }, 30000)
})
</script>

<style scoped>
.health-check {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.status-content {
  min-height: 400px;
}

.status-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.status-item {
  text-align: center;
  padding: 20px;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  background: #fafafa;
}

.status-label {
  font-size: 14px;
  color: #909399;
  margin-bottom: 10px;
}

.status-value {
  font-size: 18px;
  font-weight: bold;
  color: #303133;
}

.memory-section {
  margin-top: 30px;
}

.memory-section h3 {
  margin-bottom: 20px;
  color: #303133;
}

.memory-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.memory-item {
  padding: 15px;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  background: #fff;
}

.memory-label {
  font-size: 14px;
  color: #909399;
  margin-bottom: 8px;
}

.memory-value {
  font-size: 16px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 10px;
}

.memory-bar {
  margin-top: 10px;
}

.no-data {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 300px;
}
</style>