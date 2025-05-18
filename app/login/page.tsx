"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { LogoIcon } from "@/app/components/ui/icons"
import { Button } from "@/app/components/ui/button"
import { Input } from "@/app/components/ui/input"
import { Label } from "@/app/components/ui/label"
import { Checkbox } from "@/app/components/ui/checkbox"

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    
    try {
      // 这里应该调用登录API
      // const response = await login({ email, password })
      
      // 模拟登录成功
      setTimeout(() => {
        router.push("/dashboard")
      }, 1000)
    } catch (err) {
      setError("登录失败，请检查您的邮箱和密码。")
      setIsLoading(false)
    }
  }

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
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
              >
                价格
              </Link>
              <Link
                href="/login"
                className="text-sm font-medium text-primary transition-colors hover:text-primary/80"
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
        <div className="container flex h-full items-center justify-center py-12">
          <div className="mx-auto grid w-full max-w-md gap-6">
            <div className="space-y-2 text-center">
              <h1 className="text-3xl font-bold">登录</h1>
              <p className="text-gray-500 dark:text-gray-400">
                输入您的账号信息以继续
              </p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="rounded-md bg-red-50 p-3 text-sm text-red-500 dark:bg-red-900/20 dark:text-red-200">
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">邮箱</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="name@example.com"
                  autoComplete="email"
                  required
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">密码</Label>
                  <Link
                    href="/forgot-password"
                    className="text-sm font-medium text-primary underline-offset-4 hover:underline"
                  >
                    忘记密码?
                  </Link>
                </div>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="remember" />
                <Label htmlFor="remember" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  记住我
                </Label>
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "登录中..." : "登录"}
              </Button>
            </form>
            <div className="mt-4 text-center text-sm">
              还没有账号?{" "}
              <Link
                href="/signup"
                className="font-medium text-primary underline-offset-4 hover:underline"
              >
                立即注册
              </Link>
            </div>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  或使用以下方式
                </span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" className="w-full">
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
                  className="mr-2 h-4 w-4"
                >
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
                微信
              </Button>
              <Button variant="outline" className="w-full">
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
                  className="mr-2 h-4 w-4"
                >
                  <path d="M9 9a3 3 0 1 1 5.12 2.12L9 16.5" />
                  <path d="M7.2 21h9.6" />
                </svg>
                QQ
              </Button>
            </div>
          </div>
        </div>
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