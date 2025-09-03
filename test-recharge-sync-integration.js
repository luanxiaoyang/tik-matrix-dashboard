/**
 * 充值同步YAY登录调试集成测试脚本
 * 集成debug/login接口测试结果到充值同步流程中
 */

const API_BASE_URL = 'http://localhost:8008/api';

// 测试用户凭据
const TEST_CREDENTIALS = {
  username: 'admin',
  password: 'admin123'
};

// 测试用户ID列表
const TEST_USER_IDS = '123456,789012,345678';

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
 * 步骤1: 调试YAY登录过程
 */
async function debugYayLogin(token) {
  try {
    console.log('\n🧪 步骤1: 调试YAY登录过程...');
    
    const response = await fetch(`${API_BASE_URL}/recharge-sync/debug/login`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const result = await response.json();
    
    if (response.ok && result.data && result.data.success) {
      console.log('✅ YAY登录调试成功');
      console.log('📋 YAY Token获取成功:', result.data.responseData.token ? '是' : '否');
      
      return {
        success: true,
        yayToken: result.data.responseData.token,
        websocketToken: result.data.responseData.websocketToken,
        debugInfo: result.data
      };
    } else {
      console.error('❌ YAY登录调试失败:', result.message || '未知错误');
      return { success: false, error: result.message };
    }
  } catch (error) {
    console.error('❌ YAY登录调试请求失败:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * 步骤2: 测试YAY API连接
 */
async function testYayConnection(token) {
  try {
    console.log('\n🔗 步骤2: 测试YAY API连接...');
    
    const response = await fetch(`${API_BASE_URL}/recharge-sync/test/connection`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ YAY API连接测试成功');
      return { success: true, data: result.data };
    } else {
      console.error('❌ YAY API连接测试失败:', result.message || '未知错误');
      return { success: false, error: result.message };
    }
  } catch (error) {
    console.error('❌ YAY API连接测试请求失败:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * 步骤3: 使用获取的YAY Token直接测试API
 */
async function testDirectApiWithToken(token, yayToken) {
  try {
    console.log('\n🎯 步骤3: 使用YAY Token直接测试API...');
    
    const response = await fetch(`${API_BASE_URL}/recharge-sync/test/direct-api`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userIds: TEST_USER_IDS,
        token: yayToken
      }),
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ 直接API测试成功');
      console.log('📊 获取到用户数据:', result.data ? Object.keys(result.data).length : 0, '条');
      return { success: true, data: result.data };
    } else {
      console.error('❌ 直接API测试失败:', result.message || '未知错误');
      return { success: false, error: result.message };
    }
  } catch (error) {
    console.error('❌ 直接API测试请求失败:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * 步骤4: 使用YAY Token直接同步数据
 */
async function syncDirectWithToken(token, yayToken) {
  try {
    console.log('\n💾 步骤4: 使用YAY Token直接同步数据...');
    
    const response = await fetch(`${API_BASE_URL}/recharge-sync/sync-direct`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userIds: TEST_USER_IDS,
        token: yayToken
      }),
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ 直接同步成功');
      console.log('📈 同步统计:', {
        成功: result.data?.syncedCount || 0,
        失败: result.data?.failedCount || 0
      });
      return { success: true, data: result.data };
    } else {
      console.error('❌ 直接同步失败:', result.message || '未知错误');
      return { success: false, error: result.message };
    }
  } catch (error) {
    console.error('❌ 查询同步结果请求失败:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * 主测试流程
 */
async function runIntegrationTest() {
  console.log('🚀 开始充值同步YAY登录调试集成测试\n');
  console.log('=' .repeat(60));
  
  // 登录获取token
  const token = await login();
  if (!token) {
    console.log('\n❌ 测试终止：无法获取认证token');
    return;
  }
  
  let testResults = {
    login: true,
    debugYayLogin: false,
    testConnection: false,
    directApiTest: false,
    directSync: false,
    checkResults: false
  };
  
  // 步骤1: 调试YAY登录
  const yayLoginResult = await debugYayLogin(token);
  testResults.debugYayLogin = yayLoginResult.success;
  
  if (!yayLoginResult.success) {
    console.log('\n❌ 测试终止：YAY登录调试失败');
    printTestSummary(testResults);
    return;
  }
  
  const yayToken = yayLoginResult.yayToken;
  
  // 步骤2: 测试YAY API连接
  const connectionResult = await testYayConnection(token);
  testResults.testConnection = connectionResult.success;
  
  // 步骤3: 使用YAY Token直接测试API
  if (yayToken) {
    const directApiResult = await testDirectApiWithToken(token, yayToken);
    testResults.directApiTest = directApiResult.success;
    
    // 步骤4: 使用YAY Token直接同步数据
    if (directApiResult.success) {
      const syncResult = await syncDirectWithToken(token, yayToken);
      testResults.directSync = syncResult.success;
    }
  }
  
  // 步骤5: 查询同步结果
  const resultsCheck = await checkSyncResults(token);
  testResults.checkResults = resultsCheck.success;
  
  // 打印测试总结
  printTestSummary(testResults, yayLoginResult.debugInfo);
}

/**
 * 打印测试总结
 */
function printTestSummary(results, debugInfo = null) {
  console.log('\n' + '=' .repeat(60));
  console.log('📊 充值同步YAY登录调试集成测试总结');
  console.log('=' .repeat(60));
  
  const steps = [
    { name: '系统登录认证', key: 'login' },
    { name: 'YAY登录调试', key: 'debugYayLogin' },
    { name: 'YAY API连接测试', key: 'testConnection' },
    { name: '直接API测试', key: 'directApiTest' },
    { name: '直接数据同步', key: 'directSync' },
    { name: '同步结果查询', key: 'checkResults' }
  ];
  
  steps.forEach((step, index) => {
    const status = results[step.key] ? '✅ 成功' : '❌ 失败';
    console.log(`${index + 1}. ${step.name}: ${status}`);
  });
  
  const successCount = Object.values(results).filter(Boolean).length;
  const totalCount = Object.keys(results).length;
  
  console.log('\n📈 测试统计:');
  console.log(`- 成功步骤: ${successCount}/${totalCount}`);
  console.log(`- 成功率: ${Math.round(successCount / totalCount * 100)}%`);
  
  if (debugInfo && debugInfo.success) {
    console.log('\n🔍 YAY登录调试详情:');
    console.log(`- 请求URL: ${debugInfo.requestUrl}`);
    console.log(`- 响应状态: ${debugInfo.responseStatus}`);
    console.log(`- YAY Token: ${debugInfo.responseData.token ? '已获取' : '未获取'}`);
    console.log(`- WebSocket Token: ${debugInfo.responseData.websocketToken ? '已获取' : '未获取'}`);
  }
  
  console.log('\n🎯 集成测试完成!');
  
  if (successCount === totalCount) {
    console.log('🎉 所有测试步骤均通过，充值同步YAY登录调试功能正常！');
  } else {
    console.log('⚠️  部分测试步骤失败，请检查相关接口和配置。');
  }
}

// 运行测试
if (require.main === module) {
  runIntegrationTest().catch(console.error);
}

/**
 * 步骤5: 查询同步结果
 */
async function checkSyncResults(token) {
  try {
    console.log('\n📋 步骤5: 查询同步结果...');
    
    const response = await fetch(`${API_BASE_URL}/recharge-sync/list?page=1&limit=10`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ 查询同步结果成功');
      console.log('📊 数据统计:', {
        总数: result.data?.total || 0,
        当前页: result.data?.page || 1,
        每页数量: result.data?.limit || 10
      });
      return { success: true, data: result.data };
    } else {
      console.error('❌ 查询同步结果失败:', result.message || '未知错误');
      return { success: false, error: result.message };
    }
  } catch (error) {
    console.error('❌ 查询同步结果请求失败:', error.message);
    return { success: false, error: error.message };
  }
}

// 运行测试
if (require.main === module) {
  runIntegrationTest().catch(console.error);
}

module.exports = {
  runIntegrationTest,
  login,
  debugYayLogin,
  testYayConnection,
  testDirectApiWithToken,
  syncDirectWithToken,
  checkSyncResults
};