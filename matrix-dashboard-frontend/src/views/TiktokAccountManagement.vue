<template>
  <div class="tiktok-account-management">
    <!-- 页面标题和操作按钮 -->
    <div class="header">
      <h2>TikTok账号管理</h2>
      <div class="header-actions">
        <el-button type="primary" @click="showCreateDialog = true">
          <el-icon><Plus /></el-icon>
          添加账号
        </el-button>
        <el-button @click="refreshStats">
          <el-icon><Refresh /></el-icon>
          刷新统计
        </el-button>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-cards" v-if="stats">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-number">{{ stats.total }}</div>
              <div class="stat-label">总账号数</div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-number">{{ stats.activeCount }}</div>
              <div class="stat-label">活跃账号</div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-number">{{ stats.assignedCount }}</div>
              <div class="stat-label">已分配</div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-number">{{ stats.unassignedCount }}</div>
              <div class="stat-label">未分配</div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 搜索和筛选 -->
    <el-card class="search-card">
      <el-form :model="searchForm" inline>
        <el-form-item label="搜索">
          <el-input
            v-model="searchForm.search"
            placeholder="搜索账号名称、用户名或URL"
            clearable
            style="width: 250px"
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item label="账号等级">
          <el-select v-model="searchForm.accountLevel" placeholder="选择等级" clearable>
            <el-option label="A级" value="A" />
            <el-option label="B级" value="B" />
            <el-option label="C级" value="C" />
            <el-option label="D级" value="D" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="选择状态" clearable>
            <el-option label="活跃" value="active" />
            <el-option label="非活跃" value="inactive" />
            <el-option label="封禁" value="banned" />
            <el-option label="待审核" value="pending" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 账号列表 -->
    <el-card class="table-card">
      <el-table
        :data="accounts"
        v-loading="loading"
        stripe
        style="width: 100%"
      >
        <el-table-column prop="accountName" label="账号名称" width="150" />
        <el-table-column prop="username" label="用户名" width="120" />
        <el-table-column prop="accountUrl" label="账号链接" width="200">
          <template #default="{ row }">
            <el-link :href="row.accountUrl" target="_blank" type="primary">
              {{ row.accountUrl.length > 30 ? row.accountUrl.substring(0, 30) + '...' : row.accountUrl }}
            </el-link>
          </template>
        </el-table-column>
        <el-table-column prop="accountLevel" label="等级" width="80">
          <template #default="{ row }">
            <el-tag :type="getLevelTagType(row.accountLevel)">{{ row.accountLevel }}级</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusTagType(row.status)">{{ getStatusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="统计数据" width="200">
          <template #default="{ row }">
            <div class="stats-info">
              <span>粉丝: {{ formatNumber(row.followersCount) }}</span>
              <span>视频: {{ formatNumber(row.videosCount) }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="分配人员" width="200">
          <template #default="{ row }">
            <div class="assignment-info">
              <div v-if="row.operator">
                <el-tag size="small">运营: {{ row.operator.username }}</el-tag>
              </div>
              <div v-if="row.converter">
                <el-tag size="small" type="success">转化: {{ row.converter.username }}</el-tag>
              </div>
              <div v-if="!row.operator && !row.converter">
                <el-tag size="small" type="info">未分配</el-tag>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="editAccount(row)">编辑</el-button>
            <el-button size="small" type="success" @click="assignUser(row)">分配</el-button>
            <el-button size="small" type="danger" @click="deleteAccount(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.limit"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 创建/编辑账号对话框 -->
    <el-dialog
      v-model="showCreateDialog"
      :title="editingAccount ? '编辑账号' : '创建账号'"
      width="600px"
    >
      <el-form
        ref="accountFormRef"
        :model="accountForm"
        :rules="accountRules"
        label-width="100px"
      >
        <el-form-item label="账号链接" prop="accountUrl">
          <el-input v-model="accountForm.accountUrl" placeholder="请输入TikTok账号链接" />
        </el-form-item>
        <el-form-item label="账号名称" prop="accountName">
          <el-input v-model="accountForm.accountName" placeholder="请输入账号名称" />
        </el-form-item>
        <el-form-item label="用户名" prop="username">
          <el-input v-model="accountForm.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="手机号" prop="phoneNumber">
          <el-input v-model="accountForm.phoneNumber" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="账号等级" prop="accountLevel">
          <el-select v-model="accountForm.accountLevel" placeholder="选择账号等级">
            <el-option label="A级" value="A" />
            <el-option label="B级" value="B" />
            <el-option label="C级" value="C" />
            <el-option label="D级" value="D" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="accountForm.status" placeholder="选择状态">
            <el-option label="活跃" value="active" />
            <el-option label="非活跃" value="inactive" />
            <el-option label="封禁" value="banned" />
            <el-option label="待审核" value="pending" />
          </el-select>
        </el-form-item>
        <el-form-item label="地区">
          <el-input v-model="accountForm.region" placeholder="请输入地区" />
        </el-form-item>
        <el-form-item label="语言">
          <el-input v-model="accountForm.language" placeholder="请输入语言" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input
            v-model="accountForm.notes"
            type="textarea"
            :rows="3"
            placeholder="请输入备注信息"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showCreateDialog = false">取消</el-button>
        <el-button type="primary" @click="submitAccount" :loading="submitting">
          {{ editingAccount ? '更新' : '创建' }}
        </el-button>
      </template>
    </el-dialog>

    <!-- 分配用户对话框 -->
    <el-dialog v-model="showAssignDialog" title="分配用户" width="500px">
      <el-form :model="assignForm" label-width="80px">
        <el-form-item label="角色类型">
          <el-select v-model="assignForm.role" placeholder="选择角色类型">
            <el-option label="运营人员" value="operator" />
            <el-option label="转化人员" value="converter" />
          </el-select>
        </el-form-item>
        <el-form-item label="选择用户">
          <el-select v-model="assignForm.userId" placeholder="选择用户" filterable>
            <el-option
              v-for="user in users"
              :key="user.id"
              :label="user.username"
              :value="user.id"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAssignDialog = false">取消</el-button>
        <el-button type="primary" @click="submitAssign" :loading="assigning">
          分配
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Plus, Refresh } from '@element-plus/icons-vue';
import {
  getTiktokAccounts,
  createTiktokAccount,
  updateTiktokAccount,
  deleteTiktokAccount,
  assignUsers,
  getAccountStats
} from '../api/tiktok-account';
import { getUserList } from '../api/user';
import type {
  TiktokAccount,
  CreateTiktokAccountRequest,
  UpdateTiktokAccountRequest,
  TiktokAccountQueryParams,
  TiktokAccountStats,
  AssignUserRequest,
  AccountLevel,
  AccountStatus,
  User,
  UserPaginationResponse
} from '../types/api';

