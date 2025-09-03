<template>
  <el-container class="main-layout">
    <!-- 侧边栏 -->
    <el-aside :width="isCollapse ? '64px' : '240px'" class="sidebar">
      <div class="logo">
        <img v-if="!isCollapse" src="/logo.svg" alt="Logo" class="logo-img">
        <span v-if="!isCollapse" class="logo-text">矩阵看板</span>
        <el-icon v-else class="logo-icon"><Grid /></el-icon>
      </div>
      
      <el-menu
        :default-active="activeMenu"
        :collapse="isCollapse"
        :unique-opened="true"
        router
        class="sidebar-menu"
      >
        <template v-for="item in menuItems" :key="item.path">
          <!-- 有子菜单的项 -->
          <el-sub-menu v-if="item.children && item.children.length > 0" :index="item.path">
            <template #title>
              <el-icon><component :is="item.icon" /></el-icon>
              <span>{{ item.title }}</span>
            </template>
            <el-menu-item
              v-for="child in item.children"
              :key="child.path"
              :index="child.path"
            >
              <el-icon><component :is="child.icon" /></el-icon>
              <span>{{ child.title }}</span>
            </el-menu-item>
          </el-sub-menu>
          
          <!-- 单个菜单项 -->
          <el-menu-item v-else :index="item.path">
            <el-icon><component :is="item.icon" /></el-icon>
            <span>{{ item.title }}</span>
          </el-menu-item>
        </template>
      </el-menu>
    </el-aside>
    
    <!-- 主内容区 -->
    <el-container class="main-container">
      <!-- 顶部导航 -->
      <el-header class="header">
        <div class="header-left">
          <el-button
            type="text"
            :icon="isCollapse ? Expand : Fold"
            @click="toggleCollapse"
          />
          
          <el-breadcrumb separator="/" class="breadcrumb">
            <el-breadcrumb-item
              v-for="item in breadcrumbs"
              :key="item.path"
              :to="item.path"
            >
              {{ item.title }}
            </el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        
        <div class="header-right">
          <!-- 用户信息 -->
          <el-dropdown @command="handleUserCommand">
            <div class="user-info">
              <el-avatar :size="32" :src="userStore.userInfo?.avatar">
                <el-icon><User /></el-icon>
              </el-avatar>
              <span class="username">{{ userStore.userInfo?.username }}</span>
              <el-icon class="dropdown-icon"><ArrowDown /></el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">
                  <el-icon><User /></el-icon>
                  个人资料
                </el-dropdown-item>
                <el-dropdown-item command="settings">
                  <el-icon><Setting /></el-icon>
                  系统设置
                </el-dropdown-item>
                <el-dropdown-item divided command="logout">
                  <el-icon><SwitchButton /></el-icon>
                  退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>
      
      <!-- 主内容 -->
      <el-main class="main-content">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Grid,
  Fold,
  Expand,
  User,
  ArrowDown,
  Setting,
  SwitchButton,
  Monitor,
  UserFilled,
  TrendCharts,
  Money,
  Plus,
  List,
  DataAnalysis
} from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'

// 定义菜单项类型
interface MenuItem {
  path: string
  title: string
  icon: any
  children?: MenuItem[]
}

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

// 侧边栏折叠状态
const isCollapse = ref(false)

// 当前激活的菜单
const activeMenu = computed(() => route.path)

// 菜单配置
const menuItems = computed(() => {
  const items: MenuItem[] = [
    {
      path: '/dashboard',
      title: '仪表板',
      icon: Monitor
    }
  ]
  
  // 账号管理菜单
  if (userStore.hasPermission('ACCOUNT_VIEW') || userStore.hasPermission('ACCOUNT_CREATE')) {
    items.push({
      path: '/accounts',
      title: '账号管理',
      icon: UserFilled,
      children: [
        {
          path: '/accounts/list',
          title: '账号列表',
          icon: List
        },
        ...(userStore.hasPermission('ACCOUNT_CREATE') ? [{
          path: '/accounts/create',
          title: '创建账号',
          icon: Plus
        }] : [])
      ]
    })
  }
  
  // 转化管理菜单
  if (userStore.hasPermission('CONVERSION_VIEW') || userStore.hasPermission('CONVERSION_CREATE')) {
    items.push({
      path: '/conversions',
      title: '转化管理',
      icon: TrendCharts,
      children: [
        {
          path: '/conversions/list',
          title: '转化列表',
          icon: List
        },
        ...(userStore.hasPermission('CONVERSION_CREATE') ? [{
          path: '/conversions/create',
          title: '提交转化',
          icon: Plus
        }] : [])
      ]
    })
  }
  
  // 充值特征菜单
  if (userStore.hasPermission('RECHARGE_FEATURE_SYNC') || userStore.hasPermission('RECHARGE_FEATURE_VIEW')) {
    items.push({
      path: '/recharge-features',
      title: '充值特征',
      icon: Money
    })
  }
  
  // 数据分析菜单（所有用户都可以访问）
  items.push({
    path: '/analytics',
    title: '数据分析',
    icon: DataAnalysis
  })
  
  return items
})

