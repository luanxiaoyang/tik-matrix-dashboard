import Mock from 'mockjs'

// 将Mock暴露到全局作用域
;(window as any).Mock = Mock

// 开启Mock并配置拦截XMLHttpRequest和fetch
Mock.setup({
  timeout: '200-600'
})

// 引入各模块的Mock数据
import './auth'
import './accounts'
import './conversions'
import './recharge-infos'

// 确保Mock在开发环境下正常工作
if (import.meta.env.DEV) {
  console.log('Mock数据已启用')
  console.log('Mock interceptors:', Mock._mocked)
  console.log('Mock setup complete, window.Mock:', (window as any).Mock)
  
  // 手动拦截fetch请求以支持现代浏览器
  const originalFetch = window.fetch
  window.fetch = function(input: RequestInfo | URL, init?: RequestInit) {
    const url = typeof input === 'string' ? input : input.toString()
    const method = init?.method?.toUpperCase() || 'GET'
    
    // 检查是否有匹配的Mock规则
    const mockKey = url + method.toLowerCase()
    if (Mock._mocked && Mock._mocked[mockKey]) {
      console.log('Mock intercepted fetch:', url, method)
      const mockHandler = Mock._mocked[mockKey]
      
      return new Promise((resolve) => {
        setTimeout(() => {
          try {
            const result = mockHandler.template({
              url,
              type: method,
              body: init?.body || '{}'
            })
            
            const response = new Response(JSON.stringify(result), {
              status: 200,
              headers: { 'Content-Type': 'application/json' }
            })
            resolve(response)
          } catch (error) {
            console.error('Mock handler error:', error)
            resolve(originalFetch(input, init))
          }
        }, Math.random() * 400 + 200)
      })
    }
    
    return originalFetch(input, init)
  }
  
  // 强制重新设置XMLHttpRequest拦截
  setTimeout(() => {
    console.log('Re-setting up Mock XMLHttpRequest interception')
    Mock.setup({
      timeout: '200-600'
    })
  }, 100)
}