<template>
  <div class="permission-management">
    <!-- 页面标题和操作按钮 -->
    <div class="page-header">
      <div class="header-left">
        <h2>权限管理</h2>
        <p>管理系统权限和访问控制</p>
      </div>
      <div class="header-right">
        <el-button
          type="primary"
          @click="showCreateDialog"
          v-if="authStore.hasPermission('permission:create')"
        >
          <el-icon><Plus /></el-icon>
          新增权限
        </el-button>
      </div>
    </div>

    <!-- 搜索和筛选 -->
    <el-card class="search-card">
      <el-form :model="searchForm" inline>
        <el-form-item label="权限名称">
          <el-input
            v-model="searchForm.name"
            placeholder="请输入权限名称"
            clearable
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item label="权限代码">
          <el-input
            v-model="searchForm.code"
            placeholder="请输入权限代码"
            clearable
            @keyup.enter="handleSearch"
          />
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
    </el-card>

    <!-- 权限列表 -->
    <el-card class="table-card">
      <el-table
        :data="permissionList"
        v-loading="loading"
        stripe
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="权限名称" min-width="150" />
        <el-table-column prop="code" label="权限代码" min-width="150" />
        <el-table-column prop="description" label="描述" min-width="200" show-overflow-tooltip />
        <el-table-column prop="createdAt" label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <div class="action-buttons">
              <el-button
                type="primary"
                size="small"
                @click="showEditDialog(row)"
                v-if="authStore.hasPermission('permission:update')"
                block
              >
                编辑
              </el-button>
              <el-button
                type="danger"
                size="small"
                @click="deletePermission(row)"
                v-if="authStore.hasPermission('permission:delete')"
                block
              >
                删除
              </el-button>
            </div>
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

    <!-- 新增/编辑权限对话框 -->
    <el-dialog :title="dialogTitle" v-model="dialogVisible" width="600px" @close="resetForm">
      <el-form
        ref="permissionFormRef"
        :model="permissionForm"
        :rules="permissionFormRules"
        label-width="80px"
      >
        <el-form-item label="权限名称" prop="name">
          <el-input v-model="permissionForm.name" placeholder="请输入权限名称" />
        </el-form-item>
        <el-form-item label="权限代码" prop="code">
          <el-input
            v-model="permissionForm.code"
            placeholder="请输入权限代码，如：user:create"
            :disabled="isEdit"
          />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input
            v-model="permissionForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入权限描述"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting"> 确定 </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from "vue";
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from "element-plus";
import { useAuthStore } from "@/stores/auth";
import {
  getPermissionList,
  getPermissionById,
  createPermission,
  updatePermission,
  deletePermission as deletePermissionApi,
} from "@/api/rbac";
import type { Permission } from "@/types/api";

const authStore = useAuthStore();

// 响应式数据
const loading = ref(false);
const submitting = ref(false);
const dialogVisible = ref(false);
const isEdit = ref(false);
const permissionList = ref<Permission[]>([]);
const selectedPermissions = ref<Permission[]>([]);
const permissionFormRef = ref<FormInstance>();

// 搜索表单
const searchForm = reactive({
  name: "",
  code: "",
});

// 分页数据
const pagination = reactive({
  page: 1,
  size: 20,
  total: 0,
});

// 权限表单
const permissionForm = reactive({
  id: undefined as number | undefined,
  name: "",
  code: "",
  description: "",
});

// 表单验证规则
const permissionFormRules: FormRules = {
  name: [{ required: true, message: "请输入权限名称", trigger: "blur" }],
  code: [
    { required: true, message: "请输入权限代码", trigger: "blur" },
    {
      pattern: /^[a-z_]+:[a-z_]+$/,
      message: "权限代码格式为：模块:操作，如：user:create",
      trigger: "blur",
    },
  ],
};

// 计算属性
const dialogTitle = computed(() => (isEdit.value ? "编辑权限" : "新增权限"));

/**
 * 格式化日期
 */
const formatDate = (date: string) => {
  return new Date(date).toLocaleString("zh-CN");
};

/**
 * 加载权限列表
 */
