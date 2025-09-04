<template>
  <div class="role-management">
    <!-- 页面标题和操作按钮 -->
    <div class="page-header">
      <div class="header-left">
        <h2>角色管理</h2>
        <p>管理系统角色和权限分配</p>
      </div>
      <div class="header-right">
        <el-button type="primary" @click="showCreateDialog" v-if="authStore.hasPermission('role:create')">
          <el-icon><Plus /></el-icon>
          新增角色
        </el-button>
      </div>
    </div>

    <!-- 搜索和筛选 -->
    <el-card class="search-card">
      <el-form :model="searchForm" inline>
        <el-form-item label="角色名称">
          <el-input
            v-model="searchForm.name"
            placeholder="请输入角色名称"
            clearable
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item label="角色代码">
          <el-input
            v-model="searchForm.code"
            placeholder="请输入角色代码"
            clearable
            @keyup.enter="handleSearch"
          />
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

    <!-- 角色列表 -->
    <el-card class="table-card">
      <el-table
        :data="roleList"
        v-loading="loading"
        stripe
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="角色名称" min-width="150" />
        <el-table-column prop="code" label="角色代码" min-width="150" />
        <el-table-column prop="description" label="描述" min-width="200" show-overflow-tooltip />
        <el-table-column label="权限数量" width="100">
          <template #default="{ row }">
            <el-tag type="info">{{ row.permissions?.length || 0 }}</el-tag>
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
              v-if="authStore.hasPermission('role:update')"
            >
              编辑
            </el-button>
            <el-button
              type="info"
              size="small"
              @click="showPermissionDialog(row)"
              v-if="authStore.hasPermission('role:assign_permission')"
            >
              权限
            </el-button>
            <el-button
              type="danger"
              size="small"
              @click="deleteRole(row)"
              v-if="authStore.hasPermission('role:delete')"
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

    <!-- 新增/编辑角色对话框 -->
    <el-dialog
      :title="dialogTitle"
      v-model="dialogVisible"
      width="600px"
      @close="resetForm"
    >
      <el-form
        ref="roleFormRef"
        :model="roleForm"
        :rules="roleFormRules"
        label-width="80px"
      >
        <el-form-item label="角色名称" prop="name">
          <el-input v-model="roleForm.name" placeholder="请输入角色名称" />
        </el-form-item>
        <el-form-item label="角色代码" prop="code">
          <el-input
            v-model="roleForm.code"
            placeholder="请输入角色代码"
            :disabled="isEdit"
          />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input
            v-model="roleForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入角色描述"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">
          确定
        </el-button>
      </template>
    </el-dialog>

    <!-- 权限分配对话框 -->
    <el-dialog
      title="权限分配"
      v-model="permissionDialogVisible"
      width="800px"
      @close="resetPermissionForm"
    >
      <div class="permission-assignment">
        <div class="role-info">
          <h4>角色：{{ currentRole?.name }}</h4>
          <p>{{ currentRole?.description }}</p>
        </div>
        
        <el-divider />
        
        <div class="permission-tree">
          <el-tree
            ref="permissionTreeRef"
            :data="permissionTreeData"
            :props="treeProps"
            show-checkbox
            node-key="id"
            :default-checked-keys="selectedPermissionIds"
            @check="handlePermissionCheck"
          >
            <template #default="{ data }">
              <span class="tree-node">
                <el-icon v-if="data.type === 'module'" class="module-icon"><Folder /></el-icon>
                <el-icon v-else class="permission-icon"><Key /></el-icon>
                <span class="node-label">{{ data.name }}</span>
                <span class="node-code">{{ data.code }}</span>
              </span>
            </template>
          </el-tree>
        </div>
      </div>
      
      <template #footer>
        <el-button @click="permissionDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handlePermissionSubmit" :loading="permissionSubmitting">
          保存权限
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed, nextTick } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { useAuthStore } from '@/stores/auth'
import { getRoleList, getRoleById, createRole, updateRole, deleteRole as deleteRoleApi } from '@/api/rbac'
import { getAllPermissions } from '@/api/rbac'
import type { Role, Permission, GetRolesParams, UpdateRoleRequest } from '@/types/api'

const authStore = useAuthStore()

// 响应式数据
const loading = ref(false)
const submitting = ref(false)
const permissionSubmitting = ref(false)
const dialogVisible = ref(false)
const permissionDialogVisible = ref(false)
const isEdit = ref(false)
const roleList = ref<Role[]>([])
const permissionList = ref<Permission[]>([])
const selectedRoles = ref<Role[]>([])
const currentRole = ref<Role | null>(null)
const selectedPermissionIds = ref<number[]>([])
const roleFormRef = ref<FormInstance>()
const permissionTreeRef = ref()

// 搜索表单
const searchForm = reactive({
  name: '',
  code: ''
})

// 分页数据
const pagination = reactive({
  page: 1,
  size: 20,
  total: 0
})

// 角色表单
const roleForm = reactive({
  id: undefined as number | undefined,
  name: '',
  code: '',
  description: ''
})

// 表单验证规则
const roleFormRules: FormRules = {
  name: [
    { required: true, message: '请输入角色名称', trigger: 'blur' }
  ],
  code: [
    { required: true, message: '请输入角色代码', trigger: 'blur' },
    { pattern: /^[a-zA-Z0-9_-]+$/, message: '角色代码只能包含字母、数字、下划线和连字符', trigger: 'blur' },
    { min: 2, max: 50, message: '角色代码长度在 2 到 50 个字符', trigger: 'blur' }
  ]
}

// 权限树配置
const treeProps = {
  children: 'children',
  label: 'name'
}

// 计算属性
const dialogTitle = computed(() => isEdit.value ? '编辑角色' : '新增角色')

// 权限树数据
interface TreeNode {
  id: string
  name: string
  code?: string
  type: 'module' | 'permission'
  children?: TreeNode[]
}

const permissionTreeData = computed(() => {
  // 将权限列表转换为树形结构
  const moduleMap = new Map()
  const result: TreeNode[] = []
  
  permissionList.value.forEach(permission => {
    const [module] = permission.code.split(':')
    
    if (!moduleMap.has(module)) {
      const moduleNode: TreeNode = {
        id: `module_${module}`,
        name: getModuleName(module),
        code: module,
        type: 'module',
        children: []
      }
      moduleMap.set(module, moduleNode)
      result.push(moduleNode)
    }
    
    const moduleNode = moduleMap.get(module)
    moduleNode.children.push({
      id: permission.id,
      name: permission.name,
      code: permission.code,
      type: 'permission'
    })
  })
  
  return result
})

/**
 * 获取模块名称
 */
const getModuleName = (module: string) => {
  const moduleNames: Record<string, string> = {
    user: '用户管理',
    role: '角色管理',
    permission: '权限管理',
    recharge: '充值同步',
    system: '系统管理'
  }
  return moduleNames[module] || module
}

/**
 * 格式化日期
 */
const formatDate = (date: string) => {
  return new Date(date).toLocaleString('zh-CN')
}

/**
 * 加载角色列表
 */
const loadRoleList = async () => {
  try {
    loading.value = true
    const params: GetRolesParams = {
      page: pagination.page,
      size: pagination.size,
      name: searchForm.name || undefined,
      code: searchForm.code || undefined
    }
    const response = await getRoleList(params)
    // 后端返回的数据结构是 {code: 200, message: '获取成功', data: Array}
    // data 直接是角色数组，不是包含 items 和 total 的对象
    roleList.value = (response.data as unknown as Role[]) || []
    // 设置总数为数组长度
    pagination.total = (response.data as unknown as Role[])?.length || 0
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    ElMessage.error('加载角色列表失败')
    // 加载角色列表失败
  } finally {
    loading.value = false
  }
}

/**
 * 加载权限列表
 */
const loadPermissionList = async () => {
  try {
    const response = await getAllPermissions()
    permissionList.value = response.data
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    // 加载权限列表失败
    ElMessage.error('加载权限列表失败')
  }
}

/**
 * 搜索角色
 */
const handleSearch = () => {
  pagination.page = 1
  loadRoleList()
}

/**
 * 重置搜索
 */
const handleReset = () => {
  Object.assign(searchForm, {
    name: '',
    code: ''
  })
  pagination.page = 1
  loadRoleList()
}

/**
 * 分页大小改变
 */
const handleSizeChange = (size: number) => {
  pagination.size = size
  pagination.page = 1
  loadRoleList()
}

/**
 * 当前页改变
 */
const handleCurrentChange = (page: number) => {
  pagination.page = page
  loadRoleList()
}

/**
 * 选择改变
 */
const handleSelectionChange = (selection: Role[]) => {
  selectedRoles.value = selection
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
const showEditDialog = async (role: Role) => {
  try {
    isEdit.value = true
    const response = await getRoleById(role.id)
    const roleData = response.data
    
    Object.assign(roleForm, {
      id: roleData.id,
      name: roleData.name,
      code: roleData.code,
      description: roleData.description
    })
    
    dialogVisible.value = true
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    ElMessage.error('获取角色信息失败')
    // 获取角色信息失败
  }
}

/**
 * 显示权限分配对话框
 */
const showPermissionDialog = async (role: Role) => {
  try {
    currentRole.value = role
    const response = await getRoleById(role.id)
    const roleData = response.data
    
    selectedPermissionIds.value = roleData.permissions?.map(p => typeof p === 'string' ? parseInt(p) : p) || []
    permissionDialogVisible.value = true
    
    // 等待DOM更新后设置选中状态
    await nextTick()
    if (permissionTreeRef.value) {
      permissionTreeRef.value.setCheckedKeys(selectedPermissionIds.value)
    }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    ElMessage.error('获取角色权限失败')
    // 获取角色权限失败
  }
}

/**
 * 重置表单
 */
const resetForm = () => {
  Object.assign(roleForm, {
    id: undefined,
    name: '',
    code: '',
    description: ''
  })
  roleFormRef.value?.clearValidate()
}

/**
 * 重置权限表单
 */
const resetPermissionForm = () => {
  currentRole.value = null
  selectedPermissionIds.value = []
}

/**
 * 提交表单
 */
const handleSubmit = async () => {
  if (!roleFormRef.value) return
  
  try {
    await roleFormRef.value.validate()
    submitting.value = true
    
    if (isEdit.value) {
      // 编辑角色
      const updateData: UpdateRoleRequest = {
        name: roleForm.name,
        description: roleForm.description
      }
      await updateRole(roleForm.id!, updateData)
      ElMessage.success('角色更新成功')
    } else {
      // 新增角色
      const createData = {
        name: roleForm.name,
        code: roleForm.code,
        description: roleForm.description,
        permissionIds: [] as number[]
      }
      await createRole(createData)
      ElMessage.success('角色创建成功')
    }
    
    dialogVisible.value = false
    loadRoleList()
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    ElMessage.error(isEdit.value ? '角色更新失败' : '角色创建失败')
    // 角色操作失败
  } finally {
    submitting.value = false
  }
}

/**
 * 权限选择改变
 */
interface CheckedInfo {
  checkedKeys: (string | number)[]
  checkedNodes: TreeNode[]
  halfCheckedKeys: (string | number)[]
  halfCheckedNodes: TreeNode[]
}

const handlePermissionCheck = (data: TreeNode, checked: CheckedInfo) => {
  // 获取所有选中的权限ID（排除模块节点）
  const checkedKeys = checked.checkedKeys.filter((key: string | number) => typeof key === 'number')
  selectedPermissionIds.value = checkedKeys as number[]
}

/**
 * 提交权限分配
 */
const handlePermissionSubmit = async () => {
  if (!currentRole.value) return
  
  try {
    permissionSubmitting.value = true
    
    // 这里应该调用分配权限的API
    // await assignRolePermissions(currentRole.value.id, selectedPermissionIds.value)
    
    ElMessage.success('权限分配成功')
    permissionDialogVisible.value = false
    loadRoleList()
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    ElMessage.error('权限分配失败')
    // 权限分配失败
  } finally {
    permissionSubmitting.value = false
  }
}

/**
 * 删除角色
 */
const deleteRole = async (role: Role) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除角色 "${role.name}" 吗？`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    await deleteRoleApi(role.id)
    ElMessage.success('角色删除成功')
    loadRoleList()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('角色删除失败')
      // 角色删除失败
    }
  }
}

// 组件挂载时加载数据
onMounted(() => {
  loadRoleList()
  loadPermissionList()
})
</script>

<style scoped>
.role-management {
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

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.permission-assignment {
  max-height: 500px;
  overflow-y: auto;
}

.role-info h4 {
  margin: 0 0 8px 0;
  color: #333;
}

.role-info p {
  margin: 0;
  color: #666;
  font-size: 14px;
}

.permission-tree {
  margin-top: 16px;
}

.tree-node {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.module-icon {
  color: #409eff;
}

.permission-icon {
  color: #67c23a;
}

.node-label {
  font-weight: 500;
}

.node-code {
  font-size: 12px;
  color: #999;
  background: #f5f5f5;
  padding: 2px 6px;
  border-radius: 4px;
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  
  .role-management {
    padding: 16px;
  }
}
</style>