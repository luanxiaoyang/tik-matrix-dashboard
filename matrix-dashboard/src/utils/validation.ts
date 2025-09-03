/**
 * 表单验证规则
 */

import type { FormItemRule } from 'element-plus'

/**
 * 必填验证
 */
export const requiredRule = (message = '此项为必填项'): FormItemRule => ({
  required: true,
  message,
  trigger: 'blur'
})

/**
 * 手机号验证
 */
export const phoneRule: FormItemRule = {
  pattern: /^1[3-9]\d{9}$/,
  message: '请输入正确的手机号码',
  trigger: 'blur'
}

/**
 * 邮箱验证
 */
export const emailRule: FormItemRule = {
  type: 'email',
  message: '请输入正确的邮箱地址',
  trigger: 'blur'
}

/**
 * URL验证
 */
export const urlRule: FormItemRule = {
  type: 'url',
  message: '请输入正确的URL地址',
  trigger: 'blur'
}

/**
 * 密码验证（至少6位）
 */
export const passwordRule: FormItemRule = {
  min: 6,
  message: '密码长度不能少于6位',
  trigger: 'blur'
}

/**
 * 强密码验证（包含大小写字母、数字、特殊字符，至少8位）
 */
export const strongPasswordRule: FormItemRule = {
  pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  message: '密码必须包含大小写字母、数字和特殊字符，且不少于8位',
  trigger: 'blur'
}

/**
 * 用户名验证（字母、数字、下划线，3-20位）
 */
export const usernameRule: FormItemRule = {
  pattern: /^[a-zA-Z0-9_]{3,20}$/,
  message: '用户名只能包含字母、数字、下划线，长度3-20位',
  trigger: 'blur'
}

/**
 * 中文姓名验证
 */
export const chineseNameRule: FormItemRule = {
  pattern: /^[\u4e00-\u9fa5]{2,10}$/,
  message: '请输入正确的中文姓名（2-10个汉字）',
  trigger: 'blur'
}

/**
 * 身份证号验证
 */
export const idCardRule: FormItemRule = {
  pattern: /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/,
  message: '请输入正确的身份证号码',
  trigger: 'blur'
}

/**
 * 银行卡号验证
 */
export const bankCardRule: FormItemRule = {
  pattern: /^\d{16,19}$/,
  message: '请输入正确的银行卡号（16-19位数字）',
  trigger: 'blur'
}

/**
 * 数字验证
 */
export const numberRule: FormItemRule = {
  type: 'number',
  message: '请输入数字',
  trigger: 'blur'
}

/**
 * 正整数验证
 */
export const positiveIntegerRule: FormItemRule = {
  pattern: /^[1-9]\d*$/,
  message: '请输入正整数',
  trigger: 'blur'
}

/**
 * 非负整数验证（包含0）
 */
export const nonNegativeIntegerRule: FormItemRule = {
  pattern: /^(0|[1-9]\d*)$/,
  message: '请输入非负整数',
  trigger: 'blur'
}

/**
 * 正数验证（包含小数）
 */
export const positiveNumberRule: FormItemRule = {
  pattern: /^(0\.\d+|[1-9]\d*(\.\d+)?)$/,
  message: '请输入正数',
  trigger: 'blur'
}

/**
 * 非负数验证（包含0和小数）
 */
export const nonNegativeNumberRule: FormItemRule = {
  pattern: /^(0|0\.\d+|[1-9]\d*(\.\d+)?)$/,
  message: '请输入非负数',
  trigger: 'blur'
}

/**
 * 长度范围验证
 */
export const lengthRangeRule = (min: number, max: number, message?: string): FormItemRule => ({
  min,
  max,
  message: message || `长度在 ${min} 到 ${max} 个字符`,
  trigger: 'blur'
})

/**
 * 最小长度验证
 */
export const minLengthRule = (min: number, message?: string): FormItemRule => ({
  min,
  message: message || `长度不能少于 ${min} 个字符`,
  trigger: 'blur'
})

/**
 * 最大长度验证
 */
export const maxLengthRule = (max: number, message?: string): FormItemRule => ({
  max,
  message: message || `长度不能超过 ${max} 个字符`,
  trigger: 'blur'
})

/**
 * 数值范围验证
 */
export const rangeRule = (min: number, max: number, message?: string): FormItemRule => ({
  type: 'number',
  min,
  max,
  message: message || `数值范围在 ${min} 到 ${max} 之间`,
  trigger: 'blur'
})

/**
 * 最小值验证
 */
export const minRule = (min: number, message?: string): FormItemRule => ({
  type: 'number',
  min,
  message: message || `数值不能小于 ${min}`,
  trigger: 'blur'
})

/**
 * 最大值验证
 */
export const maxRule = (max: number, message?: string): FormItemRule => ({
  type: 'number',
  max,
  message: message || `数值不能大于 ${max}`,
  trigger: 'blur'
})

/**
 * 自定义正则验证
 */
export const patternRule = (pattern: RegExp, message: string): FormItemRule => ({
  pattern,
  message,
  trigger: 'blur'
})

/**
 * 自定义验证函数
 */
export const customRule = (
  validator: (rule: any, value: any, callback: any) => void,
  trigger: string | string[] = 'blur'
): FormItemRule => ({
  validator,
  trigger
})

/**
 * 确认密码验证
 */
export const confirmPasswordRule = (passwordField: string) => customRule(
  (rule: any, value: any, callback: any) => {
    if (value === '') {
      callback(new Error('请再次输入密码'))
    } else if (value !== rule.form[passwordField]) {
      callback(new Error('两次输入密码不一致'))
    } else {
      callback()
    }
  }
)

/**
 * 常用验证规则组合
 */
export const commonRules = {
  // 必填手机号
  requiredPhone: [requiredRule('请输入手机号'), phoneRule],
  
  // 必填邮箱
  requiredEmail: [requiredRule('请输入邮箱'), emailRule],
  
  // 必填密码
  requiredPassword: [requiredRule('请输入密码'), passwordRule],
  
  // 必填用户名
  requiredUsername: [requiredRule('请输入用户名'), usernameRule],
  
  // 必填中文姓名
  requiredChineseName: [requiredRule('请输入姓名'), chineseNameRule],
  
  // 必填身份证号
  requiredIdCard: [requiredRule('请输入身份证号'), idCardRule],
  
  // 必填银行卡号
  requiredBankCard: [requiredRule('请输入银行卡号'), bankCardRule],
  
  // 必填URL
  requiredUrl: [requiredRule('请输入URL'), urlRule],
  
  // 必填正整数
  requiredPositiveInteger: [requiredRule('请输入数值'), positiveIntegerRule],
  
  // 必填非负整数
  requiredNonNegativeInteger: [requiredRule('请输入数值'), nonNegativeIntegerRule],
  
  // 必填正数
  requiredPositiveNumber: [requiredRule('请输入数值'), positiveNumberRule],
  
  // 必填非负数
  requiredNonNegativeNumber: [requiredRule('请输入数值'), nonNegativeNumberRule]
}