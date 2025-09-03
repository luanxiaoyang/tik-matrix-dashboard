<template>
  <div class="home-container">
    <!-- 欢迎区域 -->
    <div class="welcome-section">
      <el-card class="welcome-card">
        <div class="welcome-content">
          <div class="welcome-text">
            <h2>欢迎回来，{{ authStore.user?.nickname || authStore.user?.username }}！</h2>
            <p>今天是 {{ currentDate }}，祝您工作愉快！</p>
          </div>
          <div class="welcome-avatar">
            <el-avatar :size="80" :src="authStore.user?.avatar">
              {{ authStore.user?.nickname?.[0] || authStore.user?.username?.[0] }}
            </el-avatar>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-section">
      <el-row :gutter="20">
        <el-col :xs="24" :sm="12" :md="6">
          <el-card class="stats-card">
            <div class="stats-content">
              <div class="stats-icon user-icon">
                <el-icon><User /></el-icon>
              </div>
              <div class="stats-info">
                <div class="stats-number">{{ stats.userCount }}</div>
                <div class="stats-label">用户总数</div>
              </div>
            </div>
          </el-card>
        </el-col>
        
        <el-col :xs="24" :sm="12" :md="6">
          <el-card class="stats-card">
            <div class="stats-content">
              <div class="stats-icon role-icon">
                <el-icon><Key /></el-icon>
              </div>
              <div class="stats-info">
                <div class="stats-number">{{ stats.roleCount }}</div>
                <div class="stats-label">角色数量</div>
              </div>
            </div>
          </el-card>
        </el-col>
        
        <el-col :xs="24" :sm="12" :md="6">
          <el-card class="stats-card">
            <div class="stats-content">
              <div class="stats-icon sync-icon">
                <el-icon><Refresh /></el-icon>
              </div>
              <div class="stats-info">
                <div class="stats-number">{{ stats.syncCount }}</div>
                <div class="stats-label">今日同步</div>
              </div>
            </div>
          </el-card>
        </el-col>
        
        <el-col :xs="24" :sm="12" :md="6">
          <el-card class="stats-card">
            <div class="stats-content">
              <div class="stats-icon online-icon">
                <el-icon><CircleCheck /></el-icon>
              </div>
              <div class="stats-info">
                <div class="stats-number">{{ stats.onlineCount }}</div>
                <div class="stats-label">在线用户</div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 快捷操作 -->
    <div class="quick-actions-section">
      <el-card>
        <template #header>
          <div class="card-header">
            <span>快捷操作</span>
          </div>
        </template>
        
        <el-row :gutter="20">
          <el-col :xs="24" :sm="12" :md="6" v-if="authStore.hasPermission('user:create')">
            <div class="quick-action-item" @click="$router.push('/users')">
              <el-icon class="action-icon"><UserFilled /></el-icon>
              <div class="action-text">
                <div class="action-title">用户管理</div>
                <div class="action-desc">管理系统用户</div>
              </div>
            </div>
          </el-col>
          
          <el-col :xs="24" :sm="12" :md="6" v-if="authStore.hasPermission('role:create')">
            <div class="quick-action-item" @click="$router.push('/roles')">
              <el-icon class="action-icon"><Lock /></el-icon>
              <div class="action-text">
                <div class="action-title">角色管理</div>
                <div class="action-desc">配置用户角色</div>
              </div>
            </div>
          </el-col>
          
          <el-col :xs="24" :sm="12" :md="6" v-if="authStore.hasPermission('recharge:sync')">
            <div class="quick-action-item" @click="$router.push('/recharge-sync')">
              <el-icon class="action-icon"><CreditCard /></el-icon>
              <div class="action-text">
                <div class="action-title">充值同步</div>
                <div class="action-desc">同步充值数据</div>
              </div>
            </div>
          </el-col>
          
          <el-col :xs="24" :sm="12" :md="6">
            <div class="quick-action-item" @click="testConnection">
              <el-icon class="action-icon"><Connection /></el-icon>
              <div class="action-text">
                <div class="action-title">连接测试</div>
                <div class="action-desc">测试API连接</div>
              </div>
            </div>
          </el-col>
        </el-row>
      </el-card>
    </div>

    <!-- 最近活动 -->
    <div class="recent-activities-section">
      <el-card>
        <template #header>
          <div class="card-header">
            <span>最近活动</span>
            <el-button type="text" @click="refreshActivities">
              <el-icon><Refresh /></el-icon>
              刷新
            </el-button>
          </div>
        </template>
        
        <el-timeline>
          <el-timeline-item
            v-for="activity in recentActivities"
            :key="activity.id"
            :timestamp="activity.timestamp"
            :type="activity.type"
          >
            {{ activity.content }}
          </el-timeline-item>
        </el-timeline>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '@/stores/auth'
