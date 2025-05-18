"use client"

import { useEffect } from 'react'
import { useLanguage } from '@/app/lib/i18n/language-context'

export function DynamicMeta() {
  const { language, t } = useLanguage()
  
  useEffect(() => {
    // Update document title when language changes
    document.title = t('site.title')
    
    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]')
    if (metaDescription) {
      metaDescription.setAttribute('content', t('site.description'))
    }
    
    // Set html lang attribute
    document.documentElement.lang = language
  }, [language, t])
  
  // This component doesn't render anything visible
  return null
} 