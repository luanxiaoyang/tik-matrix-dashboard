# AI_FIX_RULES.md
AI 自动修复代码规范（适用于 matrix-dashboard-frontend 项目）

---

## 1. 总体原则
1. **不改变架构**：保持现有 `Vue3 + TypeScript + Pinia + Vite` 前端架构。  
2. **只修复问题**：禁止新增无关功能或大幅改动代码逻辑。  
3. **统一风格**：遵循 ESLint + Prettier 规范，必须通过 TS 编译检查。  

---

## 2. 目录与文件规范
- `api/`：接口请求文件，所有 API 调用必须集中在这里。  
- `assets/`：静态资源（图片、图标等），禁止在组件中写死路径。  
- `components/`：公共复用组件，命名 `PascalCase.vue`。  
- `router/`：路由定义文件，`name` 必须唯一。  
- `stores/`：Pinia store 文件，命名 `xxx.ts`，导出 `useXxxStore`。  
- `types/`：TS 类型定义，命名规范为 `xxx.d.ts` 或 `xxx.ts`。  
- `utils/`：工具函数，必须无副作用。  
- `views/`：页面视图组件，命名 `PascalCase.vue`。  

---

## 3. Pinia 状态管理规范
1. Store 定义：
   ```ts
   export const useUserStore = defineStore('user', {
     state: () => ({
       userInfo: null as UserInfo | null,
       token: '' as string,
     }),
     getters: {
       isLoggedIn: (state) => !!state.token,
     },
     actions: {
       async login(payload: LoginDto) { ... },
       logout() { ... },
     }
   })
   ```

2. 要求：
   - `state` 必须有明确类型
   - `getters` 只能做派生计算，禁止副作用
   - `actions` 负责异步逻辑和修改 state

3. 禁止事项：
   - 禁止在组件内直接修改 `store.state`，必须通过 `actions`
   - 禁止写死 API 地址，必须统一走 `api/` 层

---

## 4. Vue 组件规范

1. 必须使用 `<script setup lang="ts">`
2. Props 必须有类型定义：
   ```ts
   defineProps<{
     title: string
     count?: number
   }>()
   ```
3. Emits 必须声明：
   ```ts
   const emit = defineEmits<{
     (e: 'update'): void
   }>()
   ```
4. 禁止：
   - 未使用的变量 / 方法 / 引入
   - 在模板里写复杂逻辑（应放入 `computed` 或 `methods`）

---

## 5. API 调用规范

1. 所有请求必须写在 `src/api/` 目录：
   ```ts
   // api/user.ts
   import { request } from '@/utils/request'

   export function getUserInfo() {
     return request.get('/user/info')
   }
   ```
2. 调用时必须使用 `await` + `try/catch`：
   ```ts
   try {
     const res = await getUserInfo()
     userStore.setUser(res.data)
   } catch (err) {
     console.error(err)
   }
   ```

---

## 6. AI 修复流程

1. **定位文件**：必须确认 bug 所在文件（如 `views/User.vue` 或 `stores/user.ts`）。
2. **保持目录一致**：禁止新建和现有结构不符的目录。
3. **类型检查**：修复后的代码必须通过 TypeScript 检查。
4. **依赖确认**：涉及 Store / API 修改时，必须检查调用方是否受影响。
5. **维护日志**：修复必须写到 `AI_FIX_LOG.md`。

---

## 7. 修复日志规范

日志文件：`AI_FIX_LOG.md`（放在项目根目录）
日志格式：

```
[日期] AI 修复说明
- 修改文件：src/stores/user.ts
- 问题：state 中 userInfo 类型缺失，导致 TS 报错
- 修改内容：给 userInfo 添加 UserInfo 类型定义
- 影响范围：views/UserProfile.vue 正常读取 userInfo
```

---

## 8. 禁止事项

- 禁止删除或修改 `.env` 配置
- 禁止修改数据库/后端接口逻辑
- 禁止随意引入第三方库
- 禁止绕过 TS 类型检查（如滥用 `any`）
- 禁止在前端写死 API 地址