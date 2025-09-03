<template>
  <div class="page-container">
    <div class="page-header">
      <h2>转化管理</h2>
      <div class="header-actions">
        <el-button 
          type="primary" 
          :icon="Plus"
          @click="handleCreate"
          v-if="userStore.hasPermission('conversion:create')"
        >
          提交用户
        </el-button>
      </div>
    </div>

    <div class="page-content">
      <!-- 搜索筛选 -->
      <el-card class="search-card">
        <el-form
          :model="searchForm"
          :inline="true"
          label-width="80px"
          size="default"
        >
          <el-form-item label="手机编号">
            <el-input
              v-model="searchForm.phone"
              placeholder="请输入手机编号"
              clearable
              style="width: 200px"
            />
          </el-form-item>
          <el-form-item label="转化状态">
            <el-select
              v-model="searchForm.status"
              placeholder="请选择状态"
              clearable
              style="width: 150px"
            >
              <el-option
                v-for="option in statusOptions"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="提交人">
            <el-input
              v-model="searchForm.submitter"
              placeholder="请输入提交人"
              clearable
              style="width: 150px"
            />
          </el-form-item>
          <el-form-item label="提交时间">
            <el-date-picker
              v-model="searchForm.dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              style="width: 240px"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch" :loading="loading">
              搜索
            </el-button>
            <el-button @click="handleReset">
              重置
            </el-button>
          </el-form-item>
        </el-form>
      </el-card>

      <!-- 数据表格 -->
      <el-card class="table-card">
        <el-table
          :data="tableData"
          v-loading="loading"
          stripe
          border
          style="width: 100%"
          @sort-change="handleSortChange"
        >
          <el-table-column
            prop="phone"
            label="手机编号"
            width="120"
            show-overflow-tooltip
          />
          <el-table-column
            prop="accountUrl"
            label="账号链接"
            min-width="200"
            show-overflow-tooltip
          >
            <template #default="{ row }">
              <el-link :href="row.accountUrl" target="_blank" type="primary">
                {{ row.accountUrl }}
              </el-link>
            </template>
          </el-table-column>
          <el-table-column
            prop="conversionType"
            label="转化类型"
            width="100"
          >
            <template #default="{ row }">
              <el-tag size="small" :type="getConversionTypeColor(row.conversionType)">
                {{ getConversionTypeText(row.conversionType) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column
            prop="status"
            label="转化状态"
            width="100"
          >
            <template #default="{ row }">
              <el-tag size="small" :type="getStatusColor(row.status)">
                {{ getStatusText(row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column
            prop="submitter"
            label="提交人"
            width="100"
            show-overflow-tooltip
          />
          <el-table-column
            prop="submittedAt"
            label="提交时间"
            width="160"
            sortable="custom"
          >
            <template #default="{ row }">
              {{ formatDateTime(row.submittedAt) }}
            </template>
          </el-table-column>
          <el-table-column
            prop="processedAt"
            label="处理时间"
            width="160"
          >
            <template #default="{ row }">
              {{ row.processedAt ? formatDateTime(row.processedAt) : '-' }}
            </template>
          </el-table-column>
          <el-table-column
            label="操作"
            width="120"
            fixed="right"
          >
            <template #default="{ row }">
              <el-button
                type="primary"
                size="small"
                @click="handleView(row)"
                v-if="userStore.hasPermission('conversion:view')"
              >
                查看
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- 分页 -->
        <div class="pagination-container">
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
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Search, Plus, View } from '@element-plus/icons-vue'
import { getConversionList } from '@/api/conversions'
import { useUserStore } from '@/stores/user'
import type { Conversion, PaginationParams } from '@/types/business'
import { CONVERSION_STATUS_LABELS, CONVERSION_STATUS_COLORS, CONVERSION_TYPE_LABELS, CONVERSION_TYPE_COLORS, APP_CONFIG } from '@/constants'
import { errorMessage } from '@/utils/message'
import { formatDateTime as utilFormatDateTime } from '@/utils/date'

const router = useRouter()
const userStore = useUserStore()

const loading = ref(false)
const tableData = ref<Conversion[]>([])

// 搜索表单
const searchForm = reactive({
  phone: '',
  status: '',
  submitter: '',
  dateRange: [] as string[]
})

// 分页参数
const pagination = reactive({
  page: 1,
  pageSize: 20,
  total: 0
})

// 排序参数
const sortParams = reactive({
  sortBy: '',
  sortOrder: ''
})

// 状态选项
const statusOptions = [
  { label: '待处理', value: 'pending' },
  { label: '处理中', value: 'processing' },
  { label: '成功', value: 'success' },
  { label: '失败', value: 'failed' }
]

// 获取转化列表
const fetchConversionList = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.page,
      pageSize: pagination.pageSize,
      phone: searchForm.phone || undefined,
      status: searchForm.status || undefined,
      submitter: searchForm.submitter || undefined,
      startDate: searchForm.dateRange[0] || undefined,
      endDate: searchForm.dateRange[1] || undefined,
      sortBy: sortParams.sortBy || undefined,
      sortOrder: sortParams.sortOrder || undefined
    }

    const response = await getConversionList(params)
    tableData.value = response.data.data.items || []
    pagination.total = response.data.data.total
  } catch (error) {
    console.error('获取转化列表失败:', error)
    ElMessage.error('获取转化列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.page = 1
  fetchConversionList()
}

// 重置搜索
const handleReset = () => {
  Object.assign(searchForm, {
    phone: '',
    status: '',
    submitter: '',
    dateRange: []
  })
  pagination.page = 1
  fetchConversionList()
}

// 排序变化
const handleSortChange = ({ prop, order }: { prop: string; order: string }) => {
  sortParams.sortBy = prop
  sortParams.sortOrder = order === 'ascending' ? 'asc' : 'desc'
  fetchConversionList()
}

// 分页大小变化
const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  pagination.page = 1
  fetchConversionList()
}

// 当前页变化
const handleCurrentChange = (page: number) => {
  pagination.page = page
  fetchConversionList()
}

// 创建转化
const handleCreate = () => {
  router.push('/conversions/create')
}

// 查看详情
const handleView = (row: Conversion) => {
  router.push(`/conversions/detail/${row.id}`)
}

// 获取转化类型颜色
const getConversionTypeColor = (type: string): 'primary' | 'success' | 'warning' | 'info' | 'danger' => {
  const colorMap: Record<string, 'primary' | 'success' | 'warning' | 'info' | 'danger'> = {
    'register': 'success',
    'recharge': 'warning',
    'withdraw': 'danger'
  }
  return colorMap[type] || 'info'
}

// 获取转化类型文本
const getConversionTypeText = (type: string) => {
  const textMap: Record<string, string> = {
    'register': '注册',
    'recharge': '充值',
    'withdraw': '提现'
  }
  return textMap[type] || type
}

// 获取状态颜色
const getStatusColor = (status: string): 'primary' | 'success' | 'warning' | 'info' | 'danger' => {
  const colorMap: Record<string, 'primary' | 'success' | 'warning' | 'info' | 'danger'> = {
    'pending': 'info',
    'processing': 'warning',
    'success': 'success',
    'failed': 'danger'
  }
  return colorMap[status] || 'info'
}

// 获取状态文本
const getStatusText = (status: string) => {
  const textMap: Record<string, string> = {
    'pending': '待处理',
    'processing': '处理中',
    'success': '成功',
    'failed': '失败'
  }
  return textMap[status] || status
}

// 格式化日期时间
const formatDateTime = (dateStr: string) => {
  return utilFormatDateTime(dateStr)
}

onMounted(() => {
  fetchConversionList()
})
</script>

<style scoped>
.search-card {
  margin-bottom: 16px;
}

.table-card {
  margin-bottom: 0;
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

.header-actions {
  display: flex;
  gap: 8px;
}

:deep(.el-table .el-table__cell) {
  padding: 8px 0;
}

:deep(.el-form--inline .el-form-item) {
  margin-right: 16px;
  margin-bottom: 16px;
}
</style>