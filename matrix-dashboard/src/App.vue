<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script setup lang="ts">
/**
 * @component App
 * @description 应用程序根组件，作为整个应用的入口点
 * 
 * @remarks
 * 该组件主要负责：
 * 1. 提供应用的基础布局容器
 * 2. 渲染当前路由对应的组件
 * 3. 设置全局CSS重置样式
 * 
 * @example
 * 此组件通常不需要直接引用，由Vue Router自动处理
 */

// 此处可以添加全局级别的生命周期钩子或状态管理
</script>

<style>
#app {
  width: 100%;
  height: 100vh;
  margin: 0;
  padding: 0;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  padding: 0;
  font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', '微软雅黑', Arial, sans-serif;
}
</style>