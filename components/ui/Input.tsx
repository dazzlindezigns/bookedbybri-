'use client'

import { InputHTMLAttributes, TextareaHTMLAttributes, forwardRef } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className = '', ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label className="text-sm font-medium text-white/80">
            {label}
            {props.required && <span className="text-[#ffabdd] ml-1">*</span>}
          </label>
        )}
        <input
          ref={ref}
          className={`w-full bg-[#2a2a2a] border ${
            error ? 'border-red-500' : 'border-[#3a3a3a]'
          } rounded-xl px-4 py-3 text-white placeholder-[#8a8a8a] focus:outline-none focus:border-[#ffabdd] transition-colors text-sm ${className}`}
          {...props}
        />
        {hint && !error && <p className="text-xs text-white/40">{hint}</p>}
        {error && <p className="text-xs text-red-400">{error}</p>}
      </div>
    )
  }
)

Input.displayName = 'Input'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  hint?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, className = '', ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label className="text-sm font-medium text-white/80">
            {label}
            {props.required && <span className="text-[#ffabdd] ml-1">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          className={`w-full bg-[#2a2a2a] border ${
            error ? 'border-red-500' : 'border-[#3a3a3a]'
          } rounded-xl px-4 py-3 text-white placeholder-[#8a8a8a] focus:outline-none focus:border-[#ffabdd] transition-colors text-sm resize-none ${className}`}
          {...props}
        />
        {hint && !error && <p className="text-xs text-white/40">{hint}</p>}
        {error && <p className="text-xs text-red-400">{error}</p>}
      </div>
    )
  }
)

Textarea.displayName = 'Textarea'

export default Input