// 响应式数据
const loading = ref(false);
const submitting = ref(false);
const assigning = ref(false);
const accounts = ref<TiktokAccount[]>([]);
const users = ref<User[]>([]);
const stats = ref<TiktokAccountStats | null>(null);
const showCreateDialog = ref(false);
const showAssignDialog = ref(false);
const editingAccount = ref<TiktokAccount | null>(null);
const assigningAccount = ref<TiktokAccount | null>(null);

// 分页数据
const pagination = reactive({
  page: 1,
  limit: 20,
  total: 0
});

// 搜索表单
const searchForm = reactive<TiktokAccountQueryParams>({
  search: '',
  accountLevel: undefined,
  status: undefined
});

// 账号表单
const accountForm = reactive<CreateTiktokAccountRequest>({
  accountUrl: '',
  accountName: '',
  username: '',
  phoneNumber: '',
  accountLevel: 'A' as AccountLevel,
  status: 'active' as AccountStatus,
  region: '',
  language: '',
  notes: ''
});

// 分配表单
const assignForm = reactive<AssignUserRequest>({
  userId: '',
  role: 'operator'
});

// 表单验证规则
const accountRules = {
  accountUrl: [
    { required: true, message: '请输入账号链接', trigger: 'blur' },
    { pattern: /^https?:\/\/.+/, message: '请输入有效的URL', trigger: 'blur' }
  ],
  accountLevel: [
    { required: true, message: '请选择账号等级', trigger: 'change' }
  ]
};

// 获取账号列表
const fetchAccounts = async () => {
  try {
    loading.value = true;
    const params = {
      page: pagination.page,
      limit: pagination.limit,
      ...searchForm
    };
    const response = await getTiktokAccounts(params);
    accounts.value = response.data.items || [];
    pagination.total = response.data.total;
  } catch (error) {
    ElMessage.error('获取账号列表失败');
  } finally {
    loading.value = false;
  }
};

// 获取用户列表
const fetchUsers = async () => {
  try {
    const response = await getUserList({ page: 1, limit: 1000 });
    const data = response.data as unknown as UserPaginationResponse;
    users.value = data.users;
  } catch {
    ElMessage.error('获取用户列表失败');
  }
};

