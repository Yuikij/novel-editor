/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // 以下配置可选，但不推荐设置output: 'export'，
  // 因为我们已经在每个路由文件添加了Edge Runtime配置
}

module.exports = nextConfig 