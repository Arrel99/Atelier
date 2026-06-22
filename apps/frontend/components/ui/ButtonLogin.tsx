type ButtonProps = {
  children: React.ReactNode
  variant?: "primary" | "outline"
  onClick?: () => void
}

export default function ButtonLogin ({ children, variant = "primary", onClick }: ButtonProps) {
  const baseStyle = "px-5 py-2 rounded-md text-sm font-medium transition-colors"

  const variantStyle =
    variant === "primary"
      ? "bg-primary text-white hover:bg-blue-700"
      : "border border-zinc-300 text-text-dark hover:bg-zinc-50"

  return (
    <button onClick={onClick} className={`${baseStyle} ${variantStyle}`}>
      {children}
    </button>
  )
}