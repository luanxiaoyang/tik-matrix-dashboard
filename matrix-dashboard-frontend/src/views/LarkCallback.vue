<template>
  <div class="lark-callback-container">
    <div class="callback-content">
      <div v-if="loading" class="loading-state">
        <el-icon class="loading-icon" :size="40">
          <Loading />
        </el-icon>
        <p>正在处理飞书登录...</p>
      </div>
      
      <div v-else-if="error" class="error-state">
        <el-icon class="error-icon" :size="40">
          <CircleClose />
        </el-icon>
        <p class="error-message">{{ error }}</p>
        <el-button type="primary" @click="redirectToLogin">返回登录</el-button>
      </div>
      
      <div v-else class="success-state">
        <el-icon class="success-icon" :size="40">
          <CircleCheck />
        </el-icon>
        <p>登录成功，正在跳转...</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElIcon, ElButton } from 'element-plus'
import { Loading, CircleClose, CircleCheck } from '@element-plus/icons-vue'
import { larkLogin } from '@/api/auth'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const loading = ref(true)
const error = ref('')

/**
 * 处理Lark OAuth回调
 */
const handleLarkCallback = async () => {
  try {
    const code = route.query.code as string
    
    if (!code) {
      throw new Error('未获取到授权码')
    }
    
    // 调用后端API进行登录
    const response = await larkLogin(code)
    
    // 保存用户信息和令牌
    authStore.setUser(response.data.user)
    authStore.setTokens(response.data.accessToken, response.data.refreshToken)
    
    // 显示成功消息
    ElMessage.success('飞书登录成功')
    
    // 跳转到首页或重定向页面
    const redirect = route.query.redirect as string
    setTimeout(() => {
      router.push(redirect || '/')
    }, 1000)
    
  } catch (err: any) {
    console.error('Lark login error:', err)
    error.value = err.message || '飞书登录失败，请重试'
  } finally {
    loading.value = false
  }
}

/**
 * 返回登录页面
 */
const redirectToLogin = () => {
  router.push('/login')
}

// 组件挂载时处理回调
onMounted(() => {
  handleLarkCallback()
})
</script>

<style scoped>
.lark-callback-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.callback-content {
  background: white;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  text-align: center;
  min-width: 300px;
}

.loading-state,
.error-state,
.success-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.loading-icon {
  color: #409eff;
  animation: rotate 2s linear infinite;
}

.error-icon {
  color: #f56c6c;
}

.success-icon {
  color: #67c23a;
}

.error-message {
  color: #f56c6c;
  margin: 0;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

p {
  margin: 0;
  font-size: 16px;
  color: #606266;
}
</style>