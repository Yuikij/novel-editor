"use client"

import { Button } from "@/app/components/ui/button"
import { useLanguage } from "@/app/lib/i18n/language-context"

export function LanguageSwitcher() {
  const { language, setLanguage, t } = useLanguage()
  
  const toggleLanguage = () => {
    setLanguage(language === 'zh-CN' ? 'en-US' : 'zh-CN')
  }
  
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleLanguage}
      className="flex items-center gap-1.5 px-3 text-muted-foreground hover:text-foreground"
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
        className="h-4 w-4"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="m12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        <path d="M2 12h20" />
      </svg>
      {t('language.switch')}
    </Button>
  )
} 