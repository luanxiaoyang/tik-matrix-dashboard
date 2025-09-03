<template>
  <div class="users-container">
    <UserList />
  </div>
</template>

<script setup lang="ts">
import UserList from './UserList.vue'
</script>

<style scoped>
.users-container {
  padding: 20px;
}
</style>