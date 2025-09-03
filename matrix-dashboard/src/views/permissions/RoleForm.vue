<template>
  <el-dialog
    v-model="dialogVisible"
    :title="isEdit ? '编辑角色' : '新增角色'"
    width="500px"
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="80px"
    >
      <el-form-item label="角色名称" prop="name">
        <el-input
          v-model="formData.name"
          placeholder="请输入角色名称"
        />
      </el-form-item>
      
      <el-form-item label="角色代码" prop="code">
        <el-input
          v-model="formData.code"
          placeholder="请输入角色代码"
          :disabled="isEdit"
        />
      </el-form-item>
      
      <el-form-item label="描述" prop="description">
        <el-input
          v-model="formData.description"
          type="textarea"
          :rows="3"
          placeholder="请输入角色描述"
        />
      </el-form-item>
      
      <el-form-item label="状态" prop="status">
      <el-switch
        v-model="statusActive"
        active-text="启用"
        inactive-text="禁用"
      />
    </el-form-item>
      
      <el-form-item label="排序" prop="sort">
        <el-input-number
          v-model="formData.sort"
          :min="0"
          :max="999"
          placeholder="请输入排序值"
        />
      </el-form-item>
    </el-form>
    
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="loading">
          {{ isEdit ? '更新' : '创建' }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { createRole, updateRole } from '@/api/rbac'
import type { Role } from '@/types/rbac'

interface Props {
  visible: boolean
  roleData?: Role | null
}

interface Emits {
  (e: 'update:visible', value: boolean): void
  (e: 'success'): void
}

const props = withDefaults(defineProps<Props>(), {
  roleData: null
})

const emit = defineEmits<Emits>()

// 对话框显示状态
const dialogVisible = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value)
})

// 是否编辑模式
const isEdit = computed(() => !!props.roleData)

// 表单引用
const formRef = ref<FormInstance>()
const loading = ref(false)

// 表单数据
const formData = reactive({
  name: '',
  code: '',
  description: '',
  status: 'active' as 'active' | 'inactive',
  sort: 0
})

// 状态开关计算属性
const statusActive = computed({
  get: () => formData.status === 'active',
  set: (value: boolean) => {
    formData.status = value ? 'active' : 'inactive'
  }
})

// 表单验证规则
const formRules: FormRules = {
  name: [
    { required: true, message: '请输入角色名称', trigger: 'blur' },
    { min: 2, max: 50, message: '角色名称长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  code: [
    { required: true, message: '请输入角色代码', trigger: 'blur' },
    { min: 2, max: 50, message: '角色代码长度在 2 到 50 个字符', trigger: 'blur' },
    { pattern: /^[a-zA-Z][a-zA-Z0-9_]*$/, message: '角色代码只能包含字母、数字和下划线，且以字母开头', trigger: 'blur' }
  ],
  sort: [
    { required: true, message: '请输入排序值', trigger: 'blur' }
  ]
}

// 监听角色数据变化
watch(
  () => props.roleData,
  (roleData) => {
    if (roleData) {
      Object.assign(formData, {
        name: roleData.name,
        code: roleData.code,
        description: roleData.description || '',
        status: roleData.status || 'active'
      })
    } else {
      resetForm()
    }
  },
  { immediate: true }
)

// 重置表单
const resetForm = () => {
  Object.assign(formData, {
    name: '',
    code: '',
    description: '',
    status: 'active' as 'active' | 'inactive',
    sort: 0
  })
  formRef.value?.clearValidate()
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    const valid = await formRef.value.validate()
    if (!valid) return
    
    loading.value = true
    
    if (isEdit.value) {
      // 更新角色
      await updateRole(props.roleData!.id, {
        name: formData.name,
        description: formData.description,
        status: formData.status
      })
      
      ElMessage.success('更新成功')
    } else {
      // 创建角色
      await createRole({
        name: formData.name,
        code: formData.code,
        description: formData.description,
        status: formData.status
      })
      
      ElMessage.success('创建成功')
    }
    
    emit('success')
  } catch (error: any) {
    ElMessage.error(error.message || '操作失败')
  } finally {
    loading.value = false
  }
}

// 关闭对话框
const handleClose = () => {
  dialogVisible.value = false
  resetForm()
}
</script>

<style scoped>
.dialog-footer {
  text-align: right;
}
</style>