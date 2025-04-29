export const API_BASE_URL = process.env.NODE_ENV === 'production'
  ? 'https://novel-ai.yuisama.top:9004' // 生产环境地址
  : 'http://127.0.0.1:18080' // 开发环境地址 