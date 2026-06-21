import React from 'react'

type ButtonVariant = 'primary' | 'ghost' | 'danger'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  children: React.ReactNode
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: [
    'bg-[var(--color-sky-dark)] text-white',
    'hover:bg-[var(--color-sky-deep)]',
    'active:scale-[0.98]',
    'disabled:bg-[var(--text-disabled)] disabled:cursor-not-allowed',
  ].join(' '),
  ghost: [
    'bg-transparent text-[var(--color-sky-dark)]',
    'border border-[var(--color-border)]',
    'hover:bg-[var(--color-sky-mist)] hover:border-[var(--color-sky)]',
    'active:scale-[0.98]',
    'disabled:opacity-40 disabled:cursor-not-allowed',
  ].join(' '),
  danger: [
    'bg-transparent text-[var(--color-error)]',
    'border border-[var(--color-error)]/30',
    'hover:bg-[var(--color-error)]/5',
    'active:scale-[0.98]',
    'disabled:opacity-40 disabled:cursor-not-allowed',
  ].join(' '),
}

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-7 py-3.5 text-base',
}

export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  children,
  className = '',
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={[
        'inline-flex items-center justify-center gap-2',
        'font-medium leading-none',
        'rounded-[var(--radius-pill)]',
        'transition-all duration-150',
        'cursor-pointer select-none',
        variantStyles[variant],
        sizeStyles[size],
        className,
      ].join(' ')}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin w-4 h-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
          <path d="M12 2a10 10 0 0 1 10 10" />
        </svg>
      )}
      {children}
    </button>
  )
}
