/**
 * Demo-mode employee store.
 * Persists deleted employee IDs to data/deleted-employees.json so deletions
 * survive page refreshes and hot-reloads in dev.
 *
 * In production replace this with Prisma: prisma.employee.delete(...)
 */

import * as fs   from 'fs'
import * as path from 'path'

const DATA_DIR    = path.join(process.cwd(), 'data')
const DELETED_FILE = path.join(DATA_DIR, 'deleted-employees.json')

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })
}

/** Returns the set of employee IDs that have been deleted. */
export function getDeletedIds(): Set<string> {
  ensureDir()
  if (!fs.existsSync(DELETED_FILE)) return new Set()
  try {
    const data = JSON.parse(fs.readFileSync(DELETED_FILE, 'utf-8')) as string[]
    return new Set(data)
  } catch {
    return new Set()
  }
}

/** Marks an employee ID as deleted. Returns false if it was already deleted. */
export function markDeleted(id: string): boolean {
  const ids = getDeletedIds()
  if (ids.has(id)) return false
  ids.add(id)
  ensureDir()
  fs.writeFileSync(DELETED_FILE, JSON.stringify([...ids], null, 2), 'utf-8')
  return true
}

/** Removes an employee ID from the deleted list (restore). */
export function unmarkDeleted(id: string): void {
  const ids = getDeletedIds()
  ids.delete(id)
  ensureDir()
  fs.writeFileSync(DELETED_FILE, JSON.stringify([...ids], null, 2), 'utf-8')
}

/** Returns true if the given employee ID has been deleted. */
export function isDeleted(id: string): boolean {
  return getDeletedIds().has(id)
}
