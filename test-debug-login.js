/**
 * 测试 /api/recharge-sync/debug/login 接口
 * 用于调试YAY登录过程
 */

const API_BASE_URL = 'http://localhost:8008/api';

// 测试用户凭据
const TEST_CREDENTIALS = {
  username: 'admin',
  password: 'admin123'
};

/**
 * 登录获取JWT token
 */
async function login() {
  try {
    console.log('🔐 正在登录获取JWT token...');
    
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(TEST_CREDENTIALS),
    });

    const result = await response.json();
    
    if (response.ok && result.data && result.data.accessToken) {
      console.log('✅ 登录成功');
      return result.data.accessToken;
    } else {
      console.error('❌ 登录失败:', result.message || '未知错误');
      return null;
    }
  } catch (error) {
    console.error('❌ 登录请求失败:', error.message);
    return null;
  }
}

/**
 * 测试 debug/login 接口
 */
async function testDebugLogin(token) {
  try {
    console.log('\n🧪 正在测试 /api/recharge-sync/debug/login 接口...');
    
    const response = await fetch(`${API_BASE_URL}/recharge-sync/debug/login`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const result = await response.json();
    
    console.log('📊 响应状态:', response.status, response.statusText);
    console.log('📋 响应数据:');
    console.log(JSON.stringify(result, null, 2));
    
    if (response.ok) {
      console.log('\n✅ debug/login 接口测试成功');
      
      // 分析返回的调试信息
      if (result.data) {
        console.log('\n📈 调试信息分析:');
        console.log('- 请求URL:', result.data.requestUrl);
        console.log('- 响应状态:', result.data.responseStatus);
        console.log('- YAY登录成功:', result.data.success ? '是' : '否');
        
        if (result.data.responseData) {
          console.log('- YAY API响应:', JSON.stringify(result.data.responseData, null, 2));
        }
        
        if (result.data.error) {
          console.log('- 错误信息:', result.data.error);
        }
      }
      
      return result;
    } else {
      console.error('❌ debug/login 接口测试失败:', result.message || '未知错误');
      return null;
    }
  } catch (error) {
    console.error('❌ debug/login 接口请求失败:', error.message);
    return null;
  }
}

/**
 * 主测试函数
 */
async function main() {
  console.log('🚀 开始测试 debug/login 接口\n');
  console.log('=' .repeat(50));
  
  // 步骤1: 登录获取token
  const token = await login();
  if (!token) {
    console.error('\n❌ 无法获取JWT token，测试终止');
    process.exit(1);
  }
  
  // 步骤2: 测试debug/login接口
  const debugResult = await testDebugLogin(token);
  
  console.log('\n' + '=' .repeat(50));
  
  if (debugResult) {
    console.log('🎉 测试完成！debug/login 接口工作正常');
    
    // 输出测试总结
    console.log('\n📝 测试总结:');
    console.log('- 接口地址: /api/recharge-sync/debug/login');
    console.log('- 认证方式: JWT Bearer Token');
    console.log('- 权限要求: system:monitor');
    console.log('- 功能: 调试YAY登录过程');
    
    if (debugResult.data && debugResult.data.success) {
      console.log('- YAY登录状态: 成功 ✅');
    } else {
      console.log('- YAY登录状态: 失败 ❌');
    }
  } else {
    console.log('❌ 测试失败！请检查接口实现或权限配置');
    process.exit(1);
  }
}

// 运行测试
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  login,
  testDebugLogin,
  main
};