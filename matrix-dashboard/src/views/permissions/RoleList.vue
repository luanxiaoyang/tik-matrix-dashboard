<template>
  <div class="role-list">
    <!-- 操作区域 -->
    <el-card class="action-card" shadow="never">
      <el-button type="primary" @click="handleCreate" v-permission="'role:create'">
        <el-icon><Plus /></el-icon>
        新增角色
      </el-button>
    </el-card>

    <!-- 表格区域 -->
    <el-card class="table-card" shadow="never">
      <el-table
        v-loading="loading"
        :data="tableData"
        stripe
        style="width: 100%"
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="角色名称" width="150" />
        <el-table-column prop="code" label="角色代码" width="150" />
        <el-table-column prop="description" label="描述" min-width="200" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : 'danger'" size="small">
              {{ row.status === 'active' ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="sort" label="排序" width="80" />
        <el-table-column prop="createdAt" label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatDateTime(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="250" fixed="right">
          <template #default="{ row }">
            <el-button
              type="primary"
              size="small"
              @click="handleEdit(row)"
              v-permission="'role:update'"
            >
              编辑
            </el-button>
            <el-button
              type="warning"
              size="small"
              @click="handlePermissions(row)"
              v-permission="'role:update'"
            >
              权限配置
            </el-button>
            <el-button
              type="danger"
              size="small"
              @click="handleDelete(row)"
              v-permission="'role:delete'"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 角色表单对话框 -->
    <RoleForm
      v-model:visible="formVisible"
      :role-data="currentRole"
      @success="handleFormSuccess"
    />

    <!-- 权限配置对话框 -->
    <RolePermissionDialog
      v-model:visible="permissionVisible"
      :role-data="currentRole"
      @success="handlePermissionSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { getRoleList, deleteRole } from '@/api/rbac'
import type { Role } from '@/types/rbac'
import RoleForm from './RoleForm.vue'
import RolePermissionDialog from './RolePermissionDialog.vue'

// 表格数据
const loading = ref(false)
const tableData = ref<Role[]>([])

// 表单相关
const formVisible = ref(false)
const permissionVisible = ref(false)
const currentRole = ref<Role | null>(null)

// 获取数据
const fetchData = async () => {
  try {
    loading.value = true
    const response = await getRoleList({})
    tableData.value = response.data.data?.items || []
  } catch (error) {
    console.error('获取角色列表失败:', error)
    ElMessage.error('获取角色列表失败')
  } finally {
    loading.value = false
  }
}

// 新增角色
const handleCreate = () => {
  currentRole.value = null
  formVisible.value = true
}

// 编辑角色
const handleEdit = (role: Role) => {
  currentRole.value = role
  formVisible.value = true
}

// 权限配置
const handlePermissions = (role: Role) => {
  currentRole.value = role
  permissionVisible.value = true
}

// 删除角色
const handleDelete = async (role: Role) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除角色 "${role.name}" 吗？`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    await deleteRole(role.id)
    ElMessage.success('删除成功')
    fetchData()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

// 表单成功回调
const handleFormSuccess = () => {
  formVisible.value = false
  fetchData()
}

// 权限配置成功回调
const handlePermissionSuccess = () => {
  permissionVisible.value = false
  ElMessage.success('权限配置成功')
}

// 格式化日期时间
const formatDateTime = (dateTime: string) => {
  return new Date(dateTime).toLocaleString('zh-CN')
}

// 初始化
onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.role-list {
  padding: 20px;
}

.action-card,
.table-card {
  margin-bottom: 20px;
}
</style>