export const runtime = 'edge';

import Link from "next/link"
import { LogoIcon } from "@/app/components/ui/icons"
import { Button } from "@/app/components/ui/button"

export default function PricingPage() {
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
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
              >
                功能
              </Link>
              <Link
                href="/pricing"
                className="text-sm font-medium text-primary transition-colors hover:text-primary/80"
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
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
                  选择适合您的方案
                </h1>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                  无论您是偶尔写作的爱好者还是专业作家，我们都有适合您需求的价格方案。
                </p>
              </div>
              <div className="w-full max-w-sm rounded-lg border bg-card shadow-sm">
                <div className="p-2">
                  <div className="flex items-center gap-2">
                    <div className="rounded-md bg-primary/10 p-2">
                      <div className="rounded-full bg-primary p-1 text-primary-foreground">
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
                          className="h-4 w-4"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>
                    </div>
                    <div className="grid gap-0.5">
                      <h3 className="text-base font-medium">所有方案均包含</h3>
                      <p className="text-sm text-muted-foreground">
                        无限项目创建和管理
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <div className="flex flex-col rounded-xl border bg-card text-card-foreground shadow-sm" data-v0-t="card">
                <div className="flex flex-col space-y-1.5 p-6">
                  <span className="text-sm text-primary font-medium leading-none">基础版</span>
                  <h3 className="text-2xl font-bold">免费</h3>
                  <p className="text-sm text-muted-foreground">适合偶尔写作的爱好者</p>
                </div>
                <div className="p-6 pt-0 grid gap-3">
                  <div className="flex items-center gap-2">
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
                      className="h-4 w-4 text-primary"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span className="text-sm">最多3个项目</span>
                  </div>
                  <div className="flex items-center gap-2">
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
                      className="h-4 w-4 text-primary"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span className="text-sm">每月30次AI建议</span>
                  </div>
                  <div className="flex items-center gap-2">
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
                      className="h-4 w-4 text-primary"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span className="text-sm">基本角色管理</span>
                  </div>
                  <div className="flex items-center gap-2">
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
                      className="h-4 w-4 text-muted-foreground"
                    >
                      <path d="M18 6 6 18" />
                      <path d="m6 6 12 12" />
                    </svg>
                    <span className="text-sm text-muted-foreground">高级世界构建</span>
                  </div>
                  <div className="flex items-center gap-2">
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
                      className="h-4 w-4 text-muted-foreground"
                    >
                      <path d="M18 6 6 18" />
                      <path d="m6 6 12 12" />
                    </svg>
                    <span className="text-sm text-muted-foreground">故事分析</span>
                  </div>
                </div>
                <div className="p-6 pt-0 mt-auto">
                  <Button className="w-full" asChild>
                    <Link href="/signup">开始免费使用</Link>
                  </Button>
                </div>
              </div>
              <div className="relative flex flex-col rounded-xl border-2 border-primary bg-card text-card-foreground shadow-sm" data-v0-t="card">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                  最受欢迎
                </div>
                <div className="flex flex-col space-y-1.5 p-6">
                  <span className="text-sm text-primary font-medium leading-none">创作版</span>
                  <h3 className="flex items-baseline text-2xl font-bold">
                    ¥39
                    <span className="ml-1 text-base font-normal text-muted-foreground">/ 月</span>
                  </h3>
                  <p className="text-sm text-muted-foreground">适合活跃的小说创作者</p>
                </div>
                <div className="p-6 pt-0 grid gap-3">
                  <div className="flex items-center gap-2">
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
                      className="h-4 w-4 text-primary"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span className="text-sm">无限项目</span>
                  </div>
                  <div className="flex items-center gap-2">
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
                      className="h-4 w-4 text-primary"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span className="text-sm">每月300次AI建议</span>
                  </div>
                  <div className="flex items-center gap-2">
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
                      className="h-4 w-4 text-primary"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span className="text-sm">高级角色管理</span>
                  </div>
                  <div className="flex items-center gap-2">
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
                      className="h-4 w-4 text-primary"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span className="text-sm">基础世界构建</span>
                  </div>
                  <div className="flex items-center gap-2">
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
                      className="h-4 w-4 text-muted-foreground"
                    >
                      <path d="M18 6 6 18" />
                      <path d="m6 6 12 12" />
                    </svg>
                    <span className="text-sm text-muted-foreground">高级故事分析</span>
                  </div>
                </div>
                <div className="p-6 pt-0 mt-auto">
                  <Button className="w-full" asChild>
                    <Link href="/signup">现在订阅</Link>
                  </Button>
                </div>
              </div>
              <div className="flex flex-col rounded-xl border bg-card text-card-foreground shadow-sm" data-v0-t="card">
                <div className="flex flex-col space-y-1.5 p-6">
                  <span className="text-sm text-primary font-medium leading-none">专业版</span>
                  <h3 className="flex items-baseline text-2xl font-bold">
                    ¥99
                    <span className="ml-1 text-base font-normal text-muted-foreground">/ 月</span>
                  </h3>
                  <p className="text-sm text-muted-foreground">适合专业作家和团队</p>
                </div>
                <div className="p-6 pt-0 grid gap-3">
                  <div className="flex items-center gap-2">
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
                      className="h-4 w-4 text-primary"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span className="text-sm">无限项目</span>
                  </div>
                  <div className="flex items-center gap-2">
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
                      className="h-4 w-4 text-primary"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span className="text-sm">无限AI建议</span>
                  </div>
                  <div className="flex items-center gap-2">
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
                      className="h-4 w-4 text-primary"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span className="text-sm">高级角色管理</span>
                  </div>
                  <div className="flex items-center gap-2">
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
                      className="h-4 w-4 text-primary"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span className="text-sm">高级世界构建</span>
                  </div>
                  <div className="flex items-center gap-2">
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
                      className="h-4 w-4 text-primary"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span className="text-sm">高级故事分析</span>
                  </div>
                </div>
                <div className="p-6 pt-0 mt-auto">
                  <Button className="w-full" asChild>
                    <Link href="/signup">选择专业版</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  常见问题
                </h2>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                  关于我们的价格和服务的常见问题解答。
                </p>
              </div>
              <div className="mx-auto grid max-w-5xl gap-6 md:gap-8">
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">我可以随时取消订阅吗？</h3>
                  <p className="text-muted-foreground">
                    是的，您可以随时取消订阅。取消后，您的账户将继续有效直到当前计费周期结束。
                  </p>
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">免费版和付费版的区别是什么？</h3>
                  <p className="text-muted-foreground">
                    免费版提供基本功能和有限的项目数量，而付费版提供更多的AI建议次数、高级角色管理和世界构建功能，以及故事分析工具。
                  </p>
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">如果遇到问题，如何获得帮助？</h3>
                  <p className="text-muted-foreground">
                    我们提供全天候的客户支持。您可以通过电子邮件或在线聊天与我们联系，我们将尽快回复您的问题。
                  </p>
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">是否提供年付折扣？</h3>
                  <p className="text-muted-foreground">
                    是的，选择年付方案可以获得两个月的免费使用，相当于享受83%的价格。
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Button variant="outline" size="lg" asChild>
                  <Link href="/contact">联系我们</Link>
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