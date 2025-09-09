<template>
  <div class="login-container">
    <div class="login-box">
      <div class="login-header">
        <div class="logo">
          <el-icon size="48" color="#409EFF"><Grid /></el-icon>
        </div>
        <h2>Matrix Dashboard</h2>
        <p>企业管理后台系统</p>
      </div>

      <div class="login-body">
        <div v-if="authStore.isLoading" class="login-loading">
          <div class="spinner"></div>
          <p>登录中，请稍候...</p>
        </div>
        <div v-else>
          <!-- Lark登录区域 -->
          <div class="lark-login-section">
            <div class="lark-title">
              <el-icon size="20" color="#409EFF"><ChatDotRound /></el-icon>
              <span>Lark 登录</span>
            </div>
            <div class="lark-description">
              <p>使用Lark账号快速登录</p>
            </div>

            <!-- 二维码登录 -->
            <div class="qr-container">
              <div id="lark_login" class="lark-login-container"></div>
              <div class="qr-actions">
                <el-button size="small" type="primary" @click="refreshQR"> 刷新二维码 </el-button>
                <el-button size="small" type="success" @click="openLarkAuth">
                  Lark 授权登录
                </el-button>
              </div>
            </div>
          </div>

          <!-- 传统登录入口 -->
          <div class="traditional-login">
            <el-divider>或</el-divider>
            <el-button
              type="text"
              class="switch-login-button"
              @click="showTraditionalLogin = !showTraditionalLogin"
            >
              {{ showTraditionalLogin ? "返回扫码登录" : "使用账号密码登录" }}
            </el-button>

            <!-- 传统登录表单 -->
            <div v-show="showTraditionalLogin" class="traditional-form">
              <el-form
                ref="loginFormRef"
                :model="loginForm"
                :rules="loginRules"
                class="login-form"
                @submit.prevent="handleLogin"
              >
                <el-form-item prop="username">
                  <el-input
                    v-model="loginForm.username"
                    placeholder="请输入用户名"
                    size="large"
                    prefix-icon="User"
                    clearable
                  />
                </el-form-item>

                <el-form-item prop="password">
                  <el-input
                    v-model="loginForm.password"
                    type="password"
                    placeholder="请输入密码"
                    size="large"
                    prefix-icon="Lock"
                    show-password
                    clearable
                    @keyup.enter="handleLogin"
                  />
                </el-form-item>

                <el-form-item>
                  <el-button
                    type="primary"
                    size="large"
                    class="login-button"
                    :loading="authStore.isLoading"
                    @click="handleLogin"
                  >
                    {{ authStore.isLoading ? "登录中..." : "登录" }}
                  </el-button>
                </el-form-item>
              </el-form>
            </div>
          </div>
        </div>
      </div>

      <!-- 环境选择器 -->
      <div class="login-footer">
        <div class="env-selector">
          <span>主体选择：</span>
          <el-select v-model="larkOrg" size="small" @change="initQR">
            <el-option
              v-for="item in envOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { ElForm, ElMessage } from "element-plus";
import { Grid, ChatDotRound } from "@element-plus/icons-vue";
import { useAuthStore } from "@/stores/auth";
import { randomString } from "@/utils/random";
import type { LoginRequest } from "@/types/api";

// 声明全局变量
interface QRLoginInstance {
  matchOrigin: (origin: string) => boolean;
  matchData: (data: unknown) => boolean;
}

declare global {
  interface Window {
    QRLogin: (config: Record<string, unknown>) => QRLoginInstance;
  }
}

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const loginFormRef = ref<InstanceType<typeof ElForm>>();
const showTraditionalLogin = ref(false);
const currentAuthUrl = ref("");

// 环境配置
const envOptions = ref([
  {
    value: "dev",
    label: "直播/短视频",
  },
  {
    value: "prod",
    label: "YAYChat",
  },
]);

const larkOrg = ref<"dev" | "prod">("dev");

// 登录表单数据
const loginForm = reactive<LoginRequest>({
  username: "",
  password: "",
});

// 表单验证规则
const loginRules = {
  username: [
    { required: true, message: "请输入用户名", trigger: "blur" },
    { min: 3, max: 20, message: "用户名长度在 3 到 20 个字符", trigger: "blur" },
  ],
  password: [
    { required: true, message: "请输入密码", trigger: "blur" },
    { min: 6, max: 20, message: "密码长度在 6 到 20 个字符", trigger: "blur" },
  ],
};

/**
 * 初始化二维码
 */