// 面包屑导航
const breadcrumbs = computed(() => {
  const matched = route.matched.filter(item => item.meta && item.meta.title)
  const breadcrumbs = matched.map(item => ({
    path: item.path,
    title: item.meta?.title as string
  }))
  
  // 如果没有匹配到，根据路径生成
  if (breadcrumbs.length === 0) {
    const pathSegments = route.path.split('/').filter(Boolean)
    const titleMap: Record<string, string> = {
      dashboard: '仪表板',
      accounts: '账号管理',
      conversions: '转化管理',
      'recharge-features': '充值特征',
      analytics: '数据分析',
      list: '列表',
      create: '创建',
      edit: '编辑',
      detail: '详情'
    }
    
    return pathSegments.map((segment, index) => ({
      path: '/' + pathSegments.slice(0, index + 1).join('/'),
      title: titleMap[segment] || segment
    }))
  }
  
  return breadcrumbs
})

/**
 * 切换侧边栏折叠状态
 */
const toggleCollapse = () => {
  isCollapse.value = !isCollapse.value
}

/**
 * 处理用户下拉菜单命令
 * @param command 命令类型
 */
const handleUserCommand = async (command: string) => {
  switch (command) {
    case 'profile':
      ElMessage.info('个人资料功能开发中')
      break
    case 'settings':
      ElMessage.info('系统设置功能开发中')
      break
    case 'logout':
      try {
        await ElMessageBox.confirm(
          '确定要退出登录吗？',
          '提示',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        )
        
        await userStore.logout()
        ElMessage.success('已退出登录')
        router.push('/login')
      } catch (error) {
        // 用户取消
      }
      break
  }
}

// 监听路由变化，自动展开对应的菜单
watch(
  () => route.path,
  (newPath) => {
    // 如果是子路径，确保父菜单展开
    if (newPath.includes('/accounts/') && isCollapse.value) {
      // 可以在这里添加自动展开逻辑
    }
  }
)
</script>

<style scoped>
.main-layout {
  height: 100vh;
}

.sidebar {
  background: #001529;
  transition: width 0.2s;
  overflow: hidden;
}

.logo {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 16px;
  background: rgba(255, 255, 255, 0.1);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.logo-img {
  width: 32px;
  height: 32px;
  margin-right: 8px;
}

.logo-text {
  color: white;
  font-size: 18px;
  font-weight: 600;
}

.logo-icon {
  color: white;
  font-size: 24px;
}

.sidebar-menu {
  border: none;
  background: transparent;
}

.sidebar-menu :deep(.el-menu-item),
.sidebar-menu :deep(.el-sub-menu__title) {
  color: rgba(255, 255, 255, 0.8);
}

.sidebar-menu :deep(.el-menu-item:hover),
.sidebar-menu :deep(.el-sub-menu__title:hover) {
  background: rgba(255, 255, 255, 0.1) !important;
  color: white;
}

.sidebar-menu :deep(.el-menu-item.is-active) {
  background: #1890ff !important;
  color: white;
}

.main-container {
  display: flex;
  flex-direction: column;
}

.header {
  background: white;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.breadcrumb {
  margin-left: 16px;
}

.header-right {
  display: flex;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s;
}

.user-info:hover {
  background: #f5f5f5;
}

.username {
  font-size: 14px;
  color: #333;
}

.dropdown-icon {
  font-size: 12px;
  color: #999;
}

.main-content {
  background: #f5f5f5;
  overflow-y: auto;
}

/* 页面切换动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    z-index: 1000;
    height: 100vh;
  }
  
  .main-container {
    margin-left: 0;
  }
  
  .header {
    padding: 0 16px;
  }
  
  .breadcrumb {
    display: none;
  }
}
</style>