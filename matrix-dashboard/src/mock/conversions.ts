import Mock from 'mockjs'
import type { Conversion, CreateConversionParams } from '@/types/business'

// 生成模拟转化数据
const generateConversions = (count: number): Conversion[] => {
  const conversions: Conversion[] = []
  
  // 手机编号格式示例
  const phoneFormats = [
    () => `us-${Mock.Random.integer(1, 999)}`,
    () => `美国${Mock.Random.integer(1, 999)}`,
    () => `云${Mock.Random.integer(1, 999)}`,
    () => `uk-${Mock.Random.integer(1, 999)}`,
    () => `英国${Mock.Random.integer(1, 999)}`,
    () => `jp-${Mock.Random.integer(1, 999)}`,
    () => `日本${Mock.Random.integer(1, 999)}`,
    () => `ca-${Mock.Random.integer(1, 999)}`,
    () => `加拿大${Mock.Random.integer(1, 999)}`,
    () => `au-${Mock.Random.integer(1, 999)}`
  ]
  
  for (let i = 1; i <= count; i++) {
    const registerUserId = Mock.Random.integer(1000000, 9999999)
    const phoneFormat = Mock.Random.pick(phoneFormats)
    const phoneNo = phoneFormat()
    
    conversions.push({
      id: `conv_${Mock.Random.string('number', 3)}`,
      registerUserId,
      accountId: `acc_${Mock.Random.string('number', 3)}`,
      phoneNo,
      createdBy: Mock.Random.pick(['u_1001', 'u_1002', 'u_1003', 'u_1004']),
      createdAt: Mock.Random.datetime(),
      duplicated: false,
      accountBrief: {
        id: `acc_${Mock.Random.string('number', 3)}`,
        phoneNo,
        accountLink: `https://t.me/${Mock.Random.string('lower', 8)}`,
        ownerId: Mock.Random.pick(['u_1001', 'u_1002', 'u_1003', 'u_1004'])
      },
      lastRechargeFeature: Mock.Random.boolean() ? {
        userId: registerUserId,
        features: {
          isVip: Mock.Random.boolean(),
          rechargeTotal: Mock.Random.float(0, 1000, 2, 2),
          lastRechargeAt: Mock.Random.datetime()
        },
        lastSyncedAt: Mock.Random.datetime(),
        source: 'yaychat'
      } : undefined
    })
  }
  
  return conversions
}

let mockConversions = generateConversions(30)

// 提交转化
Mock.mock('/api/conversions', 'post', (options: any) => {
  const params: CreateConversionParams = JSON.parse(options.body)
  
  let accountId = params.accountId
  let phoneNo = params.phoneNo
  
  // 如果传入phoneNo，需要映射到accountId
  if (phoneNo && !accountId) {
    // 模拟查找账号
    accountId = `acc_${Mock.Random.string('number', 3)}`
  }
  
  if (!accountId) {
    return {
      code: 422,
      msg: '无法找到对应的账号',
      data: null
    }
  }
  
  // 检查是否重复
  const exists = mockConversions.find(conv => 
    conv.registerUserId === params.registerUserId && conv.accountId === accountId
  )
  
  if (exists) {
    return {
      code: 200,
      msg: 'ok',
      data: {
        ...exists,
        duplicated: true
      }
    }
  }
  
  const newConversion: Conversion = {
    id: `conv_${Mock.Random.string('number', 3)}`,
    registerUserId: params.registerUserId,
    accountId: accountId!,
    phoneNo: phoneNo || `PH-${Mock.Random.string('number', 4)}`,
    createdBy: 'u_1003', // 模拟当前用户
    createdAt: new Date().toISOString(),
    duplicated: false
  }
  
  mockConversions.unshift(newConversion)
  
  return {
    code: 200,
    msg: 'ok',
    data: newConversion
  }
})

// 获取转化列表
Mock.mock(RegExp('/api/conversions\\?.*'), 'get', (options: any) => {
  const url = new URL(options.url, 'http://localhost')
  const params = Object.fromEntries(url.searchParams)
  
  const page = parseInt(params.page) || 1
  const pageSize = parseInt(params.pageSize) || 20
  const q = params.q || ''
  const registerUserId = params.registerUserId
  const phoneNo = params.phoneNo
  const accountId = params.accountId
  const createdBy = params.createdBy
  
  let filteredConversions = [...mockConversions]
  
  // 模糊搜索
  if (q) {
    filteredConversions = filteredConversions.filter(conv => 
      conv.registerUserId.toString().includes(q) || 
      conv.phoneNo.includes(q) ||
      conv.accountBrief?.accountLink?.includes(q)
    )
  }
  
  // 按注册用户ID过滤
  if (registerUserId) {
    filteredConversions = filteredConversions.filter(conv => 
      conv.registerUserId === parseInt(registerUserId)
    )
  }
  
  // 按手机号过滤
  if (phoneNo) {
    filteredConversions = filteredConversions.filter(conv => conv.phoneNo === phoneNo)
  }
  
  // 按账号ID过滤
  if (accountId) {
    filteredConversions = filteredConversions.filter(conv => conv.accountId === accountId)
  }
  
  // 按创建者过滤
  if (createdBy) {
    filteredConversions = filteredConversions.filter(conv => conv.createdBy === createdBy)
  }
  
  const total = filteredConversions.length
  const start = (page - 1) * pageSize
  const end = start + pageSize
  const items = filteredConversions.slice(start, end)
  
  return {
    code: 200,
    msg: 'ok',
    data: {
      page,
      pageSize,
      total,
      items
    }
  }
})

// 获取转化详情
Mock.mock(RegExp('/api/conversions/[^/]+$'), 'get', (options: any) => {
  const id = options.url.split('/').pop()
  const conversion = mockConversions.find(conv => conv.id === id)
  
  if (!conversion) {
    return {
      code: 404,
      msg: '转化记录不存在',
      data: null
    }
  }
  
  return {
    code: 200,
    msg: 'ok',
    data: conversion
  }
})