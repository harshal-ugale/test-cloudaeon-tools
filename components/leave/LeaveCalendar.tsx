'use client'

import type { Leave } from '@/lib/types'
import { getLeaveTypeColor } from '@/lib/utils'

interface LeaveCalendarProps {
  leaves: Leave[]
  month: number
  year: number
}

export function LeaveCalendar({ leaves, month, year }: LeaveCalendarProps) {
  const daysInMonth = new Date(year, month, 0).getDate()
  const firstDay = new Date(year, month - 1, 1).getDay()
  const blanks = Array(firstDay).fill(null)

  function getLeavesForDay(day: number) {
    const date = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return leaves.filter((l) => l.startDate <= date && l.endDate >= date && l.status === 'APPROVED')
  }

  return (
    <div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-muted-foreground mb-2">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => <div key={d}>{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {blanks.map((_, i) => <div key={`b${i}`} />)}
        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
          const dayLeaves = getLeavesForDay(day)
          const isWeekend = [0, 6].includes(new Date(year, month - 1, day).getDay())
          return (
            <div
              key={day}
              className={`h-10 rounded-lg flex flex-col items-center justify-center text-xs relative ${
                isWeekend ? 'bg-muted/40 text-muted-foreground' :
                dayLeaves.length > 0 ? 'bg-primary/10 text-primary font-semibold' :
                'hover:bg-muted/30'
              }`}
            >
              {day}
              {dayLeaves.length > 0 && (
                <div className="absolute bottom-1 flex gap-0.5">
                  {dayLeaves.slice(0, 3).map((l, i) => (
                    <div key={i} className={`w-1 h-1 rounded-full ${getLeaveTypeColor(l.type).split(' ')[0].replace('bg-', 'bg-')}`} />
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
