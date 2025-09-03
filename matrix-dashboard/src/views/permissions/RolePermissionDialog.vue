<template>
  <el-dialog
    v-model="dialogVisible"
    title="权限配置"
    width="800px"
    @close="handleClose"
  >
    <div class="permission-config">
      <div class="role-info">
        <el-tag type="primary" size="large">
          {{ roleData?.name }}
        </el-tag>
        <span class="role-code">{{ roleData?.code }}</span>
      </div>
      
      <el-divider />
      
      <div class="permission-tree">
        <el-tree
          ref="treeRef"
          :data="permissionTree"
          :props="treeProps"
          show-checkbox
          node-key="id"
          :default-checked-keys="checkedPermissions"
          @check="handlePermissionCheck"
        >
          <template #default="{ node, data }">
            <div class="tree-node">
              <el-icon v-if="data.type === 'menu'">
                <Menu />
              </el-icon>
              <el-icon v-else-if="data.type === 'button'">
                <Operation />
              </el-icon>
              <el-icon v-else>
                <Link />
              </el-icon>
              <span class="node-label">{{ node.label }}</span>
              <el-tag size="small" :type="getPermissionTypeColor(data.type)">
                {{ getPermissionTypeText(data.type) }}
              </el-tag>
            </div>
          </template>
        </el-tree>
      </div>
    </div>
    
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="loading">
          保存
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Menu, Operation, Link } from '@element-plus/icons-vue'
import { getPermissionTree, addRolePermissions, removeRolePermission } from '@/api/rbac'
import type { Role, Permission } from '@/types/rbac'

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

// 树形组件引用
const treeRef = ref()
const loading = ref(false)

// 权限树数据
const permissionTree = ref<Permission[]>([])
const checkedPermissions = ref<number[]>([])
const originalPermissions = ref<number[]>([])

// 树形组件配置
const treeProps = {
  children: 'children',
  label: 'name'
}

// 监听角色数据变化
watch(
  () => props.roleData,
  (roleData) => {
    if (roleData) {
      // 获取角色当前权限
      const rolePermissions = getRolePermissionIds(roleData)
      checkedPermissions.value = rolePermissions
      originalPermissions.value = [...rolePermissions]
    } else {
      checkedPermissions.value = []
      originalPermissions.value = []
    }
  },
  { immediate: true }
)

// 获取权限树数据
const fetchPermissionTree = async () => {
  try {
    const response = await getPermissionTree()
    if (response.data.code === 200) {
      permissionTree.value = response.data.data
    }
  } catch (error) {
    console.error('获取权限树失败:', error)
    ElMessage.error('获取权限树失败')
  }
}

// 获取角色权限ID列表
const getRolePermissionIds = (role: Role): number[] => {
  // 这里需要根据实际的角色权限数据结构来获取
  // 假设角色对象中有permissions字段
  return (role as any).permissions?.map((p: any) => p.id) || []
}

// 权限选择变化处理
const handlePermissionCheck = (data: Permission, checked: any) => {
  // 这里可以添加权限选择的业务逻辑
  console.log('权限选择变化:', data, checked)
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

// 提交权限配置
const handleSubmit = async () => {
  if (!props.roleData) return
  
  try {
    loading.value = true
    
    // 获取当前选中的权限
    const currentChecked = treeRef.value.getCheckedKeys()
    const currentHalfChecked = treeRef.value.getHalfCheckedKeys()
    const allChecked = [...currentChecked, ...currentHalfChecked]
    
    // 计算需要添加和移除的权限
    const toAdd = allChecked.filter(id => !originalPermissions.value.includes(id))
    const toRemove = originalPermissions.value.filter(id => !allChecked.includes(id))
    
    // 添加权限
    if (toAdd.length > 0) {
      await addRolePermissions(props.roleData.id, { permissionIds: toAdd })
    }
    
    // 移除权限
    if (toRemove.length > 0) {
      for (const permissionId of toRemove) {
        await removeRolePermission(props.roleData.id, permissionId)
      }
    }
    
    ElMessage.success('权限配置成功')
    emit('success')
  } catch (error: any) {
    ElMessage.error(error.message || '权限配置失败')
  } finally {
    loading.value = false
  }
}

// 关闭对话框
const handleClose = () => {
  dialogVisible.value = false
}

// 初始化
onMounted(() => {
  fetchPermissionTree()
})
</script>

<style scoped>
.permission-config {
  max-height: 500px;
}

.role-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.role-code {
  color: #909399;
  font-size: 14px;
}

.permission-tree {
  max-height: 400px;
  overflow-y: auto;
}

.tree-node {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.node-label {
  flex: 1;
}

.dialog-footer {
  text-align: right;
}
</style>