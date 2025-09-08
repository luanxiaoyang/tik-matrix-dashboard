<template>
  <div class="dashboard-container">
    <!-- 侧边栏 -->
    <el-aside :width="isCollapse ? '64px' : '240px'" class="sidebar">
      <div class="logo">
        <h3 v-if="!isCollapse">Matrix Dashboard</h3>
        <h3 v-else>MD</h3>
      </div>
      
      <el-menu
        :default-active="activeMenu"
        :collapse="isCollapse"
        :unique-opened="true"
        router
        class="sidebar-menu"
      >
        <el-menu-item index="/">
          <el-icon><House /></el-icon>
          <template #title>首页</template>
        </el-menu-item>
        
        <el-sub-menu index="user-management" v-if="authStore.hasPermission('user:read')">
          <template #title>
            <el-icon><User /></el-icon>
            <span>用户管理</span>
          </template>
          <el-menu-item index="/users">用户列表</el-menu-item>
        </el-sub-menu>
        
        <el-sub-menu index="rbac-management" v-if="authStore.hasPermission('role:read') || authStore.hasPermission('permission:read')">
          <template #title>
            <el-icon><Key /></el-icon>
            <span>权限管理</span>
          </template>
          <el-menu-item index="/roles" v-if="authStore.hasPermission('role:read')">角色管理</el-menu-item>
          <el-menu-item index="/permissions" v-if="authStore.hasPermission('permission:read')">权限管理</el-menu-item>
        </el-sub-menu>
        
        <el-menu-item index="/tiktok-accounts" v-if="authStore.hasPermission('tiktok:read')">
          <el-icon><VideoCamera /></el-icon>
          <template #title>TikTok账号管理</template>
        </el-menu-item>
        
        <el-menu-item index="/recharge-sync" v-if="authStore.hasPermission('recharge:read')">
          <el-icon><CreditCard /></el-icon>
          <template #title>充值同步</template>
        </el-menu-item>
      </el-menu>
    </el-aside>
    
    <!-- 主内容区 -->
    <el-container class="main-container">
      <!-- 顶部导航栏 -->
      <el-header class="header">
        <div class="header-left">
          <el-button
            type="text"
            @click="toggleCollapse"
            class="collapse-btn"
          >
            <el-icon><Expand v-if="isCollapse" /><Fold v-else /></el-icon>
          </el-button>
          
          <el-breadcrumb separator="/" class="breadcrumb">
            <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item v-if="currentRouteName !== 'home'">{{ currentRouteTitle }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        
        <div class="header-right">
          <!-- 用户信息下拉菜单 -->
          <el-dropdown @command="handleCommand">
            <div class="user-info">
              <el-avatar :size="32" :src="authStore.user?.avatar">
                {{ authStore.user?.nickname?.[0] || authStore.user?.username?.[0] }}
              </el-avatar>
              <span class="username">{{ authStore.user?.nickname || authStore.user?.username }}</span>
              <el-icon><ArrowDown /></el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">
                  <el-icon><User /></el-icon>
                  个人信息
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
        <router-view />
      </el-main>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessageBox } from 'element-plus'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

// 侧边栏折叠状态
const isCollapse = ref(false)

// 当前激活的菜单
const activeMenu = computed(() => route.path)

// 当前路由名称和标题
const currentRouteName = computed(() => route.name as string)
const currentRouteTitle = computed(() => {
  const routeTitleMap: Record<string, string> = {
    users: '用户管理',
    roles: '角色管理',
    permissions: '权限管理',
    'tiktok-accounts': 'TikTok账号管理',
    'recharge-sync': '充值同步'
  }
  return routeTitleMap[currentRouteName.value] || ''
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
const handleCommand = async (command: string) => {
  switch (command) {
    case 'profile':
      // TODO: 打开个人信息弹窗
      // 打开个人信息
      break
    case 'settings':
      // TODO: 打开系统设置
      // 打开系统设置
      break
    case 'logout':
      await handleLogout()
      break
  }
}

/**
 * 处理退出登录
 */
const handleLogout = async () => {
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
    
    await authStore.userLogout()
  } catch {
    // 用户取消退出
    // 用户取消退出登录
  }
}

// 组件挂载时恢复认证状态
onMounted(() => {
  authStore.restoreAuth()
  
  // 如果未登录，跳转到登录页
  if (!authStore.isAuthenticated) {
    router.push('/login')
  }
})
</script>

<style scoped>
.dashboard-container {
  height: 100vh;
  width: 100%;
  display: flex;
  overflow: hidden;
  margin: 0;
  padding: 0;
  position: relative;
}

.sidebar {
  background-color: #304156;
  transition: width 0.3s;
  overflow: hidden;
}

.logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #2b3a4b;
  color: white;
  font-size: 18px;
  font-weight: bold;
}

.sidebar-menu {
  border: none;
  background-color: #304156;
}

:deep(.el-menu-item) {
  color: #bfcbd9;
}

:deep(.el-menu-item:hover) {
  background-color: #263445 !important;
  color: #409eff;
}

:deep(.el-menu-item.is-active) {
  background-color: #409eff !important;
  color: white;
}

:deep(.el-sub-menu__title) {
  color: #bfcbd9;
}

:deep(.el-sub-menu__title:hover) {
  background-color: #263445 !important;
  color: #409eff;
}

.main-container {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.header {
  background-color: white;
  border-bottom: 1px solid #e6e6e6;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  height: 60px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 20px;
}

.collapse-btn {
  font-size: 18px;
  color: #666;
}

.breadcrumb {
  font-size: 14px;
}

.header-right {
  display: flex;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 6px;
  transition: background-color 0.3s;
}

.user-info:hover {
  background-color: #f5f5f5;
}

.username {
  font-size: 14px;
  color: #333;
  font-weight: 500;
}

.main-content {
  background-color: #f5f5f5;
  padding: 0;
  overflow-y: auto;
  height: calc(100vh - 60px);
}
</style>