<template>
  <el-dialog
    :model-value="visible"
    @update:model-value="updateVisible"
    :title="title"
    :width="width"
    :close-on-click-modal="false"
    :close-on-press-escape="true"
    :show-close="true"
    @close="handleCancel"
  >
    <div class="confirm-content">
      <div class="confirm-icon">
        <el-icon :size="48" :color="iconColor">
          <component :is="iconComponent" />
        </el-icon>
      </div>
      <div class="confirm-message">
        {{ message }}
      </div>
      <div v-if="detail" class="confirm-detail">
        {{ detail }}
      </div>
    </div>
    
    <template #footer>
      <div class="dialog-footer">
        <el-button 
          @click="handleCancel"
          :disabled="loading"
        >
          {{ cancelText }}
        </el-button>
        <el-button 
          :type="confirmType"
          @click="handleConfirm"
          :loading="loading"
        >
          {{ confirmText }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { 
  QuestionFilled, 
  WarningFilled, 
  InfoFilled, 
  CircleCheckFilled,
  CircleCloseFilled
} from '@element-plus/icons-vue'

type DialogType = 'info' | 'success' | 'warning' | 'error' | 'confirm'
type ButtonType = 'primary' | 'success' | 'warning' | 'danger' | 'info'

interface Props {
  visible?: boolean
  type?: DialogType
  title?: string
  message?: string
  detail?: string
  confirmText?: string
  cancelText?: string
  width?: string
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  type: 'confirm',
  title: '确认操作',
  message: '确定要执行此操作吗？',
  detail: '',
  confirmText: '确定',
  cancelText: '取消',
  width: '420px',
  loading: false
})

const emit = defineEmits<{
  'update:visible': [value: boolean]
  'confirm': []
  'cancel': []
}>()

// 计算图标组件
const iconComponent = computed(() => {
  const iconMap = {
    info: InfoFilled,
    success: CircleCheckFilled,
    warning: WarningFilled,
    error: CircleCloseFilled,
    confirm: QuestionFilled
  }
  return iconMap[props.type]
})

// 计算图标颜色
const iconColor = computed(() => {
  const colorMap = {
    info: 'var(--el-color-info)',
    success: 'var(--el-color-success)',
    warning: 'var(--el-color-warning)',
    error: 'var(--el-color-danger)',
    confirm: 'var(--el-color-warning)'
  }
  return colorMap[props.type]
})

// 计算确认按钮类型
const confirmType = computed((): ButtonType => {
  const typeMap: Record<DialogType, ButtonType> = {
    info: 'info',
    success: 'success',
    warning: 'warning',
    error: 'danger',
    confirm: 'primary'
  }
  return typeMap[props.type]
})

// 处理确认
const handleConfirm = () => {
  emit('confirm')
}

// 处理取消
const handleCancel = () => {
  emit('update:visible', false)
  emit('cancel')
}

// 处理 model-value 更新
const updateVisible = (value: boolean) => {
  emit('update:visible', value)
}
</script>

<style scoped>
.confirm-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 20px 0;
}

.confirm-icon {
  margin-bottom: 16px;
}

.confirm-message {
  font-size: 16px;
  font-weight: 500;
  color: var(--el-text-color-primary);
  margin-bottom: 8px;
  line-height: 1.5;
}

.confirm-detail {
  font-size: 14px;
  color: var(--el-text-color-secondary);
  line-height: 1.5;
  max-width: 300px;
}

.dialog-footer {
  display: flex;
  justify-content: center;
  gap: 12px;
}

:deep(.el-dialog__header) {
  text-align: center;
  padding-bottom: 0;
}

:deep(.el-dialog__body) {
  padding: 20px 24px;
}

:deep(.el-dialog__footer) {
  padding: 0 24px 24px;
}
</style>