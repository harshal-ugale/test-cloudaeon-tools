import { cn, getInitials } from '@/lib/utils'

interface AvatarProps {
  src?: string
  name: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const sizeMap = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-lg',
}

const colorMap = [
  'bg-blue-100 text-blue-700',
  'bg-emerald-100 text-emerald-700',
  'bg-purple-100 text-purple-700',
  'bg-pink-100 text-pink-700',
  'bg-amber-100 text-amber-700',
  'bg-teal-100 text-teal-700',
  'bg-indigo-100 text-indigo-700',
  'bg-rose-100 text-rose-700',
]

function hashName(name: string): number {
  return name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
}

export function Avatar({ src, name, size = 'md', className }: AvatarProps) {
  const colorClass = colorMap[hashName(name) % colorMap.length]
  return (
    <div className={cn('relative rounded-full overflow-hidden flex-shrink-0', sizeMap[size], className)}>
      {src ? (
        <img src={src} alt={name} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
      ) : null}
      <div className={cn('absolute inset-0 flex items-center justify-center font-semibold', colorClass, src ? 'opacity-0' : '')}>
        {getInitials(name)}
      </div>
    </div>
  )
}
