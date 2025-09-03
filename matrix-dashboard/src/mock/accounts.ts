import Mock from 'mockjs'
import type { Account, CreateAccountParams } from '@/types/business'
import { AccountStatus } from '@/types/business'

// 生成模拟账号数据
const generateAccounts = (count: number): Account[] => {
  const accounts: Account[] = []
  
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
  
  // 用户ID列表，确保有一些账号归属于当前用户（默认使用u_1001）
  const userIds = ['u_1001', 'u_1002', 'u_1003', 'u_1004']
  
  for (let i = 1; i <= count; i++) {
    const phoneFormat = Mock.Random.pick(phoneFormats)
    // 确保前20个账号归属于当前用户（u_1001），便于测试
    const ownerId = i <= 20 ? 'u_1001' : Mock.Random.pick(userIds)
    const createdBy = Mock.Random.pick(userIds)
    
    accounts.push({
      id: `acc_${Mock.Random.string('number', 3)}_${i}`,
      phoneNo: phoneFormat(),
      accountLink: `https://www.tiktok.com/@${Mock.Random.string('lower', 8)}`,
      ownerId,
      createdBy,
      status: Mock.Random.pick(['ACTIVE', 'DISABLED']),
      createdAt: Mock.Random.datetime(),
      stats: {
        conversionCount: Mock.Random.integer(0, 20)
      },
      lastRechargeFeature: Mock.Random.boolean() ? {
        userId: Mock.Random.integer(1000000, 9999999),
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
  
  return accounts
}

let mockAccounts = generateAccounts(50)

// 添加一些测试数据确保有内容
mockAccounts.unshift(
  {
    id: 'acc_test_001',
    phoneNo: 'us-123',
    accountLink: 'https://www.tiktok.com/@testuser1',
    ownerId: 'u_1001',
    createdBy: 'u_1001',
    status: AccountStatus.ACTIVE,
    createdAt: new Date().toISOString(),
    stats: { conversionCount: 5 }
  },
  {
    id: 'acc_test_002', 
    phoneNo: '美国456',
    accountLink: 'https://www.tiktok.com/@testuser2',
    ownerId: 'u_1001',
    createdBy: 'u_1001',
    status: AccountStatus.ACTIVE,
    createdAt: new Date().toISOString(),
    stats: { conversionCount: 3 }
  },
  {
    id: 'acc_test_003',
    phoneNo: '云789',
    accountLink: 'https://www.tiktok.com/@testuser3', 
    ownerId: 'u_1001',
    createdBy: 'u_1001',
    status: AccountStatus.ACTIVE,
    createdAt: new Date().toISOString(),
    stats: { conversionCount: 8 }
  }
)

// 创建账号
Mock.mock('/api/accounts', 'post', (options: any) => {
  const params: CreateAccountParams = JSON.parse(options.body)
  
  // 检查phoneNo是否已存在
  const exists = mockAccounts.find(acc => acc.phoneNo === params.phoneNo)
  if (exists) {
    return {
      code: 400,
      msg: 'phoneNo already exists',
      data: null
    }
  }
  
  const newAccount: Account = {
    id: `acc_${Mock.Random.string('number', 3)}`,
    phoneNo: params.phoneNo,
    accountLink: params.accountLink,
    ownerId: params.ownerId || 'u_1001', // 默认归属
    createdBy: 'u_1001', // 模拟当前用户
    status: AccountStatus.ACTIVE,
    createdAt: new Date().toISOString(),
    stats: {
      conversionCount: 0
    }
  }
  
  mockAccounts.unshift(newAccount)
  
  return {
    code: 200,
    msg: 'ok',
    data: newAccount
  }
})

// 获取账号列表
Mock.mock(RegExp('/api/accounts\\?.*'), 'get', (options: any) => {
  const url = new URL(options.url, 'http://localhost')
  const params = Object.fromEntries(url.searchParams)
  
  const page = parseInt(params.page) || 1
  const pageSize = parseInt(params.pageSize) || 20
  const q = params.q || ''
  const ownerId = params.ownerId
  const createdBy = params.createdBy
  
  let filteredAccounts = [...mockAccounts]
  
  // 模糊搜索
  if (q) {
    filteredAccounts = filteredAccounts.filter(acc => 
      acc.phoneNo.includes(q) || acc.accountLink.includes(q)
    )
  }
  
  // 按归属过滤
  if (ownerId) {
    filteredAccounts = filteredAccounts.filter(acc => acc.ownerId === ownerId)
  }
  
  // 按创建者过滤
  if (createdBy) {
    filteredAccounts = filteredAccounts.filter(acc => acc.createdBy === createdBy)
  }
  
  const total = filteredAccounts.length
  const start = (page - 1) * pageSize
  const end = start + pageSize
  const items = filteredAccounts.slice(start, end)
  
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

// 获取账号详情
Mock.mock(RegExp('/api/accounts/[^/]+$'), 'get', (options: any) => {
  const id = options.url.split('/').pop()
  const account = mockAccounts.find(acc => acc.id === id)
  
  if (!account) {
    return {
      code: 404,
      msg: '账号不存在',
      data: null
    }
  }
  
  return {
    code: 200,
    msg: 'ok',
    data: account
  }
})

// 更新账号归属
Mock.mock(RegExp('/api/accounts/[^/]+/owner$'), 'patch', (options: any) => {
  const id = options.url.split('/')[3]
  const { ownerId } = JSON.parse(options.body)
  
  const accountIndex = mockAccounts.findIndex(acc => acc.id === id)
  if (accountIndex === -1) {
    return {
      code: 404,
      msg: '账号不存在',
      data: null
    }
  }
  
  mockAccounts[accountIndex].ownerId = ownerId
  
  return {
    code: 200,
    msg: 'ok',
    data: mockAccounts[accountIndex]
  }
})