// 获取统计数据
const fetchStats = async () => {
  try {
    const response = await getAccountStats();
    stats.value = response.data;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    ElMessage.error('获取统计数据失败');
  }
};

// 刷新统计
const refreshStats = () => {
  fetchStats();
};

// 搜索
const handleSearch = () => {
  pagination.page = 1;
  fetchAccounts();
};

// 重置搜索
const resetSearch = () => {
  Object.assign(searchForm, {
    search: '',
    accountLevel: undefined,
    status: undefined
  });
  handleSearch();
};

// 分页处理
const handleSizeChange = (size: number) => {
  pagination.limit = size;
  fetchAccounts();
};

const handleCurrentChange = (page: number) => {
  pagination.page = page;
  fetchAccounts();
};

// 编辑账号
const editAccount = (account: TiktokAccount) => {
  editingAccount.value = account;
  Object.assign(accountForm, {
    accountUrl: account.accountUrl,
    accountName: account.accountName || '',
    username: account.username || '',
    phoneNumber: account.phoneNumber || '',
    accountLevel: account.accountLevel,
    status: account.status,
    region: account.region || '',
    language: account.language || '',
    notes: account.notes || ''
  });
  showCreateDialog.value = true;
};

// 提交账号表单
const submitAccount = async () => {
  try {
    submitting.value = true;
    if (editingAccount.value) {
      // 更新账号
      await updateTiktokAccount(editingAccount.value.id, accountForm as UpdateTiktokAccountRequest);
      ElMessage.success('账号更新成功');
    } else {
      // 创建账号
      await createTiktokAccount(accountForm);
      ElMessage.success('账号创建成功');
    }
    showCreateDialog.value = false;
    resetAccountForm();
    fetchAccounts();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    ElMessage.error(editingAccount.value ? '账号更新失败' : '账号创建失败');
  } finally {
    submitting.value = false;
  }
};

// 重置账号表单
const resetAccountForm = () => {
  editingAccount.value = null;
  Object.assign(accountForm, {
    accountUrl: '',
    accountName: '',
    username: '',
    phoneNumber: '',
    accountLevel: 'A' as AccountLevel,
    status: 'active' as AccountStatus,
    region: '',
    language: '',
    notes: ''
  });
};

// 分配用户
const assignUser = (account: TiktokAccount) => {
  assigningAccount.value = account;
  assignForm.userId = '';
  assignForm.role = 'operator';
  showAssignDialog.value = true;
};

// 提交分配
const submitAssign = async () => {
  if (!assigningAccount.value) return;
  
  try {
    assigning.value = true;
    await assignUsers(assigningAccount.value.id, assignForm);
    ElMessage.success('用户分配成功');
    showAssignDialog.value = false;
    fetchAccounts();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    ElMessage.error('用户分配失败');
  } finally {
    assigning.value = false;
  }
};

// 删除账号
const deleteAccount = async (account: TiktokAccount) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除账号 "${account.accountName || account.username}" 吗？`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    );
    
    await deleteTiktokAccount(account.id);
    ElMessage.success('账号删除成功');
    fetchAccounts();
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('账号删除失败');
    }
  }
};

// 工具函数
const getLevelTagType = (level: string) => {
  const types: Record<string, string> = {
    A: 'danger',
    B: 'warning',
    C: 'success',
    D: 'info'
  };
  return types[level] || 'info';
};

const getStatusTagType = (status: string) => {
  const types: Record<string, string> = {
    active: 'success',
    inactive: 'info',
    banned: 'danger',
    pending: 'warning'
  };
  return types[status] || 'info';
};

const getStatusText = (status: string) => {
  const texts: Record<string, string> = {
    active: '活跃',
    inactive: '非活跃',
    banned: '封禁',
    pending: '待审核'
  };
  return texts[status] || status;
};

const formatNumber = (num?: number) => {
  if (!num) return '0';
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + 'w';
  }
  return num.toString();
};

// 组件挂载时初始化数据
onMounted(() => {
  fetchAccounts();
  fetchUsers();
  fetchStats();
});
</script>

<style scoped>
.tiktok-account-management {
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header h2 {
  margin: 0;
  color: #303133;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.stats-cards {
  margin-bottom: 20px;
}

.stat-card {
  text-align: center;
}

.stat-content {
  padding: 10px;
}

.stat-number {
  font-size: 24px;
  font-weight: bold;
  color: #409eff;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 14px;
  color: #909399;
}

.search-card {
  margin-bottom: 20px;
}

.table-card {
  margin-bottom: 20px;
}

.stats-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.stats-info span {
  font-size: 12px;
  color: #606266;
}

.assignment-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}
</style>