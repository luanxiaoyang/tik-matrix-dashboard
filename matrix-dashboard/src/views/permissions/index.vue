<template>
  <div class="permissions-container">
    <el-tabs v-model="activeTab" type="card">
      <el-tab-pane label="角色管理" name="roles">
        <RoleList />
      </el-tab-pane>
      <el-tab-pane label="权限管理" name="permissions">
        <PermissionList />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import RoleList from './RoleList.vue'
import PermissionList from './PermissionList.vue'

const activeTab = ref('roles')
</script>

<style scoped>
.permissions-container {
  padding: 20px;
}
</style>