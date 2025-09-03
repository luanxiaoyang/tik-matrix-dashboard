import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { UserRole } from '@/types/auth'
import '@/types/router'

// 路由配置
const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: {
      title: '登录',
      requiresAuth: false
    }
  },
  {
    path: '/',
    name: 'Layout',
    component: () => import('@/layout/index.vue'),
    redirect: '/dashboard',
    meta: {
      requiresAuth: true
    },
    children: [
      {
        path: '/dashboard',
        name: 'Dashboard',
        component: () => import('@/views/Dashboard.vue'),
        meta: {
          title: '仪表板',
          icon: 'Odometer'
        }
      },
      {
        path: '/accounts',
        name: 'Accounts',
        component: () => import('@/views/accounts/index.vue'),
        meta: {
          title: '账号管理',
          icon: 'User',
          roles: [UserRole.SUPER_ADMIN, UserRole.CONVERSION_ADMIN, UserRole.OPERATOR]
        }
      },
      {
        path: '/accounts/create',
        name: 'AccountCreate',
        component: () => import('@/views/accounts/AccountCreate.vue'),
        meta: {
          title: '创建账号',
          requiresAuth: true,
          permissions: ['account:create']
        }
      },
      {
        path: '/accounts/detail/:id',
        name: 'AccountDetail',
        component: () => import('@/views/accounts/AccountDetail.vue'),
        meta: {
          title: '账号详情',
          requiresAuth: true,
          permissions: ['account:view']
        }
      },
      {
        path: '/accounts/edit/:id',
        name: 'AccountEdit',
        component: () => import('@/views/accounts/AccountEdit.vue'),
        meta: {
          title: '编辑账号',
          requiresAuth: true,
          permissions: ['account:edit']
        }
      },
      {
        path: '/conversions',
        name: 'Conversions',
        component: () => import('@/views/conversions/index.vue'),
        meta: {
          title: '转化管理',
          icon: 'TrendCharts',
          roles: [UserRole.SUPER_ADMIN, UserRole.CONVERSION_ADMIN, UserRole.CONVERTER]
        }
      },
      {
        path: '/conversions/create',
        name: 'ConversionCreate',
        component: () => import('@/views/conversions/ConversionCreate.vue'),
        meta: {
          title: '提交转化',
          requiresAuth: true,
          permissions: ['conversion:create']
        }
      },
      {
        path: '/conversions/detail/:id',
        name: 'ConversionDetail',
        component: () => import('@/views/conversions/ConversionDetail.vue'),
        meta: {
          title: '转化详情',
          requiresAuth: true,
          permissions: ['conversion:view']
        }
      },
      {
        path: '/recharge-features',
        name: 'RechargeFeatures',
        component: () => import('@/views/recharge-features/index.vue'),
        meta: {
          title: '充值特征同步',
          icon: 'CreditCard',
          roles: [UserRole.SUPER_ADMIN, UserRole.CONVERSION_ADMIN]
        }
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/404.vue'),
    meta: {
      title: '页面不存在'
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore()
  
  // 设置页面标题
  if (to.meta.title) {
    document.title = `${to.meta.title} - 矩阵看板管理系统`
  }
  
  // 检查是否需要登录
  if (to.meta.requiresAuth !== false) {
    if (!userStore.token) {
      next('/login')
      return
    }
    
    // 获取用户信息
    if (!userStore.userInfo) {
      try {
        await userStore.getUserInfo()
      } catch (error) {
        userStore.logout()
        next('/login')
        return
      }
    }
    
    // 检查权限
    if (to.meta.roles && to.meta.roles.length > 0) {
      if (!userStore.userInfo?.role || !to.meta.roles.includes(userStore.userInfo.role)) {
        next('/dashboard')
        return
      }
    }
  }
  
  // 已登录用户访问登录页，重定向到首页
  if (to.path === '/login' && userStore.token) {
    next('/dashboard')
    return
  }
  
  next()
})

export default router