"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useLanguage } from "@/app/lib/i18n/language-context"

export default function DashboardSidebar() {
  const { t } = useLanguage()
  const pathname = usePathname()
  
  const isActive = (path: string) => {
    if (path === "/dashboard" && pathname === "/dashboard") {
      return true
    }
    if (path !== "/dashboard" && pathname.startsWith(path)) {
      return true
    }
    return false
  }
  
  return (
    <aside className="fixed top-14 z-30 -ml-2 hidden h-[calc(100vh-3.5rem)] w-full shrink-0 overflow-y-auto border-r md:sticky md:block">
      <div className="h-full py-6 pl-8 pr-6">
        <div className="flex flex-col gap-2">
          <h2 className="mb-2 px-2 text-lg font-semibold tracking-tight">
            {t('editor.title')}
          </h2>
          <nav className="flex flex-col gap-1">
            <Link
              href="/dashboard"
              className={`flex items-center gap-2 rounded-lg px-3 py-2 ${
                isActive("/dashboard") 
                  ? "bg-accent text-accent-foreground" 
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
              >
                <path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z" />
                <path d="m3 9 2.45-4.9A2 2 0 0 1 7.24 3h9.52a2 2 0 0 1 1.8 1.1L21 9" />
                <path d="M12 3v6" />
              </svg>
              {t('nav.projects')}
            </Link>
            
            <Link
              href="/dashboard/worlds"
              className={`flex items-center gap-2 rounded-lg px-3 py-2 ${
                isActive("/dashboard/worlds") 
                  ? "bg-accent text-accent-foreground" 
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
                <path d="M2 12h20" />
              </svg>
              {t('nav.worlds')}
            </Link>
            
            <Link
              href="/dashboard/entries"
              className={`flex items-center gap-2 rounded-lg px-3 py-2 ${
                isActive("/dashboard/entries") 
                  ? "bg-accent text-accent-foreground" 
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <path d="M14 2v6h6" />
                <path d="M16 13H8" />
                <path d="M16 17H8" />
                <path d="M10 9H8" />
              </svg>
              {t('nav.entries')}
            </Link>
            
            <Link
              href="/dashboard/templates"
              className={`flex items-center gap-2 rounded-lg px-3 py-2 ${
                isActive("/dashboard/templates") 
                  ? "bg-accent text-accent-foreground" 
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
              >
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                <polyline points="14 2 14 8 20 8" />
                <path d="M8 13h8" />
                <path d="M8 17h8" />
                <path d="M8 9h2" />
              </svg>
              {t('nav.templates')}
            </Link>
            
            {/* <Link
              href="/dashboard/analysis"
              className={`flex items-center gap-2 rounded-lg px-3 py-2 ${
                isActive("/dashboard/analysis") 
                  ? "bg-accent text-accent-foreground" 
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
              >
                <path d="M2 11h7v9H2zm7-9h7v18H9zm7 3h7v6h-7z" />
              </svg>
              {t('nav.analysis')}
            </Link> */}
          </nav>
        </div>
      </div>
    </aside>
  )
} 