const initQR = async () => {
  const qrContainer = document.getElementById("lark_login");
  if (qrContainer) {
    qrContainer.innerHTML = "";
  }

  try {
    // 根据选择的主体获取对应的Lark登录URL
    const provider = larkOrg.value === "prod" ? "yaychat" : "lark";

    // 使用前端API方法获取URL
    const { getLarkAuthUrl } = await import("@/api/auth");
    const result = await getLarkAuthUrl(provider);

    const authUrl = result.data.authUrl;
    const url = new URL(authUrl);
    const state = url.searchParams.get("state");

    localStorage.setItem("auth_state", state || randomString(6));
    localStorage.setItem("auth_flag", larkOrg.value);
    localStorage.setItem("auth_provider", provider);
    currentAuthUrl.value = authUrl;

    // 使用 Lark SDK 生成二维码
    if (window.QRLogin) {
      const QRLoginObj = window.QRLogin({
        id: "lark_login",
        goto: authUrl,
        width: "280",
        height: "280",
        style: "border:none;",
        href: "data:text/css;base64,LnFyY29kZV9sb2dpbl9jb250YWluZXJ7cGFkZGluZzowfS5xcmNvZGVfbG9naW5fY29udGFpbmVyIGgze21hcmdpbi1ib3R0b206MjBweDtmb250LXNpemU6MTZweDtjb2xvcjojMzMzfS5xcmNvZGVfbG9naW5fY29udGFpbmVyIC5xcmNvZGVfcGFuZWx7Ym94LXNoYWRvdzpub25lICFpbXBvcnRhbnR9",
      });

      const handleMessage = (event: MessageEvent) => {
        if (QRLoginObj.matchOrigin(event.origin) && QRLoginObj.matchData(event.data)) {
          const loginTmpCode = event.data.tmp_code;
          window.location.href = authUrl + "&tmp_code=" + loginTmpCode;
        }
      };

      window.addEventListener("message", handleMessage);
    } else {
      console.error("Lark QRLogin SDK 未加载");
      ElMessage.error("二维码加载失败，请刷新页面重试");
    }
  } catch (error) {
    console.error("获取Lark登录URL异常:", error);
    ElMessage.error("获取登录URL失败，请重试");
  }
};

/**
 * 刷新二维码
 */
const refreshQR = () => {
  initQR();
};

/**
 * 打开Lark授权页面
 */
const openLarkAuth = async () => {
  if (currentAuthUrl.value) {
    window.open(currentAuthUrl.value, "_blank");
  } else {
    try {
      // 获取后端生成的授权URL
      const provider = larkOrg.value === "prod" ? "yaychat" : "lark";

      // 使用前端API方法获取URL
      const { getLarkAuthUrl } = await import("@/api/auth");
      const result = await getLarkAuthUrl(provider);

      const authUrl = result.data.authUrl;
      const url = new URL(authUrl);
      const state = url.searchParams.get("state");

      localStorage.setItem("auth_state", state || randomString(6));
      localStorage.setItem("auth_flag", larkOrg.value);
      localStorage.setItem("auth_provider", provider);
      currentAuthUrl.value = authUrl;

      window.open(authUrl, "_blank");
    } catch (error) {
      console.error("获取Lark登录URL异常:", error);
      ElMessage.error("获取登录URL失败，请重试");
    }
  }
};

/**
 * 处理用户名密码登录
 */
const handleLogin = async () => {
  if (!loginFormRef.value) return;

  try {
    const valid = await loginFormRef.value.validate();
    if (!valid) return;

    await authStore.userLogin(loginForm);

    // 登录成功后跳转
    const redirect = route.query.redirect as string;
    router.push(redirect || "/");
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (_error) {
    // 登录失败
  }
};

onMounted(() => {
  // 检查是否已登录
  const token = localStorage.getItem("access_token");
  if (token) {
    // 已登录，跳转到首页
    router.push("/");
    return;
  }

  const url = new URL(window.location.href);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const cacheState = localStorage.getItem("auth_state");
  const cacheFlag = localStorage.getItem("auth_flag");

  if (state === cacheState && code) {
    console.log("检测到Lark授权回调，开始处理登录...", { code, state, cacheFlag });
    // 清理URL参数
    window.history.replaceState({}, document.title, window.location.pathname);
    authStore.isLoading = true;
    startAuth(cacheFlag || "dev", code);
  } else {
    // 清除登录状态，确保重新生成二维码
    authStore.isLoading = false;
    localStorage.removeItem("auth_state");

    // 确保 DOM 已经准备好
    setTimeout(() => {
      initQR();
    }, 100);
  }
});

/**
 * 开始认证流程
 */
const startAuth = async (flag: string, code: string) => {
  try {
    // 获取存储的provider信息
    const provider =
      localStorage.getItem("auth_provider") || (flag === "prod" ? "yaychat" : "lark");

    await authStore.larkUserLogin({ flag, code, provider });

    // 获取重定向地址
    const redirect = (route.query.redirect as string) || "/";

    ElMessage.success("登录成功");
    router.push(redirect);
  } catch (error) {
    console.error("登录失败:", error);

    // 清除登录状态
    localStorage.removeItem("auth_state");
    localStorage.removeItem("auth_flag");
    localStorage.removeItem("auth_provider");

    // 显示错误信息
    ElMessage.error("登录失败，请重新扫码");

    // 重新生成二维码
    setTimeout(() => {
      initQR();
    }, 100);
  }
};
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
  position: relative;
  overflow: hidden;
}

