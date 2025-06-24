import "@/app/globals.css"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/app/components/theme-provider"
import { LanguageProvider } from "@/app/lib/i18n/language-context"
import { Toaster } from 'react-hot-toast'
import { Metadata } from 'next'
import { translations } from '@/app/lib/i18n/translations'
import { DynamicMeta } from '@/app/components/ui/dynamic-meta'

const inter = Inter({ subsets: ["latin"] })

export const generateMetadata = (): Metadata => {
  // Default to Chinese, will be overridden by client-side language switching
  const language = 'zh-CN'
  
  return {
    title: translations['site.title'][language],
    description: translations['site.description'][language],
    icons: {
      icon: '/favicon.svg',
    }
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className={inter.className}>
        <LanguageProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            <DynamicMeta />
            {children}
            <Toaster position="top-right" />
          </ThemeProvider>
        </LanguageProvider>
      </body>
    </html>
  )
} 