<template>
  <div class="report-submission">
    <!-- 页面标题和操作按钮 -->
    <div class="page-header">
      <div class="header-left">
        <h2>转化记录提交</h2>
        <p>管理转化记录的提交和查看</p>
      </div>
      <div class="header-right">
        <el-button
          type="primary"
          @click="showCreateDialog"
          v-if="authStore.hasPermission('report_submission:create')"
        >
          <el-icon><Plus /></el-icon>
          新增记录
        </el-button>
      </div>
    </div>

    <!-- 搜索和筛选 -->
    <el-card class="search-card">
      <el-form :model="searchForm" inline>
        <el-form-item label="YAYChat用户ID">
          <el-input
            v-model="searchForm.yaychatUserId"
            placeholder="请输入YAYChat用户ID"
            clearable
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item label="TikTok账号ID">
          <el-input
            v-model="searchForm.tiktokAccountId"
            placeholder="请输入TikTok账号ID"
            clearable
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable>
            <el-option label="待处理" value="pending" />
            <el-option label="已通过" value="approved" />
            <el-option label="已拒绝" value="rejected" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
          <el-button @click="resetSearch">
            <el-icon><Refresh /></el-icon>
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 提示信息 -->
    <el-alert
      v-if="!searchForm.yaychatUserId || !searchForm.tiktokAccountId"
      title="请先输入查询条件"
      description="请在上方搜索框中输入 YAYChat用户ID 和 TikTok账号ID 后点击搜索按钮查看数据"
      type="info"
      :closable="false"
      show-icon
      class="mb-4"
    />

    <!-- 数据表格 -->
    <el-card class="table-card">
      <el-table
        :data="tableData"
        v-loading="loading"
        stripe
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="yaychatUserId" label="YAYChat用户ID" width="150" />
        <el-table-column prop="tiktokAccountId" label="TikTok账号ID" width="150" />
        <el-table-column prop="submissionData" label="转化数据" width="200">
          <template #default="{ row }">
            <el-tooltip :content="JSON.stringify(row.submissionData, null, 2)" placement="top">
              <span class="conversion-data-preview">
                {{ getConversionDataPreview(row.submissionData) }}
              </span>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag
              :type="getStatusTagType(row.status)"
              size="small"
            >
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="submittedAt" label="提交时间" width="180">
          <template #default="{ row }">
            {{ formatDateTime(row.submittedAt) }}
          </template>
        </el-table-column>
        <el-table-column prop="reviewedAt" label="处理时间" width="180">
          <template #default="{ row }">
            {{ row.reviewedAt ? formatDateTime(row.reviewedAt) : '-' }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button
              type="primary"
              size="small"
              @click="showDetailDialog(row)"
              v-if="authStore.hasPermission('report_submission:read')"
            >
              查看
            </el-button>
            <el-button
              type="danger"
              size="small"
              @click="handleDelete(row)"
              v-if="authStore.hasPermission('report_submission:delete')"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.currentPage"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 新增/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="600px"
      @close="resetForm"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="formRules"
        label-width="120px"
      >
        <el-form-item label="YAYChat用户ID" prop="yaychatUserId">
          <el-input
            v-model="form.yaychatUserId"
            placeholder="请输入YAYChat用户ID"
          />
        </el-form-item>
        <el-form-item label="TikTok账号" prop="tiktokAccountId">
          <el-select
            v-model="form.tiktokAccountId"
            placeholder="请选择TikTok账号"
            filterable
            style="width: 100%"
            :loading="loadingAccounts"
          >
            <el-option
              v-for="account in tiktokAccounts"
              :key="account.id"
              :label="`${account.accountName} (@${account.username})`"
              :value="account.id.toString()"
            >
              <div style="display: flex; justify-content: space-between">
                <span>{{ account.accountName }}</span>
                <span style="color: #8492a6; font-size: 13px">@{{ account.username }}</span>
              </div>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="备注" prop="notes">
          <el-input
            v-model="form.notes"
            type="textarea"
            :rows="3"
            placeholder="请输入备注信息"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit" :loading="submitting">
            确定
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="转化记录详情"
      width="800px"
    >
      <div v-if="currentRecord">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="ID">{{ currentRecord.id }}</el-descriptions-item>
          <el-descriptions-item label="YAYChat用户ID">{{ currentRecord.yaychatUserId }}</el-descriptions-item>
          <el-descriptions-item label="TikTok账号ID">{{ currentRecord.tiktokAccountId }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="getStatusTagType(currentRecord.status)">
              {{ getStatusText(currentRecord.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="提交时间">{{ formatDateTime(currentRecord.submittedAt) }}</el-descriptions-item>
          <el-descriptions-item label="处理时间">{{ currentRecord.reviewedAt ? formatDateTime(currentRecord.reviewedAt) : '-' }}</el-descriptions-item>
        </el-descriptions>
        
        <div class="mt-4">
          <h4>提交数据</h4>
          <el-input
            :model-value="JSON.stringify(currentRecord.submissionData, null, 2)"
            type="textarea"
            :rows="10"
            readonly
          />
        </div>
        
        <div class="mt-4" v-if="currentRecord.submissionData?.notes">
          <h4>备注</h4>
          <p>{{ currentRecord.submissionData.notes }}</p>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Plus, Search, Refresh } from '@element-plus/icons-vue';
import { useAuthStore } from '@/stores/auth';
import {
  getReportSubmissions,
  createReportSubmission,
  deleteReportSubmission,
  getReportSubmissionById
} from '@/api/report-submission';
import { getAccountsByUser } from '@/api/tiktok-account';
import type {
  ReportSubmission,
  CreateReportSubmissionRequest,
  GetReportSubmissionsParams,
  TiktokAccount
} from '@/types/api';

// 认证store
const authStore = useAuthStore();

// 表格数据
const tableData = ref<ReportSubmission[]>([]);
const loading = ref(false);
const selectedRows = ref<ReportSubmission[]>([]);

// 搜索表单
const searchForm = reactive({
  yaychatUserId: '',
  tiktokAccountId: '',
  status: ''
});

// 分页
const pagination = reactive({
  currentPage: 1,
  pageSize: 20,
  total: 0
});

// 对话框
const dialogVisible = ref(false);
const detailDialogVisible = ref(false);
const dialogTitle = ref('新增转化记录');
const submitting = ref(false);
const currentRecord = ref<ReportSubmission | null>(null);

// TikTok账号数据
const tiktokAccounts = ref<TiktokAccount[]>([]);
const loadingAccounts = ref(false);

// 表单
const formRef = ref();
const form = reactive({
  yaychatUserId: '',
  tiktokAccountId: '',
  notes: ''
});

// 表单验证规则
const formRules = {
  yaychatUserId: [
    { required: true, message: '请输入YAYChat用户ID', trigger: 'blur' },
    {
      pattern: /^\d{7}$/,
      message: 'YAYChat用户ID必须为7位数字',
      trigger: 'blur'
    }
  ],
  tiktokAccountId: [
    { required: true, message: '请选择TikTok账号', trigger: 'change' }
  ]
};

// 加载TikTok账号列表
async function loadTiktokAccounts() {
  // 使用当前登录用户的ID，而不是yaychat用户ID
  const currentUserId = authStore.user?.id;
  if (!currentUserId) {
    tiktokAccounts.value = [];
    ElMessage.warning('用户未登录或用户信息不完整');
    return;
  }
  
  try {
    loadingAccounts.value = true;
    console.log('正在加载TikTok账号，当前用户ID:', currentUserId);
    const response = await getAccountsByUser(currentUserId.toString(), 'conversion');
    console.log('TikTok账号加载结果:', response.data);
    tiktokAccounts.value = response.data || [];
    if (tiktokAccounts.value.length === 0) {
      console.warn('未找到该用户分配的TikTok账号');
      ElMessage.warning('未找到该用户分配的TikTok账号');
    }
  } catch (error) {
    console.error('加载TikTok账号失败:', error);
    ElMessage.error('加载TikTok账号失败');
    tiktokAccounts.value = [];
  } finally {
    loadingAccounts.value = false;
  }
}

// 获取状态标签类型
function getStatusTagType(status: string) {
  const typeMap: Record<string, string> = {
    pending: 'warning',
    approved: 'success',
    rejected: 'danger'
  };
  return typeMap[status] || 'info';
}

// 获取状态文本
function getStatusText(status: string) {
  const textMap: Record<string, string> = {
    pending: '待处理',
    approved: '已通过',
    rejected: '已拒绝'
  };
  return textMap[status] || status;
}

// 获取转化数据预览
function getConversionDataPreview(data: Record<string, unknown>) {
  if (!data) return '-';
  const str = JSON.stringify(data);
  return str.length > 50 ? str.substring(0, 50) + '...' : str;
}

// 格式化日期时间
function formatDateTime(dateTime: string) {
  if (!dateTime) return '-';
  return new Date(dateTime).toLocaleString('zh-CN');
}

// 加载数据
async function loadData() {
  loading.value = true;
  try {
    // 检查必需参数：yaychatUserId 和 tiktokAccountId
    if (!searchForm.yaychatUserId || !searchForm.tiktokAccountId) {
      // 如果没有提供必需参数，清空数据并提示用户
      tableData.value = [];
      pagination.total = 0;
      loading.value = false;
      return;
    }

    // 验证yaychatUserId格式
    if (!/^\d{7}$/.test(searchForm.yaychatUserId)) {
      ElMessage.error('YAYChat用户ID必须为7位数字');
      tableData.value = [];
      pagination.total = 0;
      loading.value = false;
      return;
    }

    const params: GetReportSubmissionsParams = {
      page: pagination.currentPage,
      limit: pagination.pageSize,
      yaychatUserId: parseInt(searchForm.yaychatUserId),
      tiktokAccountId: parseInt(searchForm.tiktokAccountId),
      ...(searchForm.status && { status: searchForm.status as 'pending' | 'approved' | 'rejected' })
    };
    
    const response = await getReportSubmissions(params);
    if (response.data.data && typeof response.data.data === 'object' && 'items' in response.data.data) {
      const paginationData = response.data.data;
      tableData.value = paginationData.items;
      pagination.total = paginationData.total;
    } else {
      tableData.value = [];
      pagination.total = 0;
    }
  } catch (error) {
    console.error('加载数据失败:', error);
    ElMessage.error('加载数据失败');
  } finally {
    loading.value = false;
  }
}

// 搜索
function handleSearch() {
  pagination.currentPage = 1;
  loadData();
}

// 重置搜索
function resetSearch() {
  Object.assign(searchForm, {
    yaychatUserId: '',
    tiktokAccountId: '',
    status: ''
  });
  pagination.currentPage = 1;
  loadData();
}

// 分页大小改变
function handleSizeChange(size: number) {
  pagination.pageSize = size;
  pagination.currentPage = 1;
  loadData();
}

// 当前页改变
function handleCurrentChange(page: number) {
  pagination.currentPage = page;
  loadData();
}

// 选择改变
function handleSelectionChange(selection: ReportSubmission[]) {
  selectedRows.value = selection;
}

// 显示新增对话框
function showCreateDialog() {
  dialogTitle.value = '新增转化记录';
  // 如果搜索表单中已有用户ID且格式正确，自动填充到新增表单
  if (searchForm.yaychatUserId && /^\d{7}$/.test(searchForm.yaychatUserId)) {
    form.yaychatUserId = searchForm.yaychatUserId;
  }
  // 加载当前登录用户分配的TikTok账号
  loadTiktokAccounts();
  dialogVisible.value = true;
}

// 显示详情对话框
async function showDetailDialog(row: ReportSubmission) {
  try {
    const response = await getReportSubmissionById(row.id);
    currentRecord.value = response.data.data;
    detailDialogVisible.value = true;
  } catch (error) {
    console.error('获取详情失败:', error);
    ElMessage.error('获取详情失败');
  }
}

// 提交表单
async function handleSubmit() {
  if (!formRef.value) return;
  
  try {
    await formRef.value.validate();
    submitting.value = true;
    
    const requestData: CreateReportSubmissionRequest = {
      yaychatUserId: parseInt(form.yaychatUserId),
      tiktokAccountId: parseInt(form.tiktokAccountId),
      submissionData: { notes: form.notes || '' }
    };
    
    await createReportSubmission(requestData);
    ElMessage.success('创建成功');
    dialogVisible.value = false;
    // 新增成功后，如果搜索表单有必需参数，则刷新列表
    if (searchForm.yaychatUserId && searchForm.tiktokAccountId) {
      loadData();
    }
  } catch (error) {
    console.error('提交失败:', error);
    ElMessage.error('提交失败');
  } finally {
    submitting.value = false;
  }
}

// 删除
async function handleDelete(row: ReportSubmission) {
  try {
    await ElMessageBox.confirm(
      `确定要删除ID为 ${row.id} 的转化记录吗？`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    );
    
    await deleteReportSubmission(row.id);
    ElMessage.success('删除成功');
    loadData();
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error);
      ElMessage.error('删除失败');
    }
  }
}

// 重置表单
function resetForm() {
  if (formRef.value) {
    formRef.value.resetFields();
  }
  Object.assign(form, {
    yaychatUserId: '',
    tiktokAccountId: '',
    notes: ''
  });
  tiktokAccounts.value = [];
}

// 监听搜索表单中YAYChat用户ID变化
watch(() => searchForm.yaychatUserId, () => {
  // 当搜索表单中的用户ID变化时，只影响搜索逻辑，不影响新增表单
  // 不需要在这里操作 form.tiktokAccountId 或加载账号列表
  // 新增表单的逻辑由下面的 watch(() => form.yaychatUserId) 处理
});

// 监听表单中YAYChat用户ID变化（用于新增对话框）
watch(() => form.yaychatUserId, () => {
  form.tiktokAccountId = ''; // 清空已选择的TikTok账号
  // 当YAYChat用户ID变化时，TikTok账号列表已经基于当前登录用户加载
  // 不需要重新加载TikTok账号列表
});

// 组件挂载时不自动加载数据，需要用户先输入必需参数
onMounted(() => {
  // 初始化时不加载数据，等待用户输入yaychatUserId和tiktokAccountId后手动搜索
});
</script>

<style scoped>
.report-submission {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header-left h2 {
  margin: 0 0 8px 0;
  color: #303133;
  font-size: 24px;
  font-weight: 600;
}

.header-left p {
  margin: 0;
  color: #909399;
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
  justify-content: flex-end;
  margin-top: 20px;
}

.conversion-data-preview {
  font-family: 'Courier New', monospace;
  font-size: 12px;
  color: #606266;
}

.mt-4 {
  margin-top: 16px;
}

.mb-4 {
  margin-bottom: 16px;
}

.mt-4 h4 {
  margin: 0 0 8px 0;
  color: #303133;
  font-size: 16px;
  font-weight: 600;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>