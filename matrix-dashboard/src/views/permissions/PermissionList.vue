<template>
  <div class="permission-list">
    <!-- 操作区域 -->
    <el-card class="action-card" shadow="never">
      <el-button type="primary" @click="handleCreate" v-permission="'permission:create'">
        <el-icon><Plus /></el-icon>
        新增权限
      </el-button>
      <el-button @click="toggleTreeView">
        <el-icon><List v-if="isTreeView" /><Operation v-else /></el-icon>
        {{ isTreeView ? '列表视图' : '树形视图' }}
      </el-button>
    </el-card>

    <!-- 表格区域 -->
    <el-card class="table-card" shadow="never">
      <!-- 树形视图 -->
      <el-tree
        v-if="isTreeView"
        v-loading="loading"
        :data="treeData"
        :props="treeProps"
        node-key="id"
        :expand-on-click-node="false"
        class="permission-tree"
      >
        <template #default="{ node, data }">
          <div class="tree-node">
            <div class="node-info">
              <el-icon v-if="data.type === 'menu'">
                <Menu />
              </el-icon>
              <el-icon v-else-if="data.type === 'button'">
                <Operation />
              </el-icon>
              <el-icon v-else>
                <Link />
              </el-icon>
              <span class="node-name">{{ data.name }}</span>
              <el-tag size="small" :type="getPermissionTypeColor(data.type)">
                {{ getPermissionTypeText(data.type) }}
              </el-tag>
              <el-tag v-if="!data.isActive" type="danger" size="small">
                禁用
              </el-tag>
            </div>
            <div class="node-actions">
              <el-button
                type="primary"
                size="small"
                @click="handleEdit(data)"
                v-permission="'permission:update'"
              >
                编辑
              </el-button>
              <el-button
                type="danger"
                size="small"
                @click="handleDelete(data)"
                v-permission="'permission:delete'"
              >
                删除
              </el-button>
            </div>
          </div>
        </template>
      </el-tree>
      
      <!-- 表格视图 -->
      <el-table
        v-else
        v-loading="loading"
        :data="tableData"
        stripe
        style="width: 100%"
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="权限名称" width="200" />
        <el-table-column prop="code" label="权限代码" width="200" />
        <el-table-column prop="type" label="类型" width="100">
          <template #default="{ row }">
            <el-tag size="small" :type="getPermissionTypeColor(row.type)">
              {{ getPermissionTypeText(row.type) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="resource" label="资源" min-width="200" />
        <el-table-column prop="description" label="描述" min-width="200" />
        <el-table-column prop="isActive" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.isActive ? 'success' : 'danger'" size="small">
              {{ row.isActive ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="sort" label="排序" width="80" />
        <el-table-column prop="createdAt" label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatDateTime(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button
              type="primary"
              size="small"
              @click="handleEdit(row)"
              v-permission="'permission:update'"
            >
              编辑
            </el-button>
            <el-button
              type="danger"
              size="small"
              @click="handleDelete(row)"
              v-permission="'permission:delete'"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 权限表单对话框 -->
    <PermissionForm
      v-model:visible="formVisible"
      :permission-data="currentPermission"
      @success="handleFormSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, List, Operation, Menu, Link } from '@element-plus/icons-vue'
import { getPermissionList, getPermissionTree, deletePermission } from '@/api/rbac'
import type { Permission } from '@/types/rbac'
import PermissionForm from './PermissionForm.vue'

// 视图状态
const isTreeView = ref(true)
const loading = ref(false)

// 数据
const tableData = ref<Permission[]>([])
const treeData = ref<Permission[]>([])

// 表单相关
const formVisible = ref(false)
const currentPermission = ref<Permission | null>(null)

// 树形组件配置
const treeProps = {
  children: 'children',
  label: 'name'
}

// 获取权限列表数据
const fetchListData = async () => {
  try {
    loading.value = true
    const response = await getPermissionList({})
    const data = response.data.data
    if (Array.isArray(data)) {
      tableData.value = data
    } else if (data && Array.isArray(data.items)) {
      tableData.value = data.items.flat()
    } else {
      tableData.value = []
    }
    
    // 构建树形数据
    treeData.value = buildTree(tableData.value)
  } catch (error) {
    console.error('获取权限列表失败:', error)
    ElMessage.error('获取权限列表失败')
  } finally {
    loading.value = false
  }
}

// 构建树形数据
const buildTree = (permissions: Permission[]): Permission[] => {
  const map = new Map<number, Permission>()
  const roots: Permission[] = []
  
  // 创建映射
  permissions.forEach(permission => {
    map.set(permission.id, { ...permission, children: [] })
  })
  
  // 构建树形结构
  permissions.forEach(permission => {
    const node = map.get(permission.id)!
    if (permission.parentId && map.has(permission.parentId)) {
      const parent = map.get(permission.parentId)!
      if (!parent.children) parent.children = []
      parent.children.push(node)
    } else {
      roots.push(node)
    }
  })
  
  return roots
}

// 获取权限树数据
const fetchTreeData = async () => {
  try {
    loading.value = true
    const response = await getPermissionTree()
    treeData.value = response.data.data || []
  } catch (error) {
    console.error('获取权限树失败:', error)
    ElMessage.error('获取权限树失败')
  } finally {
    loading.value = false
  }
}

// 切换视图
const toggleTreeView = () => {
  isTreeView.value = !isTreeView.value
  if (isTreeView.value) {
    fetchTreeData()
  } else {
    fetchListData()
  }
}

// 新增权限
const handleCreate = () => {
  currentPermission.value = null
  formVisible.value = true
}

// 编辑权限
const handleEdit = (permission: Permission) => {
  currentPermission.value = permission
  formVisible.value = true
}

// 删除权限
const handleDelete = async (permission: Permission) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除权限 "${permission.name}" 吗？`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    await deletePermission(permission.id)
    ElMessage.success('删除成功')
    
    // 刷新数据
    if (isTreeView.value) {
      fetchTreeData()
    } else {
      fetchListData()
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

// 表单成功回调
const handleFormSuccess = () => {
  formVisible.value = false
  
  // 刷新数据
  if (isTreeView.value) {
    fetchTreeData()
  } else {
    fetchListData()
  }
}

// 获取权限类型颜色
const getPermissionTypeColor = (type: string): 'primary' | 'success' | 'warning' | 'info' | 'danger' => {
  const colorMap: Record<string, 'primary' | 'success' | 'warning' | 'info' | 'danger'> = {
    menu: 'primary',
    button: 'success',
    api: 'warning'
  }
  return colorMap[type] || 'info'
}

// 获取权限类型文本
const getPermissionTypeText = (type: string) => {
  const textMap: Record<string, string> = {
    menu: '菜单',
    button: '按钮',
    api: '接口'
  }
  return textMap[type] || type
}

// 格式化日期时间
const formatDateTime = (dateTime: string) => {
  return new Date(dateTime).toLocaleString('zh-CN')
}

// 初始化
onMounted(() => {
  fetchTreeData()
})
</script>

<style scoped>
.permission-list {
  padding: 20px;
}

.action-card,
.table-card {
  margin-bottom: 20px;
}

.permission-tree {
  min-height: 400px;
}

.tree-node {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding-right: 20px;
}

.node-info {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.node-name {
  font-weight: 500;
}

.node-actions {
  display: flex;
  gap: 8px;
}
</style>