import type { ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  fullWidth?: boolean
}

/** Tap-first button: generous padding, clear variants. §60 UI principles. */
export function Button({ variant = 'secondary', fullWidth, className = '', ...rest }: Props) {
  return (
    <button
      className={`btn btn-${variant} ${fullWidth ? 'btn-full' : ''} ${className}`}
      {...rest}
    />
  )
}
