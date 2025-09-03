<template>
  <div class="account-list">
    <div class="page-header">
      <h1>账号列表</h1>
      <div class="header-actions">
        <el-button
          v-if="userStore.hasPermission(['ACCOUNT_CREATE'])"
          type="primary"
          :icon="Plus"
          @click="$router.push('/accounts/create')"
        >
          创建账号
        </el-button>
      </div>
    </div>
    
    <!-- 搜索和筛选 -->
    <el-card class="search-card">
      <el-form :model="searchForm" inline>
        <el-form-item label="搜索">
          <el-input
            v-model="searchForm.q"
            placeholder="搜索手机编号、账号链接"
            :prefix-icon="Search"
            clearable
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        
        <el-form-item label="归属">
          <el-select
            v-model="searchForm.ownerId"
            placeholder="选择归属用户"
            clearable
          >
            <el-option
              v-for="user in ownerOptions"
              :key="user.value"
              :label="user.label"
              :value="user.value"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="创建者">
          <el-select
            v-model="searchForm.createdBy"
            placeholder="选择创建者"
            clearable
          >
            <el-option
              v-for="user in creatorOptions"
              :key="user.value"
              :label="user.label"
              :value="user.value"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleSearch">
            搜索
          </el-button>
          <el-button :icon="Refresh" @click="handleReset">
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
    
    <!-- 账号表格 -->
    <el-card>
      <el-table
        v-loading="loading"
        :data="tableData"
        stripe
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        
        <el-table-column prop="phoneNo" label="手机编号" width="150">
          <template #default="{ row }">
            <el-tag type="info">{{ row.phoneNo }}</el-tag>
          </template>
        </el-table-column>
        
        <el-table-column prop="accountLink" label="账号链接" min-width="200">
          <template #default="{ row }">
            <el-link :href="row.accountLink" target="_blank" type="primary">
              {{ row.accountLink }}
            </el-link>
          </template>
        </el-table-column>
        
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column prop="ownerId" label="归属" width="120">
          <template #default="{ row }">
            <span>{{ getUserName(row.ownerId) }}</span>
          </template>
        </el-table-column>
        
        <el-table-column prop="createdBy" label="创建者" width="120">
          <template #default="{ row }">
            <span>{{ getUserName(row.createdBy) }}</span>
          </template>
        </el-table-column>
        
        <el-table-column prop="createdAt" label="创建时间" width="180">
          <template #default="{ row }">
            <span>{{ formatDateTime(row.createdAt) }}</span>
          </template>
        </el-table-column>
        
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button
              type="primary"
              size="small"
              :icon="View"
              @click="handleView(row)"
            >
              查看
            </el-button>
            
            <el-button
              v-if="userStore.hasPermission(['ACCOUNT_UPDATE']) && canEdit(row)"
              type="warning"
              size="small"
              :icon="Edit"
              @click="handleEdit(row)"
            >
              编辑
            </el-button>
            
            <el-dropdown
              v-if="hasMoreActions(row)"
              @command="(command) => handleCommand(command, row)"
            >
              <el-button size="small" :icon="More" />
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item
                    v-if="userStore.hasPermission(['ACCOUNT_UPDATE'])"
                    command="changeOwner"
                  >
                    变更归属
                  </el-dropdown-item>
                  <el-dropdown-item
                    v-if="userStore.hasPermission(['ACCOUNT_DELETE'])"
                    command="delete"
                    divided
                  >
                    删除
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :total="pagination.total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
    
    <!-- 变更归属对话框 -->
    <el-dialog
      v-model="changeOwnerDialog.visible"
      title="变更账号归属"
      width="400px"
    >
      <el-form :model="changeOwnerDialog.form" label-width="80px">
        <el-form-item label="当前归属">
          <span>{{ getUserName(changeOwnerDialog.account?.ownerId || '') }}</span>
        </el-form-item>
        <el-form-item label="新归属" required>
          <el-select
            v-model="changeOwnerDialog.form.newOwnerId"
            placeholder="选择新的归属用户"
            style="width: 100%"
          >
            <el-option
              v-for="user in ownerOptions"
              :key="user.value"
              :label="user.label"
              :value="user.value"
            />
          </el-select>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="changeOwnerDialog.visible = false">取消</el-button>
        <el-button
          type="primary"
          :loading="changeOwnerDialog.loading"
          @click="handleChangeOwner"
        >
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import {
  Plus,
  Search,
  Refresh,
  View,
  Edit,
  More
} from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { getAccounts, updateAccountOwner } from '@/api/accounts'
import type { Account, PaginationParams } from '@/types/business'
import { ACCOUNT_STATUS_LABELS, ACCOUNT_STATUS_COLORS, APP_CONFIG } from '@/constants'
import { successMessage, errorMessage, deleteConfirm } from '@/utils/message'
import { formatDateTime } from '@/utils/date'

const router = useRouter()
const userStore = useUserStore()

// 表格数据
const loading = ref(false)
const tableData = ref<Account[]>([])
const selectedRows = ref<Account[]>([])

// 搜索表单
const searchForm = reactive({
  q: '',
  ownerId: '',
  createdBy: ''
})

// 分页
const pagination = reactive({
  page: 1,
  pageSize: 20,
  total: 0
})

