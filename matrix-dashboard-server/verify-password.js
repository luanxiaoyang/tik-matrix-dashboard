const bcrypt = require('bcrypt');
const mysql = require('mysql2/promise');

async function testPassword() {
  // 连接数据库
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '123456',
    database: 'matrix_dashboard'
  });

  try {
    // 获取数据库中的密码哈希
    const [rows] = await connection.execute(
      'SELECT username, password FROM users WHERE username = ?',
      ['admin']
    );

    if (rows.length === 0) {
      console.log('用户不存在');
      return;
    }

    const user = rows[0];
    console.log('用户名:', user.username);
    console.log('数据库密码哈希:', user.password);

    // 测试不同密码
    const passwords = ['admin123', 'admin', '123456', 'password'];
    
    for (const pwd of passwords) {
      const isMatch = await bcrypt.compare(pwd, user.password);
      console.log(`密码 '${pwd}' 匹配结果:`, isMatch);
    }

    // 生成admin123的正确哈希
    const correctHash = await bcrypt.hash('admin123', 10);
    console.log('\nadmin123的新哈希:', correctHash);
    
    // 验证新哈希
    const newHashMatch = await bcrypt.compare('admin123', correctHash);
    console.log('新哈希验证结果:', newHashMatch);

  } finally {
    await connection.end();
  }
}

testPassword().catch(console.error);