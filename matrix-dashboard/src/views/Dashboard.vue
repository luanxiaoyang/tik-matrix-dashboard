<template>
  <div class="dashboard">
    <div class="page-header">
      <h1>仪表板</h1>
      <p>欢迎使用矩阵看板管理系统</p>
    </div>
    
    <!-- 统计卡片 -->
    <div class="stats-grid">
      <el-card class="stat-card">
        <div class="stat-content">
          <div class="stat-icon accounts">
            <el-icon><User /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.totalAccounts }}</div>
            <div class="stat-label">总账号数</div>
          </div>
        </div>
      </el-card>
      
      <el-card class="stat-card">
        <div class="stat-content">
          <div class="stat-icon conversions">
            <el-icon><TrendCharts /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.totalConversions }}</div>
            <div class="stat-label">总转化数</div>
          </div>
        </div>
      </el-card>
      
      <el-card class="stat-card">
        <div class="stat-content">
          <div class="stat-icon recharge">
            <el-icon><Money /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.totalRecharge }}</div>
            <div class="stat-label">总充值金额</div>
          </div>
        </div>
      </el-card>
      
      <el-card class="stat-card">
        <div class="stat-content">
          <div class="stat-icon active">
            <el-icon><CircleCheck /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.activeUsers }}</div>
            <div class="stat-label">活跃用户</div>
          </div>
        </div>
      </el-card>
    </div>
    
    <!-- 快捷操作 -->
    <div class="quick-actions">
      <h2>快捷操作</h2>
      <div class="actions-grid">
        <el-card 
          v-for="action in quickActions" 
          :key="action.key"
          class="action-card"
          :class="{ disabled: !action.enabled }"
          @click="handleQuickAction(action)"
        >
          <div class="action-content">
            <div class="action-icon">
              <el-icon><component :is="action.icon" /></el-icon>
            </div>
            <div class="action-info">
              <div class="action-title">{{ action.title }}</div>
              <div class="action-desc">{{ action.description }}</div>
            </div>
          </div>
        </el-card>
      </div>
    </div>
    
    <!-- 最近活动 -->
    <div class="recent-activities">
      <h2>最近活动</h2>
      <el-card>
        <el-timeline>
          <el-timeline-item
            v-for="activity in recentActivities"
            :key="activity.id"
            :timestamp="activity.timestamp"
            :type="activity.type"
          >
            <div class="activity-content">
              <div class="activity-title">{{ activity.title }}</div>
              <div class="activity-desc">{{ activity.description }}</div>
            </div>
          </el-timeline-item>
        </el-timeline>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { 
  User, 
  TrendCharts, 
  Money, 
  CircleCheck,
  Plus,
  DataAnalysis,
  Refresh,
  Setting
} from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

// 统计数据
const stats = ref({
  totalAccounts: 0,
  totalConversions: 0,
  totalRecharge: '0.00',
  activeUsers: 0
})

// 快捷操作配置
const quickActions = computed(() => [
  {
    key: 'create-account',
    title: '创建账号',
    description: '添加新的Telegram账号',
    icon: Plus,
    enabled: userStore.hasPermission('ACCOUNT_CREATE'),
    route: '/accounts/create'
  },
  {
    key: 'submit-conversion',
    title: '提交用户',
    description: '提交新的用户数据',
    icon: TrendCharts,
    enabled: userStore.hasPermission('CONVERSION_CREATE'),
    route: '/conversions/create'
  },
  {
    key: 'sync-recharge',
    title: '同步充值特征',
    description: '批量同步用户充值数据',
    icon: Refresh,
    enabled: userStore.hasPermission('RECHARGE_FEATURE_SYNC'),
    route: '/recharge-features'
  },
  {
    key: 'data-analysis',
    title: '数据分析',
    description: '查看转化和充值统计',
    icon: DataAnalysis,
    enabled: true,
    route: '/analytics'
  }
])

// 最近活动
const recentActivities = ref([
  {
    id: 1,
    title: '账号创建',
    description: '用户 admin 创建了账号 @test_account',
    timestamp: '2024-01-15 14:30',
    type: 'success'
  },
  {
    id: 2,
    title: '转化提交',
    description: '用户 converter 提交了转化记录 #12345',
    timestamp: '2024-01-15 13:45',
    type: 'primary'
  },
  {
    id: 3,
    title: '充值同步',
    description: '批量同步了 50 个用户的充值特征',
    timestamp: '2024-01-15 12:20',
    type: 'info'
  },
  {
    id: 4,
    title: '权限变更',
    description: '用户 operator 的权限已更新',
    timestamp: '2024-01-15 11:10',
    type: 'warning'
  }
])

/**
 * 加载统计数据
 */
const loadStats = async () => {
  try {
    // 模拟加载统计数据
    stats.value = {
      totalAccounts: 156,
      totalConversions: 2340,
      totalRecharge: '45,678.90',
      activeUsers: 89
    }
  } catch (error) {
    console.error('加载统计数据失败:', error)
  }
}

/**
 * 处理快捷操作点击
 * @param action 操作配置
 */
const handleQuickAction = (action: any) => {
  if (!action.enabled) {
    ElMessage.warning('您没有权限执行此操作')
    return
  }
  
  if (action.route) {
    router.push(action.route)
  }
}

onMounted(() => {
  loadStats()
})
</script>

<style scoped>
.dashboard {
  padding: 20px;
}

.page-header {
  margin-bottom: 30px;
}

.page-header h1 {
  font-size: 28px;
  color: #333;
  margin: 0 0 8px 0;
}

.page-header p {
  color: #666;
  margin: 0;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
}

.stat-card {
  cursor: default;
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: white;
}

.stat-icon.accounts {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.stat-icon.conversions {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.stat-icon.recharge {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.stat-icon.active {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
}

.stat-label {
  color: #666;
  font-size: 14px;
}

.quick-actions {
  margin-bottom: 40px;
}

.quick-actions h2 {
  font-size: 20px;
  color: #333;
  margin: 0 0 20px 0;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
}

.action-card {
  cursor: pointer;
  transition: all 0.2s;
}

.action-card:hover:not(.disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.action-card.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.action-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.action-icon {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  background: #f0f2f5;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: #666;
}

.action-info {
  flex: 1;
}

.action-title {
  font-size: 16px;
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
}

.action-desc {
  color: #666;
  font-size: 14px;
}

.recent-activities h2 {
  font-size: 20px;
  color: #333;
  margin: 0 0 20px 0;
}

.activity-content {
  padding-left: 8px;
}

.activity-title {
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
}

.activity-desc {
  color: #666;
  font-size: 14px;
}

@media (max-width: 768px) {
  .dashboard {
    padding: 16px;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .actions-grid {
    grid-template-columns: 1fr;
  }
}
</style>