<template>
  <el-dialog
    v-model="dialogVisible"
    :title="isEdit ? '编辑用户' : '新增用户'"
    width="600px"
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="80px"
    >
      <el-form-item label="用户名" prop="username">
        <el-input
          v-model="formData.username"
          placeholder="请输入用户名"
          :disabled="isEdit"
        />
      </el-form-item>
      
      <el-form-item label="邮箱" prop="email">
        <el-input
          v-model="formData.email"
          placeholder="请输入邮箱"
          type="email"
        />
      </el-form-item>
      
      <el-form-item label="密码" prop="password" v-if="!isEdit">
        <el-input
          v-model="formData.password"
          placeholder="请输入密码"
          type="password"
          show-password
        />
      </el-form-item>
      
      <el-form-item label="昵称" prop="nickname">
        <el-input
          v-model="formData.nickname"
          placeholder="请输入昵称"
        />
      </el-form-item>
      
      <el-form-item label="头像" prop="avatar">
        <el-input
          v-model="formData.avatar"
          placeholder="请输入头像URL"
        />
      </el-form-item>
      
      <el-form-item label="状态" prop="status">
        <el-select v-model="formData.status" placeholder="请选择状态">
          <el-option label="激活" value="active" />
          <el-option label="禁用" value="inactive" />
          <el-option label="封禁" value="banned" />
        </el-select>
      </el-form-item>
      
      <el-form-item label="角色" prop="roleIds">
        <el-select
          v-model="formData.roleIds"
          multiple
          placeholder="请选择角色"
          style="width: 100%"
        >
          <el-option
            v-for="role in roleList"
            :key="role.id"
            :label="role.name"
            :value="role.id"
          />
        </el-select>
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
import { createUser, updateUser, assignUserRoles } from '@/api/users'
import { getRoleList } from '@/api/rbac'
import type { UserInfo } from '@/types/auth'
import type { Role } from '@/types/rbac'

interface Props {
  visible: boolean
  userData?: UserInfo | null
}

interface Emits {
  (e: 'update:visible', value: boolean): void
  (e: 'success'): void
}

const props = withDefaults(defineProps<Props>(), {
  userData: null
})

const emit = defineEmits<Emits>()

// 对话框显示状态
const dialogVisible = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value)
})

// 是否编辑模式
const isEdit = computed(() => !!props.userData)

// 表单引用
const formRef = ref<FormInstance>()
const loading = ref(false)

// 角色列表
const roleList = ref<Role[]>([])

// 表单数据
const formData = reactive({
  username: '',
  email: '',
  password: '',
  nickname: '',
  avatar: '',
  status: 'active',
  roleIds: [] as number[]
})

// 表单验证规则
const formRules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' }
  ],
  status: [
    { required: true, message: '请选择状态', trigger: 'change' }
  ]
}

// 监听用户数据变化
watch(
  () => props.userData,
  (userData) => {
    if (userData) {
      Object.assign(formData, {
        username: userData.username,
        email: userData.email,
        password: '',
        nickname: userData.nickname || '',
        avatar: userData.avatar || '',
        status: userData.status,
        roleIds: userData.roles?.map(role => role.id) || []
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
    username: '',
    email: '',
    password: '',
    nickname: '',
    avatar: '',
    status: 'active',
    roleIds: []
  })
  formRef.value?.clearValidate()
}

// 获取角色列表
const fetchRoleList = async () => {
  try {
    const response = await getRoleList({ page: 1, limit: 100 })
    if (response.data.code === 200) {
      roleList.value = response.data.data.items || []
    }
  } catch (error) {
    console.error('获取角色列表失败:', error)
  }
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    const valid = await formRef.value.validate()
    if (!valid) return
    
    loading.value = true
    
    if (isEdit.value) {
      // 更新用户
      await updateUser(props.userData!.id, {
        email: formData.email,
        nickname: formData.nickname,
        avatar: formData.avatar,
        status: formData.status as any
      })
      
      // 分配角色
      if (formData.roleIds.length > 0) {
        await assignUserRoles(props.userData!.id, {
          roleIds: formData.roleIds
        })
      }
      
      ElMessage.success('更新成功')
    } else {
      // 创建用户
      const response = await createUser({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        nickname: formData.nickname,
        avatar: formData.avatar,
        status: formData.status as any
      })
      
      // 分配角色
      if (formData.roleIds.length > 0 && response.data.data) {
        await assignUserRoles(response.data.data.id, {
          roleIds: formData.roleIds
        })
      }
      
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
  fetchRoleList()
})
</script>

<style scoped>
.dialog-footer {
  text-align: right;
}
</style>