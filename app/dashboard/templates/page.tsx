"use client"

import { useLanguage } from '@/app/lib/i18n/language-context'
import TemplateList from '@/app/components/novel-editor/template-list'
import DashboardHeader from '@/app/components/layout/dashboard-header'
import DashboardSidebar from '@/app/components/layout/dashboard-sidebar'

export default function TemplatesPage() {
  const { t } = useLanguage()
  
  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader />
      <div className="container flex-1 items-start py-6 md:grid md:grid-cols-[220px_1fr] md:gap-6 lg:grid-cols-[240px_1fr] lg:gap-10">
        <DashboardSidebar />
        <main className="flex w-full flex-col overflow-hidden">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-semibold">{t('nav.templates')}</h1>
          </div>
          <TemplateList />
        </main>
      </div>
    </div>
  )
} 