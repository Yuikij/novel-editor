"use client"

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react'
import { translations } from './translations'

// 支持的语言
export type Language = 'zh-CN' | 'en-US'

// 语言上下文类型
type LanguageContextType = {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string, params?: Record<string, string>) => string
}

// 创建上下文
const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

// 语言提供组件
export function LanguageProvider({ children }: { children: ReactNode }) {
  // 从本地存储获取语言或默认使用中文
  const [language, setLanguageState] = useState<Language>('zh-CN')
  
  // 初始化时从localStorage获取语言设置
  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as Language
    if (savedLanguage && (savedLanguage === 'zh-CN' || savedLanguage === 'en-US')) {
      setLanguageState(savedLanguage)
      document.documentElement.lang = savedLanguage
    }
  }, [])
  
  // 设置语言并保存到localStorage
  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem('language', lang)
    document.documentElement.lang = lang
  }
  
  // 获取翻译文本的函数
  const t = (key: string, params?: Record<string, string>) => {
    let text = translations[key]?.[language] || key
    
    // 替换参数
    if (params) {
      Object.entries(params).forEach(([paramKey, paramValue]) => {
        text = text.replace(`{${paramKey}}`, paramValue)
      })
    }
    
    return text
  }
  
  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

// 自定义Hook，用于在组件中使用语言上下文
export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
} 