const loadPermissionList = async () => {
  try {
    loading.value = true;
    const params = {
      page: pagination.page,
      pageSize: pagination.size,
      name: searchForm.name || undefined,
      code: searchForm.code || undefined,
    };
    const response = await getPermissionList(params);
    // 后端直接返回权限数组，不是分页格式
    if (Array.isArray(response.data)) {
      permissionList.value = response.data;
      pagination.total = response.data.length;
    } else {
      // 如果是分页格式
      permissionList.value = response.data.items || [];
      pagination.total = response.data.total || 0;
    }
  } catch {
    ElMessage.error("加载权限列表失败");
    // 加载权限列表失败
    // 设置空数据避免页面崩溃
    permissionList.value = [];
    pagination.total = 0;
  } finally {
    loading.value = false;
  }
};

/**
 * 搜索权限
 */
const handleSearch = () => {
  pagination.page = 1;
  loadPermissionList();
};

/**
 * 重置搜索
 */
const handleReset = () => {
  Object.assign(searchForm, {
    name: "",
    code: "",
  });
  pagination.page = 1;
  loadPermissionList();
};

/**
 * 分页大小改变
 */
const handleSizeChange = (size: number) => {
  pagination.size = size;
  pagination.page = 1;
  loadPermissionList();
};

/**
 * 当前页改变
 */
const handleCurrentChange = (page: number) => {
  pagination.page = page;
  loadPermissionList();
};

/**
 * 选择改变
 */
const handleSelectionChange = (selection: Permission[]) => {
  selectedPermissions.value = selection;
};

/**
 * 显示新增对话框
 */
const showCreateDialog = () => {
  isEdit.value = false;
  dialogVisible.value = true;
  resetForm();
};

/**
 * 显示编辑对话框
 */
const showEditDialog = async (permission: Permission) => {
  try {
    isEdit.value = true;
    const response = await getPermissionById(permission.id);
    const permissionData = response.data;

    Object.assign(permissionForm, {
      id: permissionData.id,
      name: permissionData.name,
      code: permissionData.code,
      description: permissionData.description,
    });

    dialogVisible.value = true;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    ElMessage.error("获取权限信息失败");
    // 获取权限信息失败
  }
};

/**
 * 重置表单
 */
const resetForm = () => {
  Object.assign(permissionForm, {
    id: undefined,
    name: "",
    code: "",
    description: "",
  });
  permissionFormRef.value?.clearValidate();
};

/**
 * 提交表单
 */
const handleSubmit = async () => {
  if (!permissionFormRef.value) return;

  try {
    await permissionFormRef.value.validate();
    submitting.value = true;

    if (isEdit.value) {
      // 编辑权限
      const updateData = {
        name: permissionForm.name,
        description: permissionForm.description,
      };
      await updatePermission(permissionForm.id!, updateData);
      ElMessage.success("权限更新成功");
    } else {
      // 新增权限
      const createData = {
        name: permissionForm.name,
        code: permissionForm.code,
        description: permissionForm.description,
      };
      await createPermission(createData);
      ElMessage.success("权限创建成功");
    }

    dialogVisible.value = false;
    loadPermissionList();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    ElMessage.error(isEdit.value ? "权限更新失败" : "权限创建失败");
    // 权限操作失败
  } finally {
    submitting.value = false;
  }
};

/**
 * 删除权限
 */
const deletePermission = async (permission: Permission) => {
  try {
    await ElMessageBox.confirm(`确定要删除权限 "${permission.name}" 吗？`, "删除确认", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    });

    await deletePermissionApi(permission.id);
    ElMessage.success("权限删除成功");
    loadPermissionList();
  } catch (error) {
    if (error !== "cancel") {
      ElMessage.error("权限删除失败");
      // 权限删除失败
    }
  }
};

// 组件挂载时加载数据
onMounted(() => {
  loadPermissionList();
});
</script>

<style scoped>
.permission-management {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 20px;
}

.header-left h2 {
  margin: 0 0 8px 0;
  color: #333;
}

.header-left p {
  margin: 0;
  color: #666;
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
  justify-content: center;
  margin-top: 20px;
}

/* 操作按钮垂直排列样式 */
.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.action-buttons .el-button {
  margin-left: 0 !important;
  margin-right: 0 !important;
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .permission-management {
    padding: 16px;
  }
}
</style>
