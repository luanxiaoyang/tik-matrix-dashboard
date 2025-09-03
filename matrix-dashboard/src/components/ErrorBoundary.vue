<template>
  <div v-if="hasError" class="error-boundary">
    <el-result
      icon="error"
      title="页面出现错误"
      :sub-title="errorMessage"
    >
      <template #extra>
        <el-button type="primary" @click="handleReload">
          重新加载
        </el-button>
        <el-button @click="handleGoBack">
          返回上页
        </el-button>
      </template>
    </el-result>
  </div>
  <slot v-else />
</template>

<script setup lang="ts">
import { ref, onErrorCaptured } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

const router = useRouter()
const hasError = ref(false)
const errorMessage = ref('')

// 捕获子组件错误
onErrorCaptured((error: Error, instance, info) => {
  console.error('ErrorBoundary caught an error:', error, info)
  hasError.value = true
  errorMessage.value = error.message || '未知错误'
  
  // 可以在这里上报错误到监控系统
  // reportError(error, instance, info)
  
  return false // 阻止错误继续传播
})

// 重新加载页面
const handleReload = () => {
  hasError.value = false
  errorMessage.value = ''
  window.location.reload()
}

// 返回上一页
const handleGoBack = () => {
  hasError.value = false
  errorMessage.value = ''
  router.go(-1)
}

// 重置错误状态
const resetError = () => {
  hasError.value = false
  errorMessage.value = ''
}

// 暴露重置方法
defineExpose({
  resetError
})
</script>

<style scoped>
.error-boundary {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  padding: 20px;
}
</style>