/**
 * 安全相关工具函数
 */

/**
 * HTML内容净化，移除潜在的XSS攻击代码
 * @param html 需要净化的HTML字符串
 * @returns 净化后的HTML字符串
 */
export function sanitizeHtml(html: string): string {
  if (!html) return '';
  
  // 移除所有script标签
  let sanitized = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  // 移除可能包含JavaScript的事件属性
  const eventAttributes = [
    'onabort', 'onblur', 'onchange', 'onclick', 'ondblclick', 'onerror', 'onfocus',
    'onkeydown', 'onkeypress', 'onkeyup', 'onload', 'onmousedown', 'onmousemove',
    'onmouseout', 'onmouseover', 'onmouseup', 'onreset', 'onresize', 'onscroll',
    'onselect', 'onsubmit', 'onunload'
  ];
  
  const eventRegexPattern = new RegExp(
    `\\s(${eventAttributes.join('|')})\\s*=\\s*(["'])[^\\2]*\\2`,
    'gi'
  );
  sanitized = sanitized.replace(eventRegexPattern, '');
  
  // 移除危险的URI协议
  sanitized = sanitized.replace(/\b(?:javascript|data|vbscript):/gi, 'unsafe:');
  
  return sanitized;
}

/**
 * 创建CSP策略头部
 * @returns CSP策略字符串
 */
export function generateCSPPolicy(): string {
  return [
    "default-src 'self'",
    "script-src 'self'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self' data:",
    "connect-src 'self' https:",
    "frame-src 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'"
  ].join('; ');
}

/**
 * 安全地解析JSON字符串
 * @param jsonString 要解析的JSON字符串
 * @param fallback 解析失败时的默认值
 * @returns 解析结果或默认值
 */
export function safeParseJSON<T>(jsonString: string, fallback: T): T {
  try {
    return JSON.parse(jsonString) as T;
  } catch (e) {
    console.error('JSON解析错误:', e);
    return fallback;
  }
}

/**
 * 对敏感数据进行脱敏处理
 * @param value 需要脱敏的字符串
 * @param type 脱敏类型
 * @returns 脱敏后的字符串
 */
export function maskSensitiveData(value: string, type: 'phone' | 'email' | 'idcard' | 'name'): string {
  if (!value) return '';
  
  switch (type) {
    case 'phone':
      // 保留前3位和后4位，中间用*替代
      return value.replace(/^(\d{3})\d*(\d{4})$/, '$1****$2');
    case 'email':
      // 邮箱 - 保留@前面的前3个字符和@后面的所有内容
      return value.replace(/^([^@]{3})[^@]*(@.+)$/, '$1***$2');
    case 'idcard':
      // 身份证 - 保留前6位和后4位
      return value.replace(/^(\d{6})\d*(\d{4})$/, '$1********$2');
    case 'name':
      // 姓名 - 仅保留第一个字符
      return value.substring(0, 1) + '*'.repeat(value.length - 1);
    default:
      return value;
  }
}