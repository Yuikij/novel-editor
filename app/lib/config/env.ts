export const API_BASE_URL = process.env.NODE_ENV === 'production'
  ? 'https://api.yourdomain.com' // 生产环境地址
  : 'http://127.0.0.1:18080' // 开发环境地址 