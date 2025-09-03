<template>
  <el-dialog
    v-model="dialogVisible"
    :title="isEdit ? '编辑权限' : '新增权限'"
    width="600px"
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
    >
      <el-form-item label="权限名称" prop="name">
        <el-input
          v-model="formData.name"
          placeholder="请输入权限名称"
        />
      </el-form-item>
      
      <el-form-item label="权限代码" prop="code">
        <el-input
          v-model="formData.code"
          placeholder="请输入权限代码，如：user:create"
          :disabled="isEdit"
        />
      </el-form-item>
      
      <el-form-item label="权限类型" prop="type">
        <el-select v-model="formData.type" placeholder="请选择权限类型">
          <el-option label="菜单" value="menu" />
          <el-option label="按钮" value="button" />
          <el-option label="接口" value="api" />
        </el-select>
      </el-form-item>
      
      <el-form-item label="父级权限" prop="parentId">
        <el-tree-select
          v-model="formData.parentId"
          :data="parentPermissions"
          :props="treeProps"
          placeholder="请选择父级权限（可选）"
          clearable
          check-strictly
          :render-after-expand="false"
        />
      </el-form-item>
      
      <el-form-item label="资源路径" prop="resource">
        <el-input
          v-model="formData.resource"
          placeholder="请输入资源路径，如：GET:/api/users"
        />
      </el-form-item>
      
      <el-form-item label="描述" prop="description">
        <el-input
          v-model="formData.description"
          type="textarea"
          :rows="3"
          placeholder="请输入权限描述"
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
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { createPermission, updatePermission, getPermissionTree } from '@/api/rbac'
import type { Permission } from '@/types/rbac'

interface Props {
  visible: boolean
  permissionData?: Permission | null
}

interface Emits {
  (e: 'update:visible', value: boolean): void
  (e: 'success'): void
}

const props = withDefaults(defineProps<Props>(), {
  permissionData: null
})

const emit = defineEmits<Emits>()

// 对话框显示状态
const dialogVisible = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value)
})

// 是否编辑模式
const isEdit = computed(() => !!props.permissionData)

// 表单引用
const formRef = ref<FormInstance>()
const loading = ref(false)

// 父级权限数据
const parentPermissions = ref<Permission[]>([])

// 树形选择器配置
const treeProps = {
  children: 'children',
  label: 'name',
  value: 'id'
}

// 表单数据
const formData = reactive({
  name: '',
  code: '',
  type: 'menu' as 'menu' | 'button' | 'api',
  parentId: null as number | null,
  resource: '',
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
    { required: true, message: '请输入权限名称', trigger: 'blur' },
    { min: 2, max: 50, message: '权限名称长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  code: [
    { required: true, message: '请输入权限代码', trigger: 'blur' },
    { min: 2, max: 100, message: '权限代码长度在 2 到 100 个字符', trigger: 'blur' },
    { pattern: /^[a-zA-Z][a-zA-Z0-9:_-]*$/, message: '权限代码只能包含字母、数字、冒号、下划线和连字符，且以字母开头', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择权限类型', trigger: 'change' }
  ],
  sort: [
    { required: true, message: '请输入排序值', trigger: 'blur' }
  ]
}

// 监听权限数据变化
watch(
  () => props.permissionData,
  (permissionData) => {
    if (permissionData) {
      Object.assign(formData, {
        name: permissionData.name,
        code: permissionData.code,
        type: permissionData.type,
        parentId: permissionData.parentId || null,
        resource: '',
        description: permissionData.description || '',
        status: permissionData.status || 'active'
      })
    } else {
      resetForm()
    }
  },
  { immediate: true }
)

// 获取父级权限列表
const fetchParentPermissions = async () => {
  try {
    const response = await getPermissionTree()
    if (response.data.code === 200) {
      parentPermissions.value = response.data.data || []
    }
  } catch (error) {
    console.error('获取父级权限失败:', error)
  }
}

// 重置表单
const resetForm = () => {
  Object.assign(formData, {
    name: '',
    code: '',
    type: 'menu' as 'menu' | 'button' | 'api',
    parentId: null,
    resource: '',
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
    
    const submitData = {
        name: formData.name,
        code: formData.code,
        type: formData.type,
        parentId: formData.parentId || undefined,
        resource: formData.resource,
        description: formData.description,
        status: formData.status,
        sort: 0
      }
    
    if (isEdit.value) {
      // 更新权限
      await updatePermission(props.permissionData!.id, submitData)
      ElMessage.success('更新成功')
    } else {
      // 创建权限
      await createPermission(submitData)
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

// 初始化
onMounted(() => {
  fetchParentPermissions()
})
</script>

<style scoped>
.dialog-footer {
  text-align: right;
}
</style>