import { testApiConnection } from '@/api/recharge'

const authStore = useAuthStore()

// 当前日期
const currentDate = computed(() => {
  return new Date().toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  })
})

// 统计数据
const stats = reactive({
  userCount: 0,
  roleCount: 0,
  syncCount: 0,
  onlineCount: 0
})

// 最近活动
const recentActivities = ref([
  {
    id: 1,
    content: '系统启动完成',
    timestamp: new Date().toLocaleString(),
    type: 'success'
  },
  {
    id: 2,
    content: '用户登录成功',
    timestamp: new Date(Date.now() - 5 * 60 * 1000).toLocaleString(),
    type: 'primary'
  },
  {
    id: 3,
    content: 'API连接正常',
    timestamp: new Date(Date.now() - 10 * 60 * 1000).toLocaleString(),
    type: 'info'
  }
])

/**
 * 测试API连接
 */
const testConnection = async () => {
  try {
    const response = await testApiConnection()
    if (response.data.success) {
      ElMessage.success('API连接正常')
    } else {
      ElMessage.warning('API连接异常')
    }
  } catch (error) {
    ElMessage.error('API连接失败')
    console.error('API连接测试失败:', error)
  }
}

/**
 * 刷新活动记录
 */
const refreshActivities = () => {
  // 模拟刷新活动记录
  recentActivities.value.unshift({
    id: Date.now(),
    content: '活动记录已刷新',
    timestamp: new Date().toLocaleString(),
    type: 'info'
  })
  ElMessage.success('活动记录已刷新')
}

/**
 * 加载统计数据
 */
const loadStats = async () => {
  // 模拟加载统计数据
  stats.userCount = Math.floor(Math.random() * 1000) + 100
  stats.roleCount = Math.floor(Math.random() * 20) + 5
  stats.syncCount = Math.floor(Math.random() * 50) + 10
  stats.onlineCount = Math.floor(Math.random() * 100) + 20
}

// 组件挂载时加载数据
onMounted(() => {
  loadStats()
})
</script>

<style scoped>
.home-container {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
}

.welcome-section {
  margin: 20px 20px 20px 20px;
}

.welcome-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

:deep(.welcome-card .el-card__body) {
  padding: 30px;
}

.welcome-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.welcome-text h2 {
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 600;
}

.welcome-text p {
  margin: 0;
  opacity: 0.9;
  font-size: 16px;
}

.stats-section {
  margin: 0 20px 20px 20px;
}

.stats-card {
  height: 120px;
}

.stats-content {
  display: flex;
  align-items: center;
  height: 100%;
}

.stats-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  font-size: 24px;
  color: white;
}

.user-icon {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.role-icon {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.sync-icon {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.online-icon {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.stats-info {
  flex: 1;
}

.stats-number {
  font-size: 28px;
  font-weight: 600;
  color: #333;
  line-height: 1;
  margin-bottom: 4px;
}

.stats-label {
  font-size: 14px;
  color: #666;
}

.quick-actions-section {
  margin: 0 20px 20px 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.quick-action-item {
  display: flex;
  align-items: center;
  padding: 20px;
  border: 1px solid #e6e6e6;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  height: 80px;
}

.quick-action-item:hover {
  border-color: #409eff;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.2);
  transform: translateY(-2px);
}

.action-icon {
  font-size: 32px;
  color: #409eff;
  margin-right: 16px;
}

.action-text {
  flex: 1;
}

.action-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
}

.action-desc {
  font-size: 14px;
  color: #666;
}

.recent-activities-section {
  margin: 0 20px 20px 20px;
}

:deep(.el-timeline-item__timestamp) {
  font-size: 12px;
  color: #999;
}

@media (max-width: 768px) {
  .welcome-content {
    flex-direction: column;
    text-align: center;
    gap: 20px;
  }
  
  .stats-section .el-col {
    margin-bottom: 16px;
  }
  
  .quick-action-item {
    margin-bottom: 16px;
  }
}
</style>
