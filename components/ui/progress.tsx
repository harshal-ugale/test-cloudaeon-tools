import { cn } from '@/lib/utils'
import { forwardRef, type HTMLAttributes } from 'react'

interface ProgressProps extends HTMLAttributes<HTMLDivElement> {
  value?: number
  max?: number
  color?: string
}

const Progress = forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value = 0, max = 100, color, ...props }, ref) => (
    <div
      ref={ref}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
      className={cn('relative h-2 w-full overflow-hidden rounded-full bg-secondary', className)}
      {...props}
    >
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{
          width: `${Math.min((value / max) * 100, 100)}%`,
          backgroundColor: color ?? 'hsl(var(--primary))',
        }}
      />
    </div>
  )
)
Progress.displayName = 'Progress'

export { Progress }
