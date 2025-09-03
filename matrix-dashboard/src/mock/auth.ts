import Mock from 'mockjs'
import type { LoginParams, UserInfo, UserRole } from '@/types/auth'

// 模拟用户数据
const users = [
  {
    id: 'u_1001',
    username: 'admin',
    password: 'admin123',
    role: 'SUPER_ADMIN',
    teamId: 't_01'
  },
  {
    id: 'u_1002', 
    username: 'conversion_admin',
    password: 'admin123',
    role: 'CONVERSION_ADMIN',
    teamId: 't_01'
  },
  {
    id: 'u_1003',
    username: 'converter',
    password: 'user123', 
    role: 'CONVERTER',
    teamId: 't_01'
  },
  {
    id: 'u_1004',
    username: 'operator',
    password: 'user123',
    role: 'OPERATOR', 
    teamId: 't_01'
  }
]

// 登录接口
Mock.mock('/api/auth/login', 'post', (options: any) => {
  const { username, password }: LoginParams = JSON.parse(options.body)
  
  const user = users.find(u => u.username === username && u.password === password)
  
  if (!user) {
    return {
      code: 400,
      msg: '用户名或密码错误',
      data: null
    }
  }
  
  const token = Mock.Random.string('upper', 32)
  const userInfo: UserInfo = {
    id: user.id,
    username: user.username,
    role: user.role as UserRole,
    teamId: user.teamId,
    createdAt: Mock.Random.datetime()
  }
  
  return {
    code: 200,
    msg: 'ok',
    data: {
      token,
      userInfo
    }
  }
})

// 获取当前用户信息
Mock.mock('/api/auth/me', 'get', (options: any) => {
  // 在Mock环境中，我们简化token验证逻辑
  // 实际项目中应该根据token查找对应的用户信息
  console.log('Mock /api/auth/me called with options:', options)
  
  // 模拟根据token获取用户信息
  const userInfo: UserInfo = {
    id: 'u_1001',
    username: 'admin',
    role: 'SUPER_ADMIN' as any,
    teamId: 't_01',
    createdAt: '2025-01-01T00:00:00Z'
  }
  
  return {
    code: 200,
    msg: 'ok',
    data: userInfo
  }
})

// 登出接口
Mock.mock('/api/auth/logout', 'post', () => {
  return {
    code: 200,
    msg: 'ok',
    data: null
  }
})