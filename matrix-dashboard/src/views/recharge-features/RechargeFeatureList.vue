<template>
  <div class="page-container">
    <div class="page-header">
      <h2>充值特征管理</h2>
      <div class="header-actions">
        <el-button 
          type="primary" 
          :icon="Refresh"
          @click="handleBatchSync"
          :loading="syncLoading"
          v-if="userStore.hasPermission('recharge_feature:sync')"
        >
          批量同步
        </el-button>
        <el-button 
          type="success" 
          :icon="Upload"
          @click="showBatchQueryDialog = true"
          v-if="userStore.hasPermission('recharge_feature:query')"
        >
          批量查询
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
              v-model="searchForm.phone"
              placeholder="请输入手机编号"
              clearable
              style="width: 200px"
            />
          </el-form-item>
          <el-form-item label="同步状态">
            <el-select
              v-model="searchForm.syncStatus"
              placeholder="请选择同步状态"
              clearable
              style="width: 150px"
            >
              <el-option label="已同步" value="synced" />
              <el-option label="未同步" value="not_synced" />
              <el-option label="同步失败" value="sync_failed" />
            </el-select>
          </el-form-item>
          <el-form-item label="特征状态">
            <el-select
              v-model="searchForm.featureStatus"
              placeholder="请选择特征状态"
              clearable
              style="width: 150px"
            >
              <el-option label="有充值" value="has_recharge" />
              <el-option label="无充值" value="no_recharge" />
            </el-select>
          </el-form-item>
          <el-form-item label="更新时间">
            <el-date-picker
              v-model="searchForm.dateRange"
              type="datetimerange"
              range-separator="至"
              start-placeholder="开始时间"
              end-placeholder="结束时间"
              format="YYYY-MM-DD HH:mm:ss"
              value-format="YYYY-MM-DD HH:mm:ss"
              style="width: 350px"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch" :icon="Search">
              搜索
            </el-button>
            <el-button @click="handleReset" :icon="RefreshRight">
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
          <el-table-column prop="syncStatus" label="同步状态" width="120">
            <template #default="{ row }">
              <el-tag 
                :type="getSyncStatusColor(row.syncStatus)"
                size="small"
              >
                {{ getSyncStatusText(row.syncStatus) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="featureStatus" label="特征状态" width="120">
            <template #default="{ row }">
              <el-tag 
                :type="getFeatureStatusColor(row.featureStatus)"
                size="small"
              >
                {{ getFeatureStatusText(row.featureStatus) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="totalAmount" label="充值总额" width="120">
            <template #default="{ row }">
              <span v-if="row.totalAmount !== null">
                ¥{{ row.totalAmount?.toFixed(2) }}
              </span>
              <span v-else class="text-muted">-</span>
            </template>
          </el-table-column>
          <el-table-column prop="rechargeCount" label="充值次数" width="100">
            <template #default="{ row }">
              <span v-if="row.rechargeCount !== null">
                {{ row.rechargeCount }}
              </span>
              <span v-else class="text-muted">-</span>
            </template>
          </el-table-column>
          <el-table-column prop="lastRechargeTime" label="最后充值时间" width="180">
            <template #default="{ row }">
              <span v-if="row.lastRechargeTime">
                {{ formatDateTime(row.lastRechargeTime) }}
              </span>
              <span v-else class="text-muted">-</span>
            </template>
          </el-table-column>
          <el-table-column prop="updatedAt" label="更新时间" width="180" sortable="custom">
            <template #default="{ row }">
              {{ formatDateTime(row.updatedAt) }}
            </template>
          </el-table-column>
          <el-table-column prop="syncError" label="同步错误" min-width="200">
            <template #default="{ row }">
              <span v-if="row.syncError" class="text-danger">
                {{ row.syncError }}
              </span>
              <span v-else class="text-muted">-</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="120" fixed="right">
            <template #default="{ row }">
              <el-button 
                type="primary" 
                size="small" 
                @click="handleSyncSingle(row)"
                :loading="row.syncing"
                v-if="userStore.hasPermission('recharge_feature:sync')"
              >
                同步
              </el-button>
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

    <!-- 批量查询对话框 -->
    <el-dialog
      v-model="showBatchQueryDialog"
      title="批量查询充值特征"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form :model="batchQueryForm" label-width="100px">
        <el-form-item label="查询方式">
          <el-radio-group v-model="batchQueryForm.queryType">
            <el-radio value="text">文本输入</el-radio>
            <el-radio value="file">文件上传</el-radio>
          </el-radio-group>
        </el-form-item>
        
        <el-form-item 
          label="手机编号列表" 
          v-if="batchQueryForm.queryType === 'text'"
        >
          <el-input
            v-model="batchQueryForm.phoneList"
            type="textarea"
            :rows="8"
            placeholder="请输入手机编号，每行一个（如：us-1、美国1、云845）"
          />
        </el-form-item>
        
        <el-form-item 
          label="上传文件" 
          v-if="batchQueryForm.queryType === 'file'"
        >
          <el-upload
            ref="uploadRef"
            :auto-upload="false"
            :show-file-list="true"
            :limit="1"
            accept=".txt,.csv"
            :on-change="handleFileChange"
          >
            <el-button type="primary">选择文件</el-button>
            <template #tip>
              <div class="el-upload__tip">
                支持 .txt 和 .csv 文件，每行一个手机编号
              </div>
            </template>
          </el-upload>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="showBatchQueryDialog = false">取消</el-button>
        <el-button 
          type="primary" 
          @click="handleBatchQuery"
          :loading="batchQueryLoading"
        >
          开始查询
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { Search, Refresh, Upload, Download, RefreshRight } from '@element-plus/icons-vue'
import { ElMessageBox } from 'element-plus'
import { getRechargeFeatures, syncRechargeFeatures } from '@/api/recharge-features'
import { useUserStore } from '@/stores/user'
import type { RechargeFeature } from '@/types/business'
import { successMessage, errorMessage, confirmDialog } from '@/utils/message'
import { formatDateTime as formatDate, formatNumber } from '@/utils/date'

const userStore = useUserStore()

const loading = ref(false)
const syncLoading = ref(false)
const batchQueryLoading = ref(false)
const showBatchQueryDialog = ref(false)
const tableData = ref<RechargeFeature[]>([])

// 搜索表单
const searchForm = reactive({
  phone: '',
  syncStatus: '',
  featureStatus: '',
  dateRange: null as [string, string] | null
})

// 分页
const pagination = reactive({
  page: 1,
  size: 20,
  total: 0
})

// 批量查询表单
const batchQueryForm = reactive({
  queryType: 'text',
  phoneList: '',
  file: null as File | null
})

// 获取数据
const fetchData = async () => {
  loading.value = true
  try {
    // 手机编号格式示例
    const phoneFormats = [
      () => `us-${Math.floor(Math.random() * 999) + 1}`,
      () => `美国${Math.floor(Math.random() * 999) + 1}`,
      () => `云${Math.floor(Math.random() * 999) + 1}`,
      () => `uk-${Math.floor(Math.random() * 999) + 1}`,
      () => `英国${Math.floor(Math.random() * 999) + 1}`,
      () => `jp-${Math.floor(Math.random() * 999) + 1}`,
      () => `日本${Math.floor(Math.random() * 999) + 1}`,
      () => `ca-${Math.floor(Math.random() * 999) + 1}`,
      () => `加拿大${Math.floor(Math.random() * 999) + 1}`,
      () => `au-${Math.floor(Math.random() * 999) + 1}`
    ]
    
    // 模拟API调用
    const mockData: RechargeFeature[] = Array.from({ length: pagination.size }, (_, index) => {
      const phoneFormat = phoneFormats[Math.floor(Math.random() * phoneFormats.length)]
      return {
        id: `rf_${pagination.page}_${index + 1}`,
        phone: phoneFormat(),
        accountUrl: `https://example.com/account/${index + 1}`,
        syncStatus: ['synced', 'not_synced', 'sync_failed'][Math.floor(Math.random() * 3)] as 'synced' | 'not_synced' | 'sync_failed',
        featureStatus: Math.random() > 0.3 ? 'has_recharge' : 'no_recharge' as 'has_recharge' | 'no_recharge',
        totalAmount: Math.random() > 0.3 ? Math.floor(Math.random() * 10000) + 100 : null,
        rechargeCount: Math.random() > 0.3 ? Math.floor(Math.random() * 50) + 1 : null,
        lastRechargeTime: Math.random() > 0.3 ? new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString() : null,
        updatedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        syncError: Math.random() > 0.8 ? '网络连接超时' : null,
        syncing: false
      }
    })
    
    tableData.value = mockData
    pagination.total = 156 // 模拟总数
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
    phone: '',
    syncStatus: '',
    featureStatus: '',
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

// 批量同步
const handleBatchSync = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要批量同步充值特征吗？此操作可能需要较长时间。',
      '确认同步',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    syncLoading.value = true
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 2000))
    ElMessage.success('批量同步任务已启动，请稍后查看结果')
    fetchData()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('批量同步失败:', error)
      ElMessage.error('批量同步失败')
    }
  } finally {
    syncLoading.value = false
  }
}

// 单个同步
const handleSyncSingle = async (row: RechargeFeature) => {
  try {
    row.syncing = true
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 2000))
    row.syncStatus = 'synced'
    row.updatedAt = new Date().toISOString()
    ElMessage.success('同步成功')
  } catch (error) {
    console.error('同步失败:', error)
    ElMessage.error('同步失败')
  } finally {
    row.syncing = false
  }
}

