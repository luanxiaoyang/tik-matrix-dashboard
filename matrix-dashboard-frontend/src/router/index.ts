import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { ElMessage } from 'element-plus'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
      meta: {
        requiresAuth: false,
        title: '登录'
      }
    },
    {
      path: '/',
      name: 'dashboard',
      component: () => import('../views/DashboardView.vue'),
      meta: {
        requiresAuth: true,
        title: '仪表盘'
      },
      children: [
        {
          path: '',
          name: 'home',
          component: () => import('../views/HomeView.vue'),
          meta: {
            title: '首页'
          }
        },
        {
          path: 'users',
          name: 'users',
          component: () => import('../views/UserManagement.vue'),
          meta: {
            title: '用户管理',
            permission: 'user:read'
          }
        },
        {
          path: 'roles',
          name: 'roles',
          component: () => import('../views/RoleManagement.vue'),
          meta: {
            title: '角色管理',
            permission: 'role:read'
          }
        },
        {
          path: 'permissions',
          name: 'permissions',
          component: () => import('../views/PermissionManagement.vue'),
          meta: {
            title: '权限管理',
            permission: 'permission:read'
          }
        },
        {
          path: 'recharge-sync',
          name: 'recharge-sync',
          component: () => import('../views/RechargeSyncView.vue'),
          meta: {
            title: '充值同步',
            permission: 'recharge:read'
          }
        }
      ]
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('../views/NotFound.vue'),
      meta: {
        title: '页面未找到'
      }
    }
  ],
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  
  // 恢复认证状态（如果尚未恢复）
  if (!authStore.isAuthenticated) {
    authStore.restoreAuth()
  }
  
  // 设置页面标题
  if (to.meta.title) {
    document.title = `${to.meta.title} - Matrix Dashboard`
  }
  
  // 检查是否需要认证
  if (to.meta.requiresAuth) {
    if (!authStore.isAuthenticated) {
      ElMessage.warning('请先登录')
      next({ name: 'login', query: { redirect: to.fullPath } })
      return
    }
    
    // 检查权限
    if (to.meta.permission && !authStore.hasPermission(to.meta.permission as string)) {
      ElMessage.error('没有访问权限')
      next({ name: 'home' })
      return
    }
  }
  
  // 如果已登录用户访问登录页，重定向到首页
  if (to.name === 'login' && authStore.isAuthenticated) {
    next({ name: 'home' })
    return
  }
  
  next()
})

export default router
