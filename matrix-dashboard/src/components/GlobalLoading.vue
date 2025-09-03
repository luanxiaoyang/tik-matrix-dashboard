<template>
  <teleport to="body">
    <transition name="loading-fade">
      <div v-if="visible" class="global-loading-overlay">
        <div class="loading-content">
          <el-icon class="loading-icon" :size="40">
            <Loading />
          </el-icon>
          <div class="loading-text">{{ text }}</div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { Loading } from '@element-plus/icons-vue'

interface Props {
  visible?: boolean
  text?: string
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  text: '加载中...'
})

// 监听visible变化，防止页面滚动
watch(() => props.visible, (newVal) => {
  if (newVal) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
})
</script>

<style scoped>
.global-loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(2px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.loading-icon {
  color: var(--el-color-primary);
  animation: rotate 2s linear infinite;
}

.loading-text {
  font-size: 14px;
  color: var(--el-text-color-primary);
  font-weight: 500;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.loading-fade-enter-active,
.loading-fade-leave-active {
  transition: opacity 0.3s ease;
}

.loading-fade-enter-from,
.loading-fade-leave-to {
  opacity: 0;
}
</style>