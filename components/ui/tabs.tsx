'use client'

import { createContext, useContext, useState, type ReactNode, type HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface TabsContextType { active: string; setActive: (v: string) => void }
const TabsContext = createContext<TabsContextType | null>(null)

interface TabsProps extends HTMLAttributes<HTMLDivElement> {
  defaultValue: string
  value?: string
  onValueChange?: (v: string) => void
}

function Tabs({ defaultValue, value, onValueChange, children, className, ...props }: TabsProps) {
  const [active, setActiveState] = useState(value ?? defaultValue)
  function setActive(v: string) {
    setActiveState(v)
    onValueChange?.(v)
  }
  return (
    <TabsContext.Provider value={{ active: value ?? active, setActive }}>
      <div className={cn('', className)} {...props}>{children}</div>
    </TabsContext.Provider>
  )
}

function TabsList({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('inline-flex h-10 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground', className)} {...props}>
      {children}
    </div>
  )
}

interface TabsTriggerProps extends HTMLAttributes<HTMLButtonElement> { value: string }

function TabsTrigger({ value, className, children, ...props }: TabsTriggerProps) {
  const ctx = useContext(TabsContext)!
  return (
    <button
      role="tab"
      aria-selected={ctx.active === value}
      onClick={() => ctx.setActive(value)}
      className={cn(
        'inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium ring-offset-background transition-all',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        'disabled:pointer-events-none disabled:opacity-50',
        ctx.active === value ? 'bg-background text-foreground shadow-sm' : 'hover:bg-background/50',
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}

interface TabsContentProps extends HTMLAttributes<HTMLDivElement> { value: string }

function TabsContent({ value, className, children, ...props }: TabsContentProps) {
  const ctx = useContext(TabsContext)!
  if (ctx.active !== value) return null
  return (
    <div role="tabpanel" className={cn('mt-4 animate-fade-in', className)} {...props}>
      {children}
    </div>
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent }
