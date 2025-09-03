import { createI18n } from 'vue-i18n';
import zhCN from './locales/zh-CN';
import enUS from './locales/en-US';

const messages = {
  'zh-CN': zhCN,
  'en-US': enUS
};

// 获取浏览器语言设置或使用默认语言
const getLocale = (): string => {
  const cachedLocale = localStorage.getItem('language');
  if (cachedLocale) {
    return cachedLocale;
  }
  
  const browserLang = navigator.language;
  const langCode = browserLang.toLowerCase().includes('zh') ? 'zh-CN' : 'en-US';
  
  return langCode;
};

const i18n = createI18n({
  legacy: false, // 使用组合式API
  locale: getLocale(),
  fallbackLocale: 'zh-CN',
  messages
});

export default i18n;