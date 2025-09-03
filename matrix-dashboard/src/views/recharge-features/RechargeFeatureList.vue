<template>
  <div class="page-container">
    <div class="page-header">
      <h2>充值信息查看</h2>
      <div class="header-actions">
        <el-button 
          type="primary" 
          :icon="RefreshRight"
          @click="fetchData"
          :loading="loading"
        >
          刷新
        </el-button>
      </div>
    </div>

    <div class="page-content">
      <!-- 搜索筛选 -->
      <el-card class="search-card">
        <el-form 
          :model="searchForm" 
          inline 
          @submit.prevent="handleSearch"
        >
          <el-form-item label="手机编号">
            <el-input
              v-model="searchForm.phoneNo"
              placeholder="请输入手机编号"
              clearable
              style="width: 200px"
            />
          </el-form-item>
          <el-form-item label="用户类型">
            <el-select
              v-model="searchForm.userType"
              placeholder="请选择用户类型"
              clearable
              style="width: 150px"
            >
              <el-option label="百元用户" value="hundred" />
              <el-option label="价值用户" value="valuable" />
              <el-option label="普通用户" value="normal" />
            </el-select>
          </el-form-item>
          <el-form-item label="充值金额">
            <el-input-number
              v-model="searchForm.minRecharge"
              placeholder="最小充值"
              :min="0"
              :precision="2"
              style="width: 120px"
            />
            <span style="margin: 0 8px"> - </span>
            <el-input-number
              v-model="searchForm.maxRecharge"
              placeholder="最大充值"
              :min="0"
              :precision="2"
              style="width: 120px"
            />
          </el-form-item>
          <el-form-item label="注册时间">
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
            <el-button type="primary" :icon="Search" @click="handleSearch">
              搜索
            </el-button>
            <el-button :icon="RefreshRight" @click="handleReset">
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
          @sort-change="handleSortChange"
        >
          <el-table-column prop="phone" label="手机编号" width="150" />
          <el-table-column prop="accountUrl" label="账号链接" min-width="200">
            <template #default="{ row }">
              <el-link :href="row.accountUrl" target="_blank" type="primary">
                {{ row.accountUrl }}
              </el-link>
            </template>
          </el-table-column>
          <el-table-column prop="uid" label="YayChat UID" width="120" />
          <el-table-column prop="totalRecharge" label="总充值" width="120" sortable="custom">
            <template #default="{ row }">
              <span class="amount">{{ formatCurrency(row.totalRecharge) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="近期金币" width="200">
            <template #default="{ row }">
              <div class="coin-info">
                <div><span class="label">1天:</span> {{ row.day1Coin }}</div>
                <div><span class="label">7天:</span> {{ row.day7Coin }}</div>
                <div><span class="label">30天:</span> {{ row.day30Coin }}</div>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="用户类型" width="120">
            <template #default="{ row }">
              <div class="user-type">
                <el-tag v-if="row.hundredUser" type="warning" size="small">百元用户</el-tag>
                <el-tag v-if="row.valuableUser" type="success" size="small">价值用户</el-tag>
                <span v-if="!row.hundredUser && !row.valuableUser" class="text-muted">普通用户</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="registerTime" label="注册时间" width="180" sortable="custom">
            <template #default="{ row }">
              {{ formatDateTime(row.registerTime) }}
            </template>
          </el-table-column>
          <el-table-column prop="lastUpdatedAt" label="更新时间" width="180" sortable="custom">
            <template #default="{ row }">
              {{ formatDateTime(row.lastUpdatedAt) }}
            </template>
          </el-table-column>
        </el-table>

        <!-- 分页 -->
        <div class="pagination-container">
          <el-pagination
            v-model:current-page="pagination.page"
            v-model:page-size="pagination.size"
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
import { Search, RefreshRight } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { getRechargeInfos } from '@/api/recharge-features'
import { useUserStore } from '@/stores/user'
import type { RechargeInfo, QueryRechargeInfoParams } from '@/types/business'

const userStore = useUserStore()

const loading = ref(false)
const tableData = ref<RechargeInfo[]>([])

// 搜索表单
const searchForm = reactive({
  phoneNo: '',
  userType: '',
  minRecharge: undefined as number | undefined,
  maxRecharge: undefined as number | undefined,
  dateRange: null as [string, string] | null
})

// 分页
const pagination = reactive({
  page: 1,
  size: 20,
  total: 0
})

// 获取数据
const fetchData = async () => {
  loading.value = true
  try {
    const params: QueryRechargeInfoParams = {
      page: pagination.page,
      pageSize: pagination.size,
      ownerId: userStore.userInfo?.id?.toString() // 只查看归属于当前用户的账号
    }

    // 添加搜索条件
    if (searchForm.phoneNo) {
      params.phoneNos = [searchForm.phoneNo]
    }

    // 实际API调用
    const response = await getRechargeInfos(params)
    tableData.value = response.data.data.items || []
    pagination.total = response.data.data.total
  } catch (error) {
    console.error('获取数据失败:', error)
    ElMessage.error('获取数据失败')
  } finally {
    loading.value = false
  }
}



// 搜索
const handleSearch = () => {
  pagination.page = 1
  fetchData()
}

// 重置
const handleReset = () => {
  Object.assign(searchForm, {
    phoneNo: '',
    userType: '',
    minRecharge: undefined,
    maxRecharge: undefined,
    dateRange: null
  })
  handleSearch()
}

// 排序
const handleSortChange = ({ prop, order }: { prop: string; order: string }) => {
  console.log('排序:', prop, order)
  fetchData()
}

// 分页
const handleSizeChange = (size: number) => {
  pagination.size = size
  pagination.page = 1
  fetchData()
}

const handleCurrentChange = (page: number) => {
  pagination.page = page
  fetchData()
}

// 格式化日期时间
const formatDateTime = (timestamp: number | string) => {
  if (typeof timestamp === 'number') {
    return new Date(timestamp).toLocaleString('zh-CN')
  }
  return new Date(timestamp).toLocaleString('zh-CN')
}

// 格式化货币（将美分转换为美元）
const formatCurrency = (amountInCents: number) => {
  const dollars = amountInCents / 100
  return `$${dollars.toFixed(2)}`
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.page-container {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0;
  color: #303133;
}

.search-card {
  margin-bottom: 20px;
}

.table-card {
  margin-bottom: 0;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.amount {
  color: #67c23a;
  font-weight: 600;
}

.coin-info {
  font-size: 12px;
  line-height: 1.4;
}

.coin-info .label {
  color: #909399;
  margin-right: 4px;
}

.user-type {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.text-muted {
  color: #909399;
}

.text-danger {
  color: #f56c6c;
}
</style>