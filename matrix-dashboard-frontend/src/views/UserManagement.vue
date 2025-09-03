<template>
  <div class="user-management">
    <!-- 页面标题和操作按钮 -->
    <div class="page-header">
      <div class="header-left">
        <h2>用户管理</h2>
        <p>管理系统用户账户和权限</p>
      </div>
      <div class="header-right">
        <el-button type="primary" @click="showCreateDialog" v-if="authStore.hasPermission('user:create')">
          <el-icon><Plus /></el-icon>
          新增用户
        </el-button>
      </div>
    </div>

    <!-- 搜索和筛选 -->
    <el-card class="search-card">
      <el-form :model="searchForm" inline>
        <el-form-item label="用户名">
          <el-input
            v-model="searchForm.username"
            placeholder="请输入用户名"
            clearable
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input
            v-model="searchForm.email"
            placeholder="请输入邮箱"
            clearable
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable>
            <el-option label="启用" value="active" />
            <el-option label="禁用" value="inactive" />
            <el-option label="封禁" value="banned" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
          <el-button @click="handleReset">
            <el-icon><Refresh /></el-icon>
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 用户列表 -->
    <el-card class="table-card">
      <el-table
        :data="userList"
        v-loading="loading"
        stripe
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column label="头像" width="80">
          <template #default="{ row }">
            <el-avatar :size="40" :src="row.avatar">
              {{ row.nickname?.[0] || row.username?.[0] }}
            </el-avatar>
          </template>
        </el-table-column>
        <el-table-column prop="username" label="用户名" min-width="120" />
        <el-table-column prop="nickname" label="昵称" min-width="120" />
        <el-table-column prop="email" label="邮箱" min-width="180" />
        <el-table-column label="角色" min-width="150">
          <template #default="{ row }">
            <el-tag
              v-for="role in row.roles"
              :key="role.id"
              type="info"
              size="small"
              class="role-tag"
            >
              {{ role.name }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : 'danger'">
              {{ row.status === 'active' ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button
              type="primary"
              size="small"
              @click="showEditDialog(row)"
              v-if="authStore.hasPermission('user:update')"
            >
              编辑
            </el-button>
            <el-button
              type="warning"
              size="small"
              @click="resetPassword(row)"
              v-if="authStore.hasPermission('user:reset_password')"
            >
              重置密码
            </el-button>
            <el-button
              type="danger"
              size="small"
              @click="handleDeleteUser(row)"
              v-if="authStore.hasPermission('user:delete')"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.size"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 新增/编辑用户对话框 -->
    <el-dialog
      :title="dialogTitle"
      v-model="dialogVisible"
      width="600px"
      @close="resetForm"
    >
      <el-form
        ref="userFormRef"
        :model="userForm"
        :rules="userFormRules"
        label-width="80px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input
            v-model="userForm.username"
            placeholder="请输入用户名"
            :disabled="isEdit"
          />
        </el-form-item>
        <el-form-item label="昵称" prop="nickname">
          <el-input v-model="userForm.nickname" placeholder="请输入昵称" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="userForm.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="密码" prop="password" v-if="!isEdit">
          <el-input
            v-model="userForm.password"
            type="password"
            placeholder="请输入密码"
            show-password
          />
        </el-form-item>
        <el-form-item label="角色" prop="roleIds">
          <el-select
            v-model="userForm.roleIds"
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
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="userForm.status">
            <el-radio label="active">启用</el-radio>
            <el-radio label="inactive">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { useAuthStore } from '@/stores/auth'
import { getUserList, getUserById, createUser, updateUser, deleteUser, resetUserPassword, } from '@/api/user'
import { getAllRoles } from '@/api/rbac'
import type { User, CreateUserRequest, UpdateUserRequest, Role, GetUsersParams, ResetPasswordResponse, PaginationResponse } from '@/types/api'

const authStore = useAuthStore()

// 响应式数据
const loading = ref(false)
const submitting = ref(false)
const dialogVisible = ref(false)
const isEdit = ref(false)
const userList = ref<User[]>([])
const roleList = ref<Role[]>([])
const selectedUsers = ref<User[]>([])
const userFormRef = ref<FormInstance>()

// 搜索表单
const searchForm = reactive({
  username: '',
  email: '',
  status: ''
})

// 分页数据
const pagination = reactive({
  page: 1,
  size: 20,
  total: 0
})

// 用户表单
const userForm = reactive<CreateUserRequest & { id?: number }>({
  username: '',
  nickname: '',
  email: '',
  password: '',
  roleIds: [],
  status: 'active' as 'active' | 'inactive'
})

// 表单验证规则
const userFormRules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  nickname: [
    { required: true, message: '请输入昵称', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ],
  roleIds: [
    { required: true, message: '请选择角色', trigger: 'change' }
  ]
}

// 计算属性
const dialogTitle = computed(() => isEdit.value ? '编辑用户' : '新增用户')

/**
 * 格式化日期
 */
const formatDate = (date: string) => {
  return new Date(date).toLocaleString('zh-CN')
}

/**
 * 加载用户列表
 */
const loadUserList = async () => {
  try {
    loading.value = true
    const params: GetUsersParams = {
      page: pagination.page,
      limit: pagination.size,
      username: searchForm.username || undefined,
      email: searchForm.email || undefined,
      status: searchForm.status as 'active' | 'inactive' | 'banned' | undefined || undefined
    }
    const response = await getUserList(params)
    
    // 处理后端响应格式 - 后端返回 { users: User[], total: number }
    if (response) {
      const data = response.data as unknown as PaginationResponse<User>
      userList.value = data.users || []
      pagination.total = data.total || 0
    } else {
      userList.value = []
      pagination.total = 0
    }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    ElMessage.error('加载用户列表失败')
    // 加载用户列表失败
    userList.value = []
    pagination.total = 0
  } finally {
    loading.value = false
  }
}

/**
 * 加载角色列表
 */
const loadRoleList = async () => {
  try {
    const response = await getAllRoles()
    roleList.value = response.data
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    // 加载角色列表失败
  }
}

/**
 * 搜索用户
 */
const handleSearch = () => {
  pagination.page = 1
  loadUserList()
}

/**
 * 重置搜索
 */
const handleReset = () => {
  Object.assign(searchForm, {
    username: '',
    email: '',
    status: ''
  })
  pagination.page = 1
  loadUserList()
}

/**
 * 分页大小改变
 */
const handleSizeChange = (size: number) => {
  pagination.size = size
  pagination.page = 1
  loadUserList()
}

/**
 * 当前页改变
 */
const handleCurrentChange = (page: number) => {
  pagination.page = page
  loadUserList()
}

/**
 * 选择改变
 */
const handleSelectionChange = (selection: User[]) => {
  selectedUsers.value = selection
}

/**
 * 显示新增对话框
 */
const showCreateDialog = () => {
  isEdit.value = false
  dialogVisible.value = true
  resetForm()
}

/**
 * 显示编辑对话框
 */
const showEditDialog = async (user: User) => {
  try {
    isEdit.value = true
    const response = await getUserById(user.id)
    const userData = response.data
    
    Object.assign(userForm, {
      id: userData.id,
      username: userData.username,
      nickname: userData.nickname,
      email: userData.email,
      roleIds: userData.roles?.map(role => role.id) || [],
      status: userData.status
    })
    
    dialogVisible.value = true
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    ElMessage.error('获取用户信息失败')
    // 获取用户信息失败
  }
}

/**
 * 重置表单
 */
const resetForm = () => {
  Object.assign(userForm, {
    id: undefined,
    username: '',
    nickname: '',
    email: '',
    password: '',
    roleIds: [],
    status: 'active'
  })
  userFormRef.value?.clearValidate()
}

/**
 * 提交表单
 */
const handleSubmit = async () => {
  if (!userFormRef.value) return
  
  try {
    await userFormRef.value.validate()
    submitting.value = true
    
    if (isEdit.value) {
      // 编辑用户
      const updateData: UpdateUserRequest = {
        nickname: userForm.nickname,
        email: userForm.email,
        roleIds: userForm.roleIds,
        status: userForm.status
      }
      await updateUser(userForm.id!, updateData)
      ElMessage.success('用户更新成功')
    } else {
      // 新增用户
      const createData: CreateUserRequest = {
        username: userForm.username,
        nickname: userForm.nickname,
        email: userForm.email,
        password: userForm.password,
        roleIds: userForm.roleIds,
        status: userForm.status
      }
      await createUser(createData)
      ElMessage.success('用户创建成功')
    }
    
    dialogVisible.value = false
    loadUserList()
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    ElMessage.error(isEdit.value ? '用户更新失败' : '用户创建失败')
    // 用户操作失败
  } finally {
    submitting.value = false
  }
}

/**
 * 删除用户
 */
const handleDeleteUser = async (user: User) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除用户 "${user.username}" 吗？`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    await deleteUser(user.id)
    ElMessage.success('用户删除成功')
    loadUserList()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('用户删除失败')
      // 用户删除失败
    }
  }
}

/**
 * 重置密码
 */
const resetPassword = async (user: User) => {
  try {
    await ElMessageBox.confirm(
      `确定要重置用户 "${user.username}" 的密码吗？`,
      '重置密码确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    const response = await resetUserPassword(user.id, 'newPassword123')
    const resetData = response.data as ResetPasswordResponse
    ElMessage.success(`密码重置成功，新密码：${resetData.newPassword}`)
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('密码重置失败')
      // 密码重置失败
    }
  }
}

// 组件挂载时加载数据
onMounted(() => {
  loadUserList()
  loadRoleList()
})
</script>

<style scoped>
.user-management {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 20px;
}

.header-left h2 {
  margin: 0 0 8px 0;
  color: #333;
}

.header-left p {
  margin: 0;
  color: #666;
  font-size: 14px;
}

.search-card {
  margin-bottom: 20px;
}

.table-card {
  margin-bottom: 20px;
}

.role-tag {
  margin-right: 4px;
  margin-bottom: 4px;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  
  .user-management {
    padding: 16px;
  }
}
</style>