// 用户选项
const ownerOptions = ref([
  { label: 'Admin', value: 'u_1001' },
  { label: 'Manager', value: 'u_1002' },
  { label: 'Operator1', value: 'u_1003' },
  { label: 'Operator2', value: 'u_1004' }
])

const creatorOptions = computed(() => ownerOptions.value)

// 变更归属对话框
const changeOwnerDialog = reactive({
  visible: false,
  loading: false,
  account: null as Account | null,
  form: {
    newOwnerId: ''
  }
})

/**
 * 获取账号状态类型
 */
const getStatusType = (status: string): 'primary' | 'success' | 'warning' | 'info' | 'danger' => {
  return ACCOUNT_STATUS_COLORS[status] as 'primary' | 'success' | 'warning' | 'info' | 'danger' || 'info'
}

/**
 * 获取账号状态文本
 */
const getStatusText = (status: string) => {
  return ACCOUNT_STATUS_LABELS[status] || status
}

/**
 * 获取用户名
 */
const getUserName = (userId: string) => {
  const user = ownerOptions.value.find(u => u.value === userId)
  return user?.label || userId
}



/**
 * 检查是否可以编辑
 */
const canEdit = (account: Account) => {
  // 超级管理员可以编辑所有账号
  if (userStore.isSuperAdmin) return true
  
  // 其他用户只能编辑自己创建的账号
  return account.createdBy === String(userStore.userInfo?.id)
}

/**
 * 检查是否有更多操作
 */
const hasMoreActions = (account: Account) => {
  return userStore.hasPermission(['ACCOUNT_UPDATE', 'ACCOUNT_DELETE'])
}

/**
 * 加载账号列表
 */
const loadAccounts = async () => {
  try {
    loading.value = true
    
    const params: PaginationParams & typeof searchForm = {
      page: pagination.page,
      pageSize: pagination.pageSize,
      ...searchForm
    }
    
    const response = await getAccounts(params)
    
    const data = response.data.data
    if (Array.isArray(data)) {
      tableData.value = data
      pagination.total = data.length
    } else if (data && Array.isArray(data.items)) {
      tableData.value = data.items
      pagination.total = data.total || 0
    } else {
      tableData.value = []
      pagination.total = 0
    }
    
  } catch (error: any) {
    errorMessage(error.message || '加载账号列表失败')
  } finally {
    loading.value = false
  }
}

/**
 * 处理搜索
 */
const handleSearch = () => {
  pagination.page = 1
  loadAccounts()
}

/**
 * 处理重置
 */
const handleReset = () => {
  Object.assign(searchForm, {
    q: '',
    ownerId: '',
    createdBy: ''
  })
  pagination.page = 1
  loadAccounts()
}

/**
 * 处理选择变化
 */
const handleSelectionChange = (selection: Account[]) => {
  selectedRows.value = selection
}

/**
 * 处理页面大小变化
 */
const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  pagination.page = 1
  loadAccounts()
}

/**
 * 处理当前页变化
 */
const handleCurrentChange = (page: number) => {
  pagination.page = page
  loadAccounts()
}

/**
 * 处理查看
 */
const handleView = (account: Account) => {
  router.push(`/accounts/detail/${account.id}`)
}

/**
 * 处理编辑
 */
const handleEdit = (account: Account) => {
  router.push(`/accounts/edit/${account.id}`)
}

/**
 * 处理下拉菜单命令
 */
const handleCommand = (command: string, account: Account) => {
  switch (command) {
    case 'changeOwner':
      showChangeOwnerDialog(account)
      break
    case 'delete':
      handleDelete(account)
      break
  }
}

/**
 * 显示变更归属对话框
 */
const showChangeOwnerDialog = (account: Account) => {
  changeOwnerDialog.account = account
  changeOwnerDialog.form.newOwnerId = ''
  changeOwnerDialog.visible = true
}

/**
 * 处理变更归属
 */
const handleChangeOwner = async () => {
  if (!changeOwnerDialog.form.newOwnerId) {
    errorMessage('请选择新的归属用户')
    return
  }
  
  try {
    changeOwnerDialog.loading = true
    
    await updateAccountOwner(changeOwnerDialog.account!.id, {
      newOwnerId: changeOwnerDialog.form.newOwnerId
    })
    
    successMessage('变更归属成功')
    changeOwnerDialog.visible = false
    loadAccounts()
    
  } catch (error: any) {
    errorMessage(error.message || '变更归属失败')
  } finally {
    changeOwnerDialog.loading = false
  }
}

/**
 * 处理删除
 */
const handleDelete = async (account: Account) => {
  try {
    await deleteConfirm(`确定要删除账号 ${account.phoneNo} 吗？此操作不可恢复。`)
    
    // TODO: 实现删除API
    successMessage('删除成功')
    loadAccounts()
    
  } catch (error) {
    // 用户取消
  }
}

onMounted(() => {
  loadAccounts()
})
</script>

<style scoped>
.account-list {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-header h1 {
  font-size: 24px;
  color: #333;
  margin: 0;
}

.search-card {
  margin-bottom: 20px;
}

.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

@media (max-width: 768px) {
  .account-list {
    padding: 16px;
  }
  
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
}
</style>