.login-container::before {
  content: "";
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 1px, transparent 1px);
  background-size: 50px 50px;
  animation: float 20s infinite linear;
}

@keyframes float {
  0% {
    transform: translate(-50%, -50%) rotate(0deg);
  }
  100% {
    transform: translate(-50%, -50%) rotate(360deg);
  }
}

.login-box {
  width: 100%;
  max-width: 400px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  box-shadow:
    0 20px 40px rgba(0, 0, 0, 0.15),
    0 0 0 1px rgba(255, 255, 255, 0.2);
  padding: 40px 32px;
  position: relative;
  z-index: 1;
  transition: transform 0.3s ease;
}

.login-box:hover {
  transform: translateY(-2px);
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
}

.logo {
  margin-bottom: 16px;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
}

.login-header h2 {
  color: #333;
  margin: 0 0 8px 0;
  font-size: 28px;
  font-weight: 600;
  background: linear-gradient(135deg, #409eff, #667eea);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.login-header p {
  color: #666;
  margin: 0;
  font-size: 14px;
}

.login-body {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: auto;
}

.login-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.login-loading p {
  margin-top: 16px;
  color: #666;
  font-size: 14px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(0, 0, 0, 0.1);
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.lark-login-section {
  width: 100%;
  text-align: center;
}

.lark-title {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 16px;
  font-size: 16px;
  font-weight: 500;
  color: #333;
}

.lark-description {
  margin-bottom: 20px;
}

.lark-description p {
  color: #666;
  font-size: 14px;
  margin: 0;
}

.qr-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 20px;
}

.lark-login-container {
  margin-bottom: 16px;
}

.qr-actions {
  display: flex;
  justify-content: center;
  gap: 12px;
}

.traditional-login {
  width: 100%;
  margin-top: 20px;
}

.switch-login-button {
  color: #409eff;
  font-size: 14px;
  padding: 8px 0;
}

.switch-login-button:hover {
  color: #667eea;
}

.traditional-form {
  margin-top: 20px;
  animation: slideDown 0.3s ease;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.login-form :deep(.el-form-item) {
  margin-bottom: 20px;
}

.login-form :deep(.el-input__wrapper) {
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}

.login-form :deep(.el-input__wrapper:hover) {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
}

.login-form :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.2);
}

.login-button {
  width: 100%;
  height: 48px;
  font-size: 16px;
  font-weight: 500;
  border-radius: 8px;
  background: linear-gradient(135deg, #409eff, #667eea);
  border: none;
  transition: all 0.3s ease;
}

.login-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 20px rgba(64, 158, 255, 0.3);
}

.login-footer {
  border-top: 1px solid #eee;
  padding-top: 20px;
  margin-top: 20px;
}

.env-selector {
  display: flex;
  align-items: center;
  justify-content: center;
}

.env-selector span {
  margin-right: 10px;
  font-size: 13px;
  color: #666;
  flex-shrink: 0;
}

:deep(.el-divider__text) {
  color: #999;
  font-size: 14px;
}

/* 响应式设计 */
@media (max-width: 480px) {
  .login-container {
    padding: 16px;
  }

  .login-box {
    padding: 32px 24px;
    max-width: 100%;
  }

  .login-header h2 {
    font-size: 24px;
  }

  .login-button {
    height: 44px;
    font-size: 15px;
  }

  .lark-login-container {
    transform: scale(0.9);
  }
}

@media (max-width: 320px) {
  .login-box {
    padding: 24px 16px;
  }

  .login-header h2 {
    font-size: 22px;
  }

  .lark-login-container {
    transform: scale(0.8);
  }
}
</style>