// 文件上传
const handleFileChange = (file: any) => {
  batchQueryForm.file = file.raw
}

// 批量查询
const handleBatchQuery = async () => {
  let phoneNumbers: string[] = []
  
  if (batchQueryForm.queryType === 'text') {
    if (!batchQueryForm.phoneList.trim()) {
      ElMessage.warning('请输入手机编号列表')
      return
    }
    phoneNumbers = batchQueryForm.phoneList
      .split('\n')
      .map(phone => phone.trim())
      .filter(phone => phone)
  } else {
    if (!batchQueryForm.file) {
      ElMessage.warning('请选择文件')
      return
    }
    // 读取文件内容
    const text = await new Promise<string>((resolve) => {
      const reader = new FileReader()
      reader.onload = (e) => resolve(e.target?.result as string || '')
      reader.readAsText(batchQueryForm.file!)
    })
    phoneNumbers = text
      .split('\n')
      .map(phone => phone.trim())
      .filter(phone => phone)
  }
  
  if (phoneNumbers.length === 0) {
    ElMessage.warning('未找到有效的手机编号')
    return
  }
  
  if (phoneNumbers.length > 1000) {
    ElMessage.warning('单次查询手机编号数量不能超过1000个')
    return
  }
  
  try {
    batchQueryLoading.value = true
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    ElMessage.success(`批量查询任务已启动，共${phoneNumbers.length}个手机编号`)
    showBatchQueryDialog.value = false
    
    // 重置表单
    Object.assign(batchQueryForm, {
      queryType: 'text',
      phoneList: '',
      file: null
    })
    
    fetchData()
  } catch (error) {
    console.error('批量查询失败:', error)
    ElMessage.error('批量查询失败')
  } finally {
    batchQueryLoading.value = false
  }
}

