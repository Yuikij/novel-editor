export const runtime = 'edge';

import Link from "next/link"
import { LogoIcon } from "@/app/components/ui/icons"
import { Button } from "@/app/components/ui/button"

export default function FeaturesPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="flex items-center gap-2 font-bold">
            <Link href="/" className="flex items-center gap-2">
              <LogoIcon className="h-6 w-6" />
              <span>小说AI</span>
            </Link>
          </div>
          <div className="flex flex-1 items-center justify-end space-x-2">
            <nav className="flex items-center space-x-4">
              <Link
                href="/features"
                className="text-sm font-medium text-primary transition-colors hover:text-primary/80"
              >
                功能
              </Link>
              <Link
                href="/pricing"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
              >
                价格
              </Link>
              <Link
                href="/login"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
              >
                登录
              </Link>
              <Button asChild size="sm">
                <Link href="/signup">注册</Link>
              </Button>
            </nav>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="space-y-3">
                <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
                  我们的强大功能
                </h1>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                  为您的小说创作提供全方位的AI支持，让写作更加高效和灵感充沛。
                </p>
              </div>
            </div>
          </div>
        </section>
        
        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted/50">
          <div className="container px-4 md:px-6">
            <div className="mx-auto grid max-w-5xl items-center gap-6 lg:grid-cols-2 lg:gap-12">
              <div className="space-y-4">
                <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">核心功能</div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">AI辅助写作</h2>
                <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed">
                  我们的AI能根据您的写作风格和需求提供情节建议、角色对话和场景描述，帮助您突破创作瓶颈。
                </p>
              </div>
              <div className="rounded-xl border bg-background p-8 shadow-lg">
                <ul className="grid gap-4 text-sm">
                  <li className="flex items-center gap-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-5 w-5 text-primary"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span>智能续写：当您陷入瓶颈时，AI可以为您提供多个情节发展方向</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-5 w-5 text-primary"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span>对话生成：根据角色性格自动生成符合人物特点的对话</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-5 w-5 text-primary"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span>场景细化：让您的场景描写更加生动详实</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>
        
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="mx-auto grid max-w-5xl items-center gap-6 lg:grid-cols-2 lg:gap-12">
              <div className="rounded-xl border bg-background p-8 shadow-lg order-last lg:order-first">
                <ul className="grid gap-4 text-sm">
                  <li className="flex items-center gap-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-5 w-5 text-primary"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span>角色档案管理：创建详细的角色档案并保持人物特点的一致性</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-5 w-5 text-primary"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span>角色关系图：可视化展示角色之间的复杂关系</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-5 w-5 text-primary"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span>AI角色生成：一键创建具有深度和复杂性的角色</span>
                  </li>
                </ul>
              </div>
              <div className="space-y-4">
                <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">特色功能</div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">角色管理系统</h2>
                <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed">
                  全面的角色管理工具，帮助您创建深度丰富的角色，并在整个小说中保持人物特点的一致性。
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted/50">
          <div className="container px-4 md:px-6">
            <div className="mx-auto grid max-w-5xl items-center gap-6 lg:grid-cols-2 lg:gap-12">
              <div className="space-y-4">
                <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">高级功能</div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">世界构建工具</h2>
                <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed">
                  创建复杂、一致的世界观，包括地理、文化、历史和社会结构，让您的故事更加丰富和令人信服。
                </p>
              </div>
              <div className="rounded-xl border bg-background p-8 shadow-lg">
                <ul className="grid gap-4 text-sm">
                  <li className="flex items-center gap-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-5 w-5 text-primary"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span>世界地图编辑器：创建并编辑小说世界的地图</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-5 w-5 text-primary"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span>文化系统设计：为不同地区和群体创建独特的文化背景</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-5 w-5 text-primary"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span>历史时间线：记录世界重大事件和发展脉络</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="mx-auto grid max-w-5xl items-center gap-6 lg:grid-cols-2 lg:gap-12">
              <div className="rounded-xl border bg-background p-8 shadow-lg order-last lg:order-first">
                <ul className="grid gap-4 text-sm">
                  <li className="flex items-center gap-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-5 w-5 text-primary"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span>情感弧线分析：评估角色情感发展和故事张力</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-5 w-5 text-primary"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span>情节节奏评估：确保故事节奏适当</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-5 w-5 text-primary"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span>矛盾冲突检测：识别并改进故事中的冲突点</span>
                  </li>
                </ul>
              </div>
              <div className="space-y-4">
                <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">分析工具</div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">故事结构分析</h2>
                <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed">
                  智能分析您的故事结构，提供关于情节发展、节奏和角色弧线的深入洞察，帮助您优化叙事。
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32 bg-primary/5">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm text-primary">
                  立即开始
                </div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  准备好提升您的小说创作体验吗？
                </h2>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                  加入我们的平台，使用AI的力量释放您的创作潜能。
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Button asChild size="lg">
                  <Link href="/signup">免费注册</Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link href="/pricing">查看价格</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t bg-background py-6 md:py-10">
        <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-2 font-bold">
            <LogoIcon className="h-5 w-5" />
            <span>小说AI</span>
          </div>
          <p className="text-center text-sm text-muted-foreground">
            © 2023 小说AI。保留所有权利。
          </p>
          <div className="flex gap-4">
            <Link
              href="#"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              条款
            </Link>
            <Link
              href="#"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              隐私
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
} 