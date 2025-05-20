export const runtime = 'edge';

import Link from "next/link"
import { LogoIcon } from "@/app/components/ui/icons"
import { Button } from "@/app/components/ui/button"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900 text-white relative overflow-hidden">
      {/* Animated starry background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="particles-container absolute inset-0">
          {Array.from({ length: 40 }).map((_, i) => (
            <div 
              key={i}
              className={`particle absolute rounded-full bg-white/20 blur-sm animate-float`}
              style={{
                width: `${Math.random() * 6 + 2}px`,
                height: `${Math.random() * 6 + 2}px`,
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 10}s`,
                animationDuration: `${Math.random() * 20 + 15}s`,
              }}
            />
          ))}
        </div>
      </div>

      <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-black/20 backdrop-blur-lg">
        <div className="container flex h-16 items-center">
          <div className="flex items-center gap-2 font-bold">
            <LogoIcon className="h-7 w-7 text-purple-400" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-300 text-lg">小说AI</span>
          </div>
          <div className="flex flex-1 items-center justify-end space-x-4">
            <nav className="flex items-center space-x-6">
              <Link
                href="/features"
                className="text-sm font-medium text-white/80 transition-colors hover:text-purple-300"
              >
                功能特性
              </Link>
              <Link
                href="/pricing"
                className="text-sm font-medium text-white/80 transition-colors hover:text-purple-300"
              >
                价格方案
              </Link>
              <Link
                href="/login"
                className="text-sm font-medium text-white/80 transition-colors hover:text-purple-300"
              >
                账户登录
              </Link>
              <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg shadow-purple-500/20 border-0 animate-shimmer" asChild size="sm">
                <Link href="/signup">立即注册</Link>
              </Button>
            </nav>
          </div>
        </div>
      </header>

      <main className="flex-1 relative z-10">
        {/* Hero section with animation */}
        <section className="w-full py-20 md:py-32 lg:py-40 xl:py-40 relative overflow-hidden">
          {/* Animated gradient orbs */}
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-gradient-to-r from-purple-700/30 to-pink-700/30 rounded-full blur-3xl animate-pulse-slow"></div>
          <div className="absolute -bottom-60 -right-40 w-96 h-96 bg-gradient-to-r from-indigo-700/30 to-blue-700/30 rounded-full blur-3xl animate-pulse-slow"></div>
          
          <div className="container px-4 md:px-6 relative">
            <div className="flex flex-col items-center gap-6 text-center">
              <div className="space-y-4">
                <h1 className="text-5xl font-bold tracking-tighter sm:text-6xl md:text-7xl">
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-300 to-blue-400 animate-gradient">
                    人工智能驱动的小说创作工具
                  </span>
                  <span className="mt-1 block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-300 to-pink-400 animate-gradient-reverse">
                    专业文学创作的得力助手
                  </span>
                </h1>
                <p className="mx-auto max-w-[800px] text-white/80 text-xl md:text-2xl leading-relaxed">
                  利用先进的人工智能技术，辅助您进行专业化的小说创作。从深度的角色塑造、严谨的世界构建到完善的故事架构，让您的创作效率提升至新高度。
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-4 mt-6">
                <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-full px-8 py-3 h-14 text-md md:text-lg font-medium shadow-lg shadow-purple-500/30 animate-shimmer border-0 transition-all hover:scale-105" asChild>
                  <Link href="/dashboard">开始专业创作</Link>
                </Button>
                <Button variant="outline" className="bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 text-white rounded-full px-8 py-3 h-14 text-md md:text-lg transition-all hover:scale-105" asChild>
                  <Link href="/demo">观看功能演示</Link>
                </Button>
              </div>
              
              {/* Book illustration with 3D effect */}
              <div className="mt-16 relative w-full max-w-4xl mx-auto">
                <div className="aspect-[16/9] w-full bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-white/10 shadow-2xl overflow-hidden relative group perspective">
                  {/* SVG illustration of a book with ethereal effects */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-90 group-hover:scale-105 transition-transform duration-700">
                    <svg width="60%" height="60%" viewBox="0 0 800 600" fill="none" xmlns="http://www.w3.org/2000/svg" className="max-w-lg">
                      <g className="animate-float" style={{ animationDuration: '15s' }}>
                        {/* Book */}
                        <path d="M200 150 L600 150 L600 450 L200 450 Z" fill="url(#bookGradient)" />
                        <path d="M600 150 L650 200 L650 500 L600 450 Z" fill="url(#bookSideGradient)" />
                        <path d="M200 450 L600 450 L650 500 L250 500 Z" fill="url(#bookBottomGradient)" />
                        
                        {/* Pages */}
                        <path d="M220 170 L580 170 L580 430 L220 430 Z" fill="#1e1b4b" stroke="#6366f1" strokeWidth="1" />
                        
                        {/* Magical elements */}
                        <circle cx="400" cy="300" r="80" fill="url(#glowGradient)" filter="blur(20px)" />
                        
                        {/* Stars */}
                        <circle cx="300" cy="200" r="3" fill="white" className="animate-pulse-slow" style={{ animationDelay: '0.5s' }} />
                        <circle cx="500" cy="250" r="2" fill="white" className="animate-pulse-slow" style={{ animationDelay: '1.2s' }} />
                        <circle cx="400" cy="400" r="4" fill="white" className="animate-pulse-slow" style={{ animationDelay: '0.8s' }} />
                        <circle cx="550" cy="350" r="3" fill="white" className="animate-pulse-slow" style={{ animationDelay: '1.5s' }} />
                        <circle cx="250" cy="350" r="2" fill="white" className="animate-pulse-slow" style={{ animationDelay: '0.3s' }} />
                      </g>
                      
                      {/* Text lines */}
                      <g opacity="0.7">
                        <rect x="250" y="200" width="300" height="4" rx="2" fill="#a78bfa" />
                        <rect x="250" y="220" width="250" height="4" rx="2" fill="#a78bfa" />
                        <rect x="250" y="240" width="280" height="4" rx="2" fill="#a78bfa" />
                        <rect x="250" y="300" width="300" height="4" rx="2" fill="#a78bfa" />
                        <rect x="250" y="320" width="220" height="4" rx="2" fill="#a78bfa" />
                        <rect x="250" y="340" width="280" height="4" rx="2" fill="#a78bfa" />
                        <rect x="250" y="360" width="260" height="4" rx="2" fill="#a78bfa" />
                      </g>
                      
                      {/* Gradients */}
                      <defs>
                        <linearGradient id="bookGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#4c1d95" />
                          <stop offset="100%" stopColor="#6d28d9" />
                        </linearGradient>
                        <linearGradient id="bookSideGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#5b21b6" />
                          <stop offset="100%" stopColor="#4c1d95" />
                        </linearGradient>
                        <linearGradient id="bookBottomGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#4c1d95" />
                          <stop offset="100%" stopColor="#3b0764" />
                        </linearGradient>
                        <radialGradient id="glowGradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                          <stop offset="0%" stopColor="#c4b5fd" stopOpacity="0.8" />
                          <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
                        </radialGradient>
                      </defs>
                    </svg>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <div className="w-1/3 h-1 bg-gradient-to-r from-purple-500 to-pink-500 mb-4"></div>
                    <h3 className="text-2xl font-bold mb-2">智能辅助创作平台</h3>
                    <p className="text-white/80">提供专业的写作洞察与建议，优化创作流程</p>
                  </div>
                </div>
                
                {/* Floating elements */}
                <div className="absolute -top-8 -right-8 w-24 h-24 bg-purple-500/30 rounded-full blur-2xl animate-pulse-slow"></div>
                <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-pink-500/30 rounded-full blur-2xl animate-pulse-slow delay-700"></div>
              </div>
            </div>
          </div>
        </section>

        {/* Features section */}
        <section className="w-full py-20 md:py-32 relative overflow-hidden">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm"></div>
          <div className="container px-4 md:px-6 relative z-10">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-300">
                专业创作工具套件
              </h2>
              <p className="max-w-2xl mx-auto text-xl text-white/80">
                我们的人工智能平台提供全面的创作解决方案，满足专业小说家的各项需求
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-8 rounded-xl hover:bg-white/10 transition-all hover:scale-105 group">
                <div className="mb-6 w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-purple-500/20 group-hover:rotate-6 transition-transform">
                  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <h3 className="text-2xl font-bold mb-3 group-hover:text-purple-300 transition-colors">角色构建系统</h3>
                <p className="text-white/70 leading-relaxed">
                  基于心理学模型的角色设计工具，创建具有深度、多维度且发展连贯的人物形象。
                </p>
              </div>
              
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-8 rounded-xl hover:bg-white/10 transition-all hover:scale-105 group">
                <div className="mb-6 w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 group-hover:rotate-6 transition-transform">
                  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <line x1="10" y1="7" x2="16" y2="7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    <line x1="10" y1="12" x2="16" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    <line x1="10" y1="17" x2="16" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </div>
                <h3 className="text-2xl font-bold mb-3 group-hover:text-blue-300 transition-colors">叙事结构分析</h3>
                <p className="text-white/70 leading-relaxed">
                  结合经典叙事理论与现代文学分析，优化故事结构，提高作品的叙事张力与吸引力。
                </p>
              </div>
              
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-8 rounded-xl hover:bg-white/10 transition-all hover:scale-105 group">
                <div className="mb-6 w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center text-white shadow-lg shadow-pink-500/20 group-hover:rotate-6 transition-transform">
                  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M2 12h20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <h3 className="text-2xl font-bold mb-3 group-hover:text-pink-300 transition-colors">世界构建引擎</h3>
                <p className="text-white/70 leading-relaxed">
                  系统化构建具有内在逻辑和一致性的虚构世界，包括地理、历史、文化、社会制度等维度。
                </p>
              </div>
              
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-8 rounded-xl hover:bg-white/10 transition-all hover:scale-105 group">
                <div className="mb-6 w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white shadow-lg shadow-amber-500/20 group-hover:rotate-6 transition-transform">
                  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M15 3h6v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M10 14L21 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <h3 className="text-2xl font-bold mb-3 group-hover:text-amber-300 transition-colors">文学风格优化</h3>
                <p className="text-white/70 leading-relaxed">
                  基于文体学分析与语言学原理，提升作品语言表达，塑造独特且一致的文学风格。
                </p>
              </div>
            </div>
            
            {/* Stats section with SVG wave */}
            <div className="mt-24 relative">
              <div className="absolute top-0 left-0 w-full overflow-hidden" style={{ transform: 'translateY(-98%)' }}>
                <svg preserveAspectRatio="none" width="100%" height="50" viewBox="0 0 1440 74" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M0,37 C240,67 480,82 720,74 C960,67 1200,37 1440,37 L1440,74 L0,74 Z" fill="rgba(124, 58, 237, 0.12)"></path>
                </svg>
              </div>
              
              <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-10 shadow-xl">
                <div className="grid md:grid-cols-3 gap-8 text-center">
                  <div className="space-y-2">
                    <p className="text-4xl font-bold text-purple-300">97%</p>
                    <p className="text-white/70">用户创作效率提升</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-4xl font-bold text-blue-300">300+</p>
                    <p className="text-white/70">叙事结构模板</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-4xl font-bold text-pink-300">100万+</p>
                    <p className="text-white/70">已生成文学素材</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* CTA Banner */}
            <div className="mt-24 text-center">
              <div className="relative bg-gradient-to-r from-purple-900/40 to-blue-900/40 backdrop-blur-sm border border-white/10 p-10 rounded-2xl overflow-hidden group hover:shadow-xl hover:shadow-purple-500/10 transition-all">
                <div className="absolute -top-20 -left-20 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl"></div>
                
                {/* SVG illustration */}
                <div className="absolute top-0 right-0 w-32 h-32 md:w-40 md:h-40 opacity-30">
                  <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <g className="animate-float" style={{ animationDuration: '20s' }}>
                      <path d="M145.824 166.441C125.469 188.753 91.6026 185.199 70.0794 166.441C48.5562 147.684 36.0939 118.098 42.2425 91.9604C48.391 65.8225 67.4474 48.6342 93.4375 41.9146C119.428 35.195 152.394 38.9153 168.148 61.9022C183.903 84.8892 166.179 144.129 145.824 166.441Z" fill="url(#paint0_radial)" fillOpacity="0.6"/>
                      <path d="M122.687 140.913C116.359 148.156 106.536 150.009 98.5476 148.458C90.5594 146.908 84.4056 141.955 80.0968 136.037C75.788 130.12 73.3242 123.237 76.3016 116.868C79.279 110.5 84.5654 107.301 91.5193 104.953C98.4731 102.604 107.093 101.106 113.421 105.101C119.75 109.096 118.259 125.669 122.687 140.913Z" fill="#8b5cf6" fillOpacity="0.5"/>
                      <circle cx="62" cy="70" r="10" fill="#a78bfa" fillOpacity="0.5" className="animate-pulse-slow" style={{ animationDelay: '1.2s' }}/>
                      <circle cx="120" cy="40" r="6" fill="#a78bfa" fillOpacity="0.5" className="animate-pulse-slow" style={{ animationDelay: '0.5s' }}/>
                      <circle cx="155" cy="90" r="8" fill="#a78bfa" fillOpacity="0.5" className="animate-pulse-slow" style={{ animationDelay: '0.8s' }}/>
                      <circle cx="50" cy="120" r="7" fill="#a78bfa" fillOpacity="0.5" className="animate-pulse-slow" style={{ animationDelay: '1.5s' }}/>
                    </g>
                    <defs>
                      <radialGradient id="paint0_radial" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(108 104) rotate(90) scale(80)">
                        <stop stopColor="#c4b5fd"/>
                        <stop offset="1" stopColor="#8b5cf6" stopOpacity="0"/>
                      </radialGradient>
                    </defs>
                  </svg>
                </div>
                
                <h3 className="text-2xl md:text-3xl font-bold mb-3 relative z-10">准备好提升您的文学创作了吗？</h3>
                <p className="text-xl text-white/80 mb-6 max-w-2xl mx-auto relative z-10">加入专业作家社区，利用AI技术突破创作瓶颈，实现文学创作的新高度</p>
                <Button className="bg-white text-purple-900 hover:bg-purple-100 rounded-full px-8 py-3 text-lg font-medium relative z-10 group-hover:scale-105 transition-transform" asChild>
                  <Link href="/signup">免费开始 14 天专业版试用</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 py-8 md:py-10 relative z-10 bg-black/20 backdrop-blur-md">
        <div className="container flex flex-col items-center justify-between gap-4 md:flex-row px-4">
          <div className="flex items-center gap-2 font-bold">
            <LogoIcon className="h-5 w-5 text-purple-400" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-300">小说AI</span>
          </div>
          <p className="text-center text-sm text-white/60">
            © 2023 小说AI智能创作平台。保留所有权利。
          </p>
          <div className="flex gap-6">
            <Link
              href="#"
              className="text-sm font-medium text-white/60 transition-colors hover:text-purple-300"
            >
              使用条款
            </Link>
            <Link
              href="#"
              className="text-sm font-medium text-white/60 transition-colors hover:text-purple-300"
            >
              隐私政策
            </Link>
            <Link
              href="#"
              className="text-sm font-medium text-white/60 transition-colors hover:text-purple-300"
            >
              技术支持
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
} 