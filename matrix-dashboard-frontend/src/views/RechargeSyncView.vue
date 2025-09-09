<template>
  <div class="recharge-sync">
    <!-- 页面标题 -->
    <div class="page-header">
      <div class="header-left">
        <h2>充值同步</h2>
        <p>管理用户充值功能同步和API连接测试</p>
      </div>
    </div>

    <!-- 功能卡片 -->
    <div class="feature-cards">
      <!-- API连接测试 -->
      <el-card class="feature-card">
        <template #header>
          <div class="card-header">
            <el-icon class="header-icon"><Connection /></el-icon>
            <span>API连接测试</span>
          </div>
        </template>
        <div class="card-content">
          <p>测试与YAY充值系统的API连接状态</p>
          <el-button
            type="primary"
            @click="testApiConnection"
            :loading="testingConnection"
            v-if="authStore.hasPermission('recharge:test')"
          >
            <el-icon><Refresh /></el-icon>
            测试连接
          </el-button>
          <div v-if="connectionStatus" class="status-info">
            <el-tag :type="connectionStatus.success ? 'success' : 'danger'">
              {{ connectionStatus.success ? "连接正常" : "连接失败" }}
            </el-tag>
            <p class="status-message">{{ connectionStatus.message }}</p>
          </div>
        </div>
      </el-card>

      <!-- YAY登录调试 -->
      <el-card class="feature-card">
        <template #header>
          <div class="card-header">
            <el-icon class="header-icon"><User /></el-icon>
            <span>YAY登录调试</span>
          </div>
        </template>
        <div class="card-content">
          <p>调试YAY系统登录功能</p>
          <el-button
            type="warning"
            @click="debugYayLogin"
            :loading="debuggingLogin"
            v-if="authStore.hasPermission('recharge:debug')"
          >
            <el-icon><Tools /></el-icon>
            调试登录
          </el-button>
          <div v-if="debugResult" class="debug-info">
            <el-tag :type="debugResult.success ? 'success' : 'danger'">
              {{ debugResult.success ? "调试成功" : "调试失败" }}
            </el-tag>
            <p class="debug-message">{{ debugResult.message }}</p>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 充值功能管理 -->
    <el-card class="sync-card">
      <template #header>
        <div class="card-header">
          <el-icon class="header-icon"><CreditCard /></el-icon>
          <span>充值功能管理</span>
        </div>
      </template>

      <!-- 搜索和操作 -->
      <div class="sync-controls">
        <el-form :model="searchForm" inline>
          <el-form-item label="用户ID">
            <el-input
              v-model="searchForm.userId"
              placeholder="请输入用户ID"
              clearable
              @keyup.enter="handleSearch"
            />
          </el-form-item>
          <el-form-item label="功能状态">
            <el-select v-model="searchForm.status" placeholder="请选择状态" clearable>
              <el-option label="激活" value="active" />
              <el-option label="未激活" value="inactive" />
            </el-select>
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

        <div class="sync-actions">
          <el-button
            type="success"
            @click="showSyncDialog"
            v-if="authStore.hasPermission('recharge:sync')"
          >
            <el-icon><Refresh /></el-icon>
            同步功能
          </el-button>
          <el-button
            type="info"
            @click="showBatchSyncDialog"
            v-if="authStore.hasPermission('recharge:batch_sync')"
          >
            <el-icon><Upload /></el-icon>
            批量同步
          </el-button>
          <el-button
            type="primary"
            @click="showHistoryDialog"
            v-if="authStore.hasPermission('recharge:history')"
          >
            <el-icon><Clock /></el-icon>
            同步历史
          </el-button>
        </div>
      </div>

      <!-- 功能列表 -->
      <el-table :data="featureList" v-loading="loading" stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="userId" label="用户ID" width="120" />
        <el-table-column prop="feature" label="功能名称" min-width="150" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : 'info'">
              {{ row.status === "active" ? "激活" : "未激活" }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column prop="updatedAt" label="更新时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.updatedAt) }}
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

    <!-- 同步功能对话框 -->
    <el-dialog title="同步充值功能" v-model="syncDialogVisible" width="500px">
      <el-form :model="syncForm" label-width="80px">
        <el-form-item label="用户ID" required>
          <el-input v-model="syncForm.userIds" placeholder="请输入用户ID，多个用逗号分隔" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="syncDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSync" :loading="syncing"> 开始同步 </el-button>
      </template>
    </el-dialog>

    <!-- 批量同步对话框 -->
    <el-dialog title="批量同步充值功能" v-model="batchSyncDialogVisible" width="600px">
      <div class="batch-sync-content">
        <el-alert
          title="批量同步说明"
          description="上传包含用户ID的文件进行批量同步，支持CSV和TXT格式"
          type="info"
          :closable="false"
          style="margin-bottom: 20px"
        />
        <el-upload
          ref="uploadRef"
          :auto-upload="false"
          :limit="1"
          accept=".csv,.txt"
          :on-change="handleFileChange"
        >
          <el-button type="primary">
            <el-icon><Upload /></el-icon>
            选择文件
          </el-button>
        </el-upload>
        <div v-if="selectedFile" class="file-info">
          <p>已选择文件: {{ selectedFile.name }}</p>
        </div>
      </div>
      <template #footer>
        <el-button @click="batchSyncDialogVisible = false">取消</el-button>
        <el-button
          type="primary"
          @click="handleBatchSync"
          :loading="batchSyncing"
          :disabled="!selectedFile"
        >
          开始批量同步
        </el-button>
      </template>
    </el-dialog>

    <!-- 同步历史对话框 -->
    <el-dialog title="同步历史" v-model="historyDialogVisible" width="800px">
      <el-table :data="syncHistory" v-loading="loadingHistory">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="userIds" label="用户ID" min-width="150" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'success' ? 'success' : 'danger'">
              {{ row.status === "success" ? "成功" : "失败" }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="message" label="结果" min-width="200" show-overflow-tooltip />
        <el-table-column prop="createdAt" label="同步时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { ElMessage, type UploadInstance, type UploadFile } from "element-plus";
import { Tools } from "@element-plus/icons-vue";
import { useAuthStore } from "@/stores/auth";
import {
  getRechargeFeatures,
  syncRechargeFeatures,
  batchSyncRechargeFeatures,
  getSyncHistory,
  debugYayLogin as debugYayLoginApi,
  testApiConnection as testApiConnectionApi,
} from "@/api/recharge";
import type { RechargeFeature, GetRechargeFeaturesParams, SyncHistoryRecord } from "@/types/api";

const authStore = useAuthStore();

// 响应式数据
const loading = ref(false);
const testingConnection = ref(false);
const debuggingLogin = ref(false);
const syncing = ref(false);
const batchSyncing = ref(false);
const loadingHistory = ref(false);
const syncDialogVisible = ref(false);
const batchSyncDialogVisible = ref(false);
const historyDialogVisible = ref(false);
const featureList = ref<RechargeFeature[]>([]);
const syncHistory = ref<SyncHistoryRecord[]>([]);
const connectionStatus = ref<{ success: boolean; message: string } | null>(null);
const debugResult = ref<{ success: boolean; message: string } | null>(null);
const selectedFile = ref<File | null>(null);
const uploadRef = ref<UploadInstance>();

// 搜索表单
const searchForm = reactive({
  userId: "",
  status: "",
});

// 分页数据
const pagination = reactive({
  page: 1,
  size: 20,
  total: 0,
});

// 同步表单
const syncForm = reactive({
  userIds: "",
});

/**
 * 格式化日期
 */
const formatDate = (date: string) => {
  return new Date(date).toLocaleString("zh-CN");
};

/**
 * 加载充值功能列表
 */
const loadFeatureList = async () => {
  try {
    loading.value = true;
    const params: GetRechargeFeaturesParams = {
      page: pagination.page,
      pageSize: pagination.size,
      userId: searchForm.userId || undefined,
      status: (searchForm.status as "active" | "inactive") || undefined,
    };
    const response = await getRechargeFeatures(params);
    featureList.value = response.data.items || [];
    pagination.total = response.data.total || 0;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    ElMessage.error("加载充值功能列表失败");
    // 加载充值功能列表失败
  } finally {
    loading.value = false;
  }
};

/**
 * 测试API连接
 */
const testApiConnection = async () => {
  try {
    testingConnection.value = true;
    const response = await testApiConnectionApi();
    connectionStatus.value = response.data;
    ElMessage.success("API连接测试完成");
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    connectionStatus.value = { success: false, message: "连接测试失败" };
    ElMessage.error("API连接测试失败");
    // API连接测试失败
  } finally {
    testingConnection.value = false;
  }
};

/**
 * 调试YAY登录
 */
const debugYayLogin = async () => {
  try {
    debuggingLogin.value = true;
    const response = await debugYayLoginApi();
    debugResult.value = response.data;
    ElMessage.success("YAY登录调试完成");
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    debugResult.value = { success: false, message: "登录调试失败" };
    ElMessage.error("YAY登录调试失败");
    // YAY登录调试失败
  } finally {
    debuggingLogin.value = false;
  }
};

/**
 * 搜索功能
 */
const handleSearch = () => {
  pagination.page = 1;
  loadFeatureList();
};

/**
 * 重置搜索
 */
const handleReset = () => {
  Object.assign(searchForm, {
    userId: "",
    status: "",
  });
  pagination.page = 1;
  loadFeatureList();
};

/**
 * 分页大小改变
 */
const handleSizeChange = (size: number) => {
  pagination.size = size;
  pagination.page = 1;
  loadFeatureList();
};

/**
 * 当前页改变
 */
const handleCurrentChange = (page: number) => {
  pagination.page = page;
  loadFeatureList();
};

/**
 * 显示同步对话框
 */
const showSyncDialog = () => {
  syncForm.userIds = "";
  syncDialogVisible.value = true;
};

/**
 * 显示批量同步对话框
 */
const showBatchSyncDialog = () => {
  selectedFile.value = null;
  batchSyncDialogVisible.value = true;
};

/**
 * 显示历史对话框
 */
const showHistoryDialog = async () => {
  try {
    loadingHistory.value = true;
    historyDialogVisible.value = true;
    const response = await getSyncHistory({});
    syncHistory.value = response.data.items || [];
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    ElMessage.error("加载同步历史失败");
    // 加载同步历史失败
  } finally {
    loadingHistory.value = false;
  }
};

/**
 * 处理同步
 */
const handleSync = async () => {
  if (!syncForm.userIds.trim()) {
    ElMessage.warning("请输入用户ID");
    return;
  }

  try {
    syncing.value = true;
    const response = await syncRechargeFeatures({ userIds: syncForm.userIds });
    if (response.data.success) {
      ElMessage.success("同步成功");
      syncDialogVisible.value = false;
      loadFeatureList();
    } else {
      ElMessage.error(response.data.message || "同步失败");
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    ElMessage.error("同步失败");
    // 同步失败
  } finally {
    syncing.value = false;
  }
};

/**
 * 处理文件选择
 */
const handleFileChange = (file: UploadFile) => {
  selectedFile.value = file.raw || null;
};

/**
 * 处理批量同步
 */
const handleBatchSync = async () => {
  if (!selectedFile.value) {
    ElMessage.warning("请选择文件");
    return;
  }

  try {
    batchSyncing.value = true;
    // 读取文件内容并解析用户ID
    const text = await selectedFile.value.text();
    const userIds = text
      .split(/[\n,]/)
      .map((id) => id.trim())
      .filter((id) => id);

    const response = await batchSyncRechargeFeatures(userIds);
    if (response.data.success) {
      ElMessage.success("批量同步成功");
      batchSyncDialogVisible.value = false;
      loadFeatureList();
    } else {
      ElMessage.error(response.data.message || "批量同步失败");
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    ElMessage.error("批量同步失败");
    // 批量同步失败
  } finally {
    batchSyncing.value = false;
  }
};

// 组件挂载时加载数据
onMounted(() => {
  loadFeatureList();
});
</script>

<style scoped>
.recharge-sync {
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0 0 8px 0;
  color: #333;
}

.page-header p {
  margin: 0;
  color: #666;
  font-size: 14px;
}

.feature-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.feature-card {
  height: 200px;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
}

.header-icon {
  font-size: 18px;
  color: #409eff;
}

.card-content {
  padding: 16px 0;
}

.card-content p {
  margin: 0 0 16px 0;
  color: #666;
  font-size: 14px;
}

.status-info,
.debug-info {
  margin-top: 16px;
}

.status-message,
.debug-message {
  margin: 8px 0 0 0;
  font-size: 14px;
  color: #666;
}

.sync-card {
  margin-bottom: 20px;
}

.sync-controls {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 16px;
}

.sync-actions {
  display: flex;
  gap: 12px;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.batch-sync-content {
  padding: 16px 0;
}

.file-info {
  margin-top: 16px;
  padding: 12px;
  background: #f5f5f5;
  border-radius: 4px;
}

.file-info p {
  margin: 0;
  color: #333;
  font-size: 14px;
}

@media (max-width: 768px) {
  .recharge-sync {
    padding: 16px;
  }

  .feature-cards {
    grid-template-columns: 1fr;
  }

  .sync-controls {
    flex-direction: column;
    align-items: stretch;
  }

  .sync-actions {
    justify-content: center;
  }
}
</style>
