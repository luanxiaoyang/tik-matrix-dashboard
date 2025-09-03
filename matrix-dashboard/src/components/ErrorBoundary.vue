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
/**
 * @component ErrorBoundary
 * @description 错误边界组件，用于捕获和处理子组件中的JavaScript错误
 * 
 * @remarks
 * 该组件实现了Vue 3的错误边界模式，主要功能：
 * 1. 捕获子组件树中的所有JavaScript错误
 * 2. 显示友好的错误提示界面，防止整个应用崩溃
 * 3. 提供错误恢复机制（重新加载、返回上页）
 * 4. 预留错误上报接口，可集成监控系统
 * 
 * @example
 * <ErrorBoundary>
 *   <YourComponent />
 * </ErrorBoundary>
 */

import { ref, onErrorCaptured } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

const router = useRouter()

// 错误状态管理
const hasError = ref(false)
const errorMessage = ref('')

/**
 * 捕获子组件树中的所有JavaScript错误
 * @param error - 捕获到的错误对象
 * @param instance - 触发错误的组件实例
 * @param info - 错误来源信息
 * @returns false - 阻止错误继续向上传播
 */
onErrorCaptured((error: Error, instance, info) => {
  console.error('ErrorBoundary caught an error:', error, info)
  hasError.value = true
  errorMessage.value = error.message || '未知错误'
  
  // 可以在这里上报错误到监控系统
  // reportError(error, instance, info)
  
  return false // 阻止错误继续传播
})

/**
 * 重新加载页面
 * @description 重置错误状态并刷新整个页面
 */
const handleReload = () => {
  hasError.value = false
  errorMessage.value = ''
  window.location.reload()
}

/**
 * 返回上一页
 * @description 重置错误状态并导航回上一个路由页面
 */
const handleGoBack = () => {
  hasError.value = false
  errorMessage.value = ''
  router.go(-1)
}

/**
 * 重置错误状态
 * @description 手动清除错误状态，恢复组件正常渲染
 */
const resetError = () => {
  hasError.value = false
  errorMessage.value = ''
}

// 暴露可从父组件调用的方法
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