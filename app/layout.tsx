import "@/app/globals.css"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/app/components/theme-provider"
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "小说AI - AI小说编辑器",
  description: "一个AI驱动的小说写作和编辑平台",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  )
} 