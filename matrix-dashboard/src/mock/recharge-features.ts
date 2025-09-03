import Mock from 'mockjs'
import type { AccountRechargeFeature } from '@/types/business'

// 已经不再使用的接口，保留作为参考
interface SyncRechargeFeatureParams {
  userIds: number[]
}

interface SyncRechargeFeatureResponse {
  total: number
  success: number
  failed: Array<{
    userId: number
    reason: string
  }>
  taskId?: string
}

// 生成模拟充值特征数据
const generateRechargeFeatures = (): AccountRechargeFeature[] => {
  const features: AccountRechargeFeature[] = []
  
  for (let i = 0; i < 20; i++) {
    const userId = Mock.Random.integer(1000000, 9999999)
    features.push({
      userId,
      features: Mock.Random.boolean() ? {
        isVip: Mock.Random.boolean(),
        rechargeTotal: Mock.Random.float(0, 2000, 2, 2),
        lastRechargeAt: Mock.Random.datetime(),
        rechargeCount: Mock.Random.integer(0, 50),
        avgRechargeAmount: Mock.Random.float(10, 200, 2, 2)
      } : null,
      lastSyncedAt: Mock.Random.datetime(),
      source: 'yaychat'
    })
  }
  
  return features
}

let mockRechargeFeatures = generateRechargeFeatures()

// 触发批量同步充值特征
Mock.mock('/api/sync/recharge-features', 'post', (options: any) => {
  const params: SyncRechargeFeatureParams = JSON.parse(options.body)
  const { userIds } = params
  
  // 模拟同步过程
  const total = userIds.length
  const successCount = Mock.Random.integer(Math.floor(total * 0.8), total)
  const failedCount = total - successCount
  
  const failed = []
  for (let i = 0; i < failedCount; i++) {
    failed.push({
      userId: userIds[i],
      reason: Mock.Random.pick(['rate limited', 'user not found', 'network error'])
    })
  }
  
  // 更新或添加成功同步的特征数据
  const successUserIds = userIds.slice(failedCount)
  successUserIds.forEach(userId => {
    const existingIndex = mockRechargeFeatures.findIndex(f => f.userId === userId)
    const newFeature: AccountRechargeFeature = {
      userId,
      features: Mock.Random.boolean() ? {
        isVip: Mock.Random.boolean(),
        rechargeTotal: Mock.Random.float(0, 2000, 2, 2),
        lastRechargeAt: Mock.Random.datetime(),
        rechargeCount: Mock.Random.integer(0, 50),
        avgRechargeAmount: Mock.Random.float(10, 200, 2, 2)
      } : null,
      lastSyncedAt: new Date().toISOString(),
      source: 'yaychat'
    }
    
    if (existingIndex >= 0) {
      mockRechargeFeatures[existingIndex] = newFeature
    } else {
      mockRechargeFeatures.push(newFeature)
    }
  })
  
  return {
    code: 200,
    msg: 'ok',
    data: {
      total,
      success: successCount,
      failed,
      taskId: `sync_${Mock.Random.datetime('yyyyMMdd')}_${Mock.Random.string('number', 3)}`
    }
  }
})

// 批量查询用户充值特征
Mock.mock(RegExp('/api/recharge-features\\?.*'), 'get', (options: any) => {
  const url = new URL(options.url, 'http://localhost')
  const userIdsParam = url.searchParams.get('userIds')
  
  if (!userIdsParam) {
    return {
      code: 400,
      msg: '缺少userIds参数',
      data: null
    }
  }
  
  const userIds = userIdsParam.split(',').map(id => parseInt(id.trim()))
  const result: AccountRechargeFeature[] = []
  
  userIds.forEach(userId => {
    const existing = mockRechargeFeatures.find(f => f.userId === userId)
    if (existing) {
      result.push(existing)
    } else {
      // 如果不存在，返回空特征数据
      result.push({
        userId,
        features: null,
        lastSyncedAt: new Date().toISOString(),
        source: 'yaychat'
      })
    }
  })
  
  return {
    code: 200,
    msg: 'ok',
    data: result
  }
})