import Image from 'next/image'

interface AvatarProps {
  src?: string | null
  name: string
  size?: number
  className?: string
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')
}

function getAvatarColor(name: string): string {
  // Deterministic pastel from name — always sky-family
  const shades = [
    'hsl(197 55% 52%)',
    'hsl(197 45% 38%)',
    'hsl(197 65% 60%)',
    'hsl(197 40% 45%)',
  ]
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return shades[Math.abs(hash) % shades.length]
}

export default function Avatar({ src, name, size = 40, className = '' }: AvatarProps) {
  const initials = getInitials(name)
  const bg = getAvatarColor(name)
  const fontSize = Math.round(size * 0.38)

  if (src) {
    return (
      <Image
        src={src}
        alt={name}
        width={size}
        height={size}
        className={`rounded-full object-cover shrink-0 ${className}`}
        style={{ width: size, height: size }}
      />
    )
  }

  return (
    <span
      className={`rounded-full inline-flex items-center justify-center shrink-0 font-medium text-white select-none ${className}`}
      style={{ width: size, height: size, background: bg, fontSize }}
      aria-label={name}
      title={name}
    >
      {initials}
    </span>
  )
}
