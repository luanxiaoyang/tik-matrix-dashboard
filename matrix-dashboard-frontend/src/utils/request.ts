import axios, { type AxiosResponse, type AxiosError } from "axios";
import { ElMessage } from "element-plus";
import router from "@/router";

// 创建axios实例
const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:1106/api", // 后端API地址
  timeout: parseInt(import.meta.env.VITE_API_TIMEOUT) || 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    // 从localStorage获取token
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// 响应拦截器
request.interceptors.response.use(
  (response: AxiosResponse) => {
    const { data } = response;

    // 如果后端返回的code不是200，显示错误信息
    if (data.code && data.code !== 200) {
      ElMessage.error(data.message || "请求失败");
      return Promise.reject(new Error(data.message || "请求失败"));
    }

    return data;
  },
  (error: AxiosError) => {
    // 处理HTTP错误状态码
    if (error.response) {
      const { status } = error.response;

      switch (status) {
        case 401:
          ElMessage.error("登录已过期，请重新登录");
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          router.push("/login");
          break;
        case 403:
          ElMessage.error("没有权限访问");
          break;
        case 404:
          ElMessage.error("请求的资源不存在");
          break;
        case 500:
          ElMessage.error("服务器内部错误");
          break;
        default:
          ElMessage.error(error.message || "请求失败");
      }
    } else {
      ElMessage.error("网络错误，请检查网络连接");
    }

    return Promise.reject(error);
  },
);

export default request;
