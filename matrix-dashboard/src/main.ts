import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import zhCn from 'element-plus/es/locale/lang/zh-cn'

import App from './App.vue'
import router from './router'
import './styles/index.css'
import { setupPermissionDirectives } from './directives/permission'
import ErrorBoundary from './components/ErrorBoundary.vue'
import GlobalLoading from './components/GlobalLoading.vue'
import ConfirmDialog from './components/ConfirmDialog.vue'

const app = createApp(App)

// 注册Element Plus图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

// 注册全局组件
app.component('ErrorBoundary', ErrorBoundary)
app.component('GlobalLoading', GlobalLoading)
app.component('ConfirmDialog', ConfirmDialog)

// 安装权限指令
setupPermissionDirectives(app)

app.use(createPinia())
app.use(router)
app.use(ElementPlus, {
  locale: zhCn
})

app.mount('#app')