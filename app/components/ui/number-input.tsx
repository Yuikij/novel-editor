"use client"

import { useState, useRef, useEffect } from "react"
import { cn } from "@/app/lib/utils"

interface NumberInputProps {
  value?: number
  onChange?: (value: number | undefined) => void
  placeholder?: string
  min?: number
  max?: number
  className?: string
  disabled?: boolean
}

export function NumberInput({ 
  value, 
  onChange, 
  placeholder = "0", 
  min, 
  max, 
  className,
  disabled = false 
}: NumberInputProps) {
  const [inputValue, setInputValue] = useState<string>(value?.toString() || "")
  const [isFocused, setIsFocused] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // 当外部value变化时同步内部状态
  useEffect(() => {
    if (!isFocused) {
      setInputValue(value?.toString() || "")
    }
  }, [value, isFocused])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    
    // 允许空值、数字和小数点
    if (newValue === "" || /^\d*\.?\d*$/.test(newValue)) {
      setInputValue(newValue)
      
      // 转换为数字并调用onChange
      if (newValue === "") {
        onChange?.(undefined)
      } else {
        const numValue = parseFloat(newValue)
        if (!isNaN(numValue)) {
          // 检查范围限制
          if ((min === undefined || numValue >= min) && 
              (max === undefined || numValue <= max)) {
            onChange?.(numValue)
          }
        }
      }
    }
  }

  const handleFocus = () => {
    setIsFocused(true)
    // 选中所有文本，方便用户直接替换
    setTimeout(() => {
      inputRef.current?.select()
    }, 0)
  }

  const handleBlur = () => {
    setIsFocused(false)
    // 失焦时，如果输入值无效，恢复为原值
    const numValue = parseFloat(inputValue)
    if (inputValue === "" || isNaN(numValue)) {
      setInputValue(value?.toString() || "")
    } else {
      // 检查范围并调整
      let finalValue = numValue
      if (min !== undefined && finalValue < min) {
        finalValue = min
      }
      if (max !== undefined && finalValue > max) {
        finalValue = max
      }
      
      if (finalValue !== numValue) {
        setInputValue(finalValue.toString())
        onChange?.(finalValue)
      } else {
        setInputValue(numValue.toString())
      }
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // 允许的特殊键
    const allowedKeys = [
      'Backspace', 'Delete', 'Tab', 'Escape', 'Enter',
      'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
      'Home', 'End'
    ]
    
    // Ctrl+A (全选)
    if (e.ctrlKey && e.key === 'a') {
      return
    }
    
    // 如果是允许的特殊键，直接通过
    if (allowedKeys.includes(e.key)) {
      return
    }
    
    // 只允许数字和小数点
    if (!/^\d$/.test(e.key) && e.key !== '.') {
      e.preventDefault()
    }
    
    // 如果已经有小数点，不允许再输入小数点
    if (e.key === '.' && inputValue.includes('.')) {
      e.preventDefault()
    }
  }

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        inputMode="decimal"
        value={inputValue}
        onChange={handleInputChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        className={cn(
          "w-full rounded border bg-background px-2 py-1 text-sm",
          "border-input",
          "focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "transition-colors",
          className
        )}
      />
      {(min !== undefined || max !== undefined) && (
        <div className="absolute -bottom-4 left-0 text-xs text-muted-foreground">
          {min !== undefined && max !== undefined ? `${min}-${max}` : 
           min !== undefined ? `最小: ${min}` : 
           max !== undefined ? `最大: ${max}` : ''}
        </div>
      )}
    </div>
  )
} 