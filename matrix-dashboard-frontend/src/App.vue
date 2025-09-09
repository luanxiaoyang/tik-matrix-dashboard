<script setup lang="ts">
import { RouterView } from "vue-router";
</script>

<template>
  <RouterView />
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html,
body {
  width: 100%;
  height: 100%;
  overflow-x: hidden; /* 防止横向滚动条 */
  font-family:
    "Helvetica Neue", Helvetica, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "微软雅黑",
    Arial, sans-serif;
}

#app {
  width: 100%;
  height: 100vh;
  overflow-x: hidden; /* 防止横向滚动条 */
  position: relative;
}
</style>
