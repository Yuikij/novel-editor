import "@/app/globals.css"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/app/components/theme-provider"
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "NovelAI - AI Novel Editor",
  description: "An AI-powered novel writing and editing platform",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
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