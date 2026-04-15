import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios'

// 响应数据结构
export interface ApiResponse<T = any> {
  data: T
  code?: number
  message?: string
}

// 创建 axios 实例
const service: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
service.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 可在此处添加 token
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    // 从 localStorage 获取当前用户 ID
    const memberId = localStorage.getItem('memberId')
    if (memberId) {
      config.headers['X-Member-Id'] = memberId
    }

    return config
  },
  (error) => {
    console.error('请求错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  (response: AxiosResponse) => {
    return response
  },
  (error) => {
    const { response } = error
    if (response) {
      switch (response.status) {
        case 401:
          console.error('未授权，请登录')
          break
        case 403:
          console.error('拒绝访问')
          break
        case 404:
          console.error('请求地址不存在')
          break
        case 500:
          console.error('服务器内部错误')
          break
        default:
          console.error(`请求错误: ${response.status}`)
      }
    } else {
      console.error('网络连接异常')
    }
    return Promise.reject(error)
  }
)

// 封装 GET 请求
export function get<T>(url: string, params?: object, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
  return service.get(url, { params, ...config })
}

// 封装 POST 请求
export function post<T>(url: string, data?: object, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
  return service.post(url, data, config)
}

// 封装 PUT 请求
export function put<T>(url: string, data?: object, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
  return service.put(url, data, config)
}

// 封装 DELETE 请求
export function del<T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
  return service.delete(url, config)
}

export default service
