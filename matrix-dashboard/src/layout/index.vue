<template>
  <div class="layout-container">
    <!-- 顶部导航栏 -->
    <el-header class="layout-header">
      <div class="header-left">
        <h1 class="logo">矩阵看板</h1>
      </div>
      <div class="header-right">
        <el-dropdown @command="handleCommand">
          <span class="user-info">
            <el-icon><User /></el-icon>
            {{ userStore.userInfo?.username || '用户' }}
            <el-icon class="el-icon--right"><arrow-down /></el-icon>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="profile">个人信息</el-dropdown-item>
              <el-dropdown-item command="logout" divided>退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </el-header>

    <el-container class="layout-main">
      <!-- 侧边导航栏 -->
      <el-aside class="layout-aside" :width="isCollapse ? '64px' : '200px'">
        <div class="aside-header">
          <el-button 
            type="text" 
            @click="toggleCollapse"
            class="collapse-btn"
          >
            <el-icon><Fold v-if="!isCollapse" /><Expand v-else /></el-icon>
          </el-button>
        </div>
        <el-menu
          :default-active="$route.path"
          :collapse="isCollapse"
          :unique-opened="true"
          router
          class="layout-menu"
        >
          <el-menu-item index="/dashboard">
            <el-icon><Odometer /></el-icon>
            <template #title>仪表盘</template>
          </el-menu-item>
          <el-menu-item index="/accounts">
            <el-icon><User /></el-icon>
            <template #title>账号管理</template>
          </el-menu-item>
          <el-menu-item index="/conversions">
            <el-icon><TrendCharts /></el-icon>
            <template #title>转化管理</template>
          </el-menu-item>
          <el-menu-item index="/recharge-features">
            <el-icon><CreditCard /></el-icon>
            <template #title>充值特征同步</template>
          </el-menu-item>
          <el-menu-item index="/users" v-permission="'user:read'">
            <el-icon><UserFilled /></el-icon>
            <template #title>用户管理</template>
          </el-menu-item>
          <el-menu-item index="/permissions" v-permission="['role:read', 'permission:read']">
            <el-icon><Lock /></el-icon>
            <template #title>权限管理</template>
          </el-menu-item>
          <el-menu-item index="/health" v-permission="'system:monitor'">
            <el-icon><Monitor /></el-icon>
            <template #title>系统监控</template>
          </el-menu-item>
        </el-menu>
      </el-aside>

      <!-- 主内容区域 -->
      <el-main class="layout-content">
        <div class="content-wrapper">
          <!-- 面包屑导航 -->
          <el-breadcrumb class="breadcrumb" separator="/">
            <el-breadcrumb-item :to="{ path: '/dashboard' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item v-if="$route.meta.title">{{ $route.meta.title }}</el-breadcrumb-item>
          </el-breadcrumb>
          
          <!-- 页面内容 -->
          <div class="page-content">
            <router-view />
          </div>
        </div>
      </el-main>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  User,
  ArrowDown,
  Fold,
  Expand,
  Odometer,
  TrendCharts,
  CreditCard,
  UserFilled,
  Lock,
  Monitor
} from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { successMessage } from '@/utils/message'

// 状态管理
const userStore = useUserStore()
const router = useRouter()

// 侧边栏折叠状态
const isCollapse = ref(false)

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
const handleCommand = (command: string) => {
  switch (command) {
    case 'profile':
      // 跳转到个人信息页面
      router.push('/profile')
      break
    case 'logout':
      // 退出登录
      userStore.logout()
      successMessage('退出登录成功')
      router.push('/login')
      break
  }
}
</script>

<style scoped>
.layout-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.layout-header {
  background: #fff;
  border-bottom: 1px solid #e4e7ed;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  height: 60px;
}

.header-left .logo {
  margin: 0;
  font-size: 20px;
  font-weight: bold;
  color: #409eff;
}

.header-right {
  display: flex;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.user-info:hover {
  background-color: #f5f7fa;
}

.user-info .el-icon {
  margin-right: 4px;
}

.user-info .el-icon--right {
  margin-left: 4px;
  margin-right: 0;
}

.layout-main {
  flex: 1;
  height: calc(100vh - 60px);
}

.layout-aside {
  background: #fff;
  border-right: 1px solid #e4e7ed;
  transition: width 0.3s;
}

.aside-header {
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid #e4e7ed;
}

.collapse-btn {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.layout-menu {
  border-right: none;
  height: calc(100% - 50px);
}

.layout-content {
  background: #f5f7fa;
  padding: 0;
}

.content-wrapper {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.breadcrumb {
  padding: 16px 20px;
  background: #fff;
  border-bottom: 1px solid #e4e7ed;
}

.page-content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .layout-aside {
    position: fixed;
    left: 0;
    top: 60px;
    height: calc(100vh - 60px);
    z-index: 1000;
    transform: translateX(-100%);
    transition: transform 0.3s;
  }
  
  .layout-aside.show {
    transform: translateX(0);
  }
  
  .layout-content {
    margin-left: 0;
  }
  
  .header-left .logo {
    font-size: 16px;
  }
}
</style>