// 获取同步状态颜色
const getSyncStatusColor = (status: string): 'success' | 'info' | 'warning' | 'danger' | '' => {
  const colorMap: Record<string, 'success' | 'info' | 'warning' | 'danger' | ''> = {
    'synced': 'success',
    'not_synced': 'info',
    'sync_failed': 'danger'
  }
  return colorMap[status] || 'info'
}

// 获取同步状态文本
const getSyncStatusText = (status: string) => {
  const textMap: Record<string, string> = {
    'synced': '已同步',
    'not_synced': '未同步',
    'sync_failed': '同步失败'
  }
  return textMap[status] || status
}

// 获取特征状态颜色
const getFeatureStatusColor = (status: string): 'success' | 'info' | 'warning' | 'danger' | '' => {
  const colorMap: Record<string, 'success' | 'info' | 'warning' | 'danger' | ''> = {
    'has_recharge': 'success',
    'no_recharge': 'info'
  }
  return colorMap[status] || 'info'
}

// 获取特征状态文本
const getFeatureStatusText = (status: string) => {
  const textMap: Record<string, string> = {
    'has_recharge': '有充值',
    'no_recharge': '无充值'
  }
  return textMap[status] || status
}

// 格式化日期时间
const formatDateTime = (dateStr: string) => {
  return new Date(dateStr).toLocaleString('zh-CN')
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
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

.text-muted {
  color: var(--el-text-color-secondary);
}

.text-danger {
  color: var(--el-color-danger);
}

.header-actions {
  display: flex;
  gap: 12px;
}

:deep(.el-upload__tip) {
  margin-top: 8px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
</style>