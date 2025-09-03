const axios = require('axios');

async function testLogin() {
  try {
    const response = await axios.post('http://localhost:3000/api/auth/login', {
      username: 'admin',
      password: 'admin123'
    });
    
    console.log('✅ 登录成功!');
    console.log('响应状态:', response.status);
    console.log('响应数据:', JSON.stringify(response.data, null, 2));
    
    // 提取token信息
    const { user, accessToken, refreshToken } = response.data.data;
    console.log('\n📋 用户信息:');
    console.log('- 用户名:', user.username);
    console.log('- 邮箱:', user.email);
    console.log('- 角色:', user.roles.map(r => r.name).join(', '));
    console.log('- 权限数量:', user.roles[0]?.permissions?.length || 0);
    
    console.log('\n🔑 Token信息:');
    console.log('- Access Token:', accessToken.substring(0, 50) + '...');
    console.log('- Refresh Token:', refreshToken);
    
    // 测试使用token访问受保护的接口
    await testProtectedAPI(accessToken);
    
  } catch (error) {
    console.log('❌ 登录失败!');
    console.log('错误状态:', error.response?.status);
    console.log('错误信息:', error.response?.data);
  }
}

async function testProtectedAPI(token) {
  try {
    console.log('\n🔒 测试受保护的API...');
    const response = await axios.get('http://localhost:3000/api/auth/profile', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ 受保护API访问成功!');
    console.log('用户资料:', response.data.data.username);
  } catch (error) {
    console.log('❌ 受保护API访问失败!');
    console.log('错误:', error.response?.data?.message || error.message);
  }
}

testLogin();