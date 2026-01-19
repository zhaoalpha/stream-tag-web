// src/utils/request.ts
import axios from 'axios'

// 创建 axios 实例
const request = axios.create({
  // baseURL 将在下一步通过环境变量配置
  baseURL: import.meta.env.VITE_APP_BASE_API,
  timeout: 10000 // 10 秒超时
})

// 请求拦截器（目前留空，后续可加 token、loading 等）
request.interceptors.request.use(
  (config) => {
    // 例如：config.headers.Authorization = 'xxx'
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器（简单处理返回数据）
request.interceptors.response.use(
  (response) => {
    // 假设后端返回格式为 { code: 200, data: ..., msg: '' }
    // 这里直接返回 response.data，让调用者拿到业务数据
    return response.data
  },
  (error) => {
    console.error('请求失败:', error)
    return Promise.reject(error)
  }
)

export default request
