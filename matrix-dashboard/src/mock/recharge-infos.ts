import Mock from 'mockjs'
import type { RechargeInfo, QueryRechargeInfoParams, QueryRechargeInfoResponse } from '@/types/business'

/**
 * 充值信息
 * 注意：totalRecharge字段存储的是美分（cents），显示时需要转换为美元
 * hundredUser和valuableUser是后端返回的布尔值，不应在前端计算
 */
const generateRechargeInfos = (ownerId: string): RechargeInfo[] => {
  const infos: RechargeInfo[] = []
  
  const phoneFormats = [
    () => `us-${Math.floor(Math.random() * 999) + 1}`,
    () => `美国${Math.floor(Math.random() * 999) + 1}`,
    () => `云${Math.floor(Math.random() * 999) + 1}`,
    () => `uk-${Math.floor(Math.random() * 999) + 1}`,
    () => `英国${Math.floor(Math.random() * 999) + 1}`,
    () => `jp-${Math.floor(Math.random() * 999) + 1}`,
    () => `日本${Math.floor(Math.random() * 999) + 1}`,
    () => `ca-${Math.floor(Math.random() * 999) + 1}`,
    () => `加拿大${Math.floor(Math.random() * 999) + 1}`,
    () => `au-${Math.floor(Math.random() * 999) + 1}`
  ]
  
  for (let i = 0; i < 100; i++) {
    const phoneFormat = phoneFormats[Math.floor(Math.random() * phoneFormats.length)]
    const totalRechargeInCents = Mock.Random.integer(1000, 200000) // 美分，10美元到2000美元
    const registerTime = Date.now() - Mock.Random.integer(1, 365) * 24 * 60 * 60 * 1000
    
    infos.push({
      id: `ri_${Mock.Random.string('lower', 8)}_${i}`,
      phone: phoneFormat(),
      accountUrl: `https://www.tiktok.com/@user${Mock.Random.string('lower', 6)}`,
      accountId: `acc_${Mock.Random.string('lower', 8)}`,
      ownerId: ownerId,
      uid: Mock.Random.integer(1000000, 9999999),
      totalRecharge: totalRechargeInCents,
      day1Coin: Mock.Random.integer(0, 50),
      day2Coin: Mock.Random.integer(0, 100),
      day7Coin: Mock.Random.integer(0, 200),
      day30Coin: Mock.Random.integer(0, totalRechargeInCents),
      registerTime,
      hundredUser: Mock.Random.boolean(),
      valuableUser: Mock.Random.boolean(),
      lastUpdatedAt: Mock.Random.datetime()
    })
  }
  
  return infos
}

// 模拟不同用户的数据
const mockRechargeInfos: Record<string, RechargeInfo[]> = {
  'user_1': generateRechargeInfos('user_1'),
  'user_2': generateRechargeInfos('user_2'),
  'admin': generateRechargeInfos('admin')
}

// 查询充值信息
Mock.mock(RegExp('/api/recharge-infos\\?.*'), 'get', (options: any) => {
  const url = new URL(options.url, 'http://localhost')
  const page = parseInt(url.searchParams.get('page') || '1')
  const pageSize = parseInt(url.searchParams.get('pageSize') || '20')
  const ownerId = url.searchParams.get('ownerId') || 'admin'
  const phoneNos = url.searchParams.get('phoneNos')?.split(',') || []
  
  // 获取当前用户的数据
  let userInfos = mockRechargeInfos[ownerId] || mockRechargeInfos['admin']
  
  // 如果指定了手机编号筛选
  if (phoneNos.length > 0 && phoneNos[0]) {
    userInfos = userInfos.filter(info => 
      phoneNos.some(phone => info.phone.includes(phone))
    )
  }
  
  // 分页
  const start = (page - 1) * pageSize
  const end = start + pageSize
  const items = userInfos.slice(start, end)
  
  const response: QueryRechargeInfoResponse = {
    total: userInfos.length,
    items,
    page,
    pageSize
  }
  
  return {
    code: 200,
    msg: 'ok',
    data: response
  }
})

// 根据账号ID查询充值信息
Mock.mock(RegExp('/api/recharge-infos/account/.*'), 'get', (options: any) => {
  const accountId = options.url.split('/').pop()
  
  // 从所有用户数据中查找
  for (const userInfos of Object.values(mockRechargeInfos)) {
    const info = userInfos.find(item => item.accountId === accountId)
    if (info) {
      return {
        code: 200,
        msg: 'ok',
        data: info
      }
    }
  }
  
  return {
    code: 404,
    msg: '未找到充值信息',
    data: null
  }
})