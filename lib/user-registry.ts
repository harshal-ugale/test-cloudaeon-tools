/**
 * Server-side user registry — file-backed JSON store.
 * Works in demo mode without a real database.
 *
 * Production note: Replace with a proper DB model (Prisma UserAccount model)
 * and use bcrypt for password hashing.
 */

import * as fs from 'fs'
import * as path from 'path'
import * as crypto from 'crypto'

// ─── Types ───────────────────────────────────────────────────────────────────

export interface RegisteredUser {
  email: string          // lowercase, normalised
  passwordHash: string   // SHA-256(password + SALT)
  activationToken: string | null
  isActivated: boolean
  registeredAt: string   // ISO string
  activatedAt?: string
}

// ─── Storage helpers ─────────────────────────────────────────────────────────

const DATA_DIR  = path.join(process.cwd(), 'data')
const USERS_FILE = path.join(DATA_DIR, 'registered-users.json')

/** Secret salt — in production use an env var */
const SALT = process.env.AUTH_SALT ?? 'cemt_cloudaeon_salt_2025'

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })
}

function readUsers(): Record<string, RegisteredUser> {
  ensureDataDir()
  if (!fs.existsSync(USERS_FILE)) return {}
  try {
    return JSON.parse(fs.readFileSync(USERS_FILE, 'utf-8'))
  } catch {
    return {}
  }
}

function writeUsers(users: Record<string, RegisteredUser>): void {
  ensureDataDir()
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8')
}

// ─── Crypto helpers ───────────────────────────────────────────────────────────

export function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password + SALT).digest('hex')
}

export function generateToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

// ─── Public API ───────────────────────────────────────────────────────────────

export type RegisterResult =
  | { success: true; token: string; alreadyPending: boolean }
  | { success: false; error: string }

/**
 * Register a new user (or re-register a pending-but-not-yet-activated account).
 * Returns an activation token on success.
 */
export function registerUser(email: string, password: string): RegisterResult {
  const users = readUsers()
  const key = email.toLowerCase()
  const existing = users[key]

  if (existing?.isActivated) {
    return { success: false, error: 'This email is already registered. Please sign in.' }
  }

  const token = generateToken()
  users[key] = {
    email: key,
    passwordHash: hashPassword(password),
    activationToken: token,
    isActivated: false,
    registeredAt: new Date().toISOString(),
  }

  const alreadyPending = !!existing

  writeUsers(users)
  return { success: true, token, alreadyPending }
}

export type ActivateResult =
  | { success: true; email: string }
  | { success: false; error: string }

/**
 * Activate an account via the token from the email link.
 */
export function activateUser(token: string): ActivateResult {
  if (!token) return { success: false, error: 'No activation token provided.' }

  const users = readUsers()
  const entry = Object.values(users).find((u) => u.activationToken === token)

  if (!entry) return { success: false, error: 'Invalid or expired activation link.' }
  if (entry.isActivated) return { success: false, error: 'Account is already activated. Please sign in.' }

  users[entry.email].isActivated = true
  users[entry.email].activationToken = null
  users[entry.email].activatedAt = new Date().toISOString()

  writeUsers(users)
  return { success: true, email: entry.email }
}

export type LoginResult =
  | { success: true; email: string }
  | { success: false; error: string }

/**
 * Verify email + password for an activated user.
 */
export function verifyLogin(email: string, password: string): LoginResult {
  const users = readUsers()
  const user = users[email.toLowerCase()]

  if (!user) return { success: false, error: 'No account found for this email.' }
  if (!user.isActivated) {
    return { success: false, error: 'Account not yet activated. Please check your email for the activation link.' }
  }
  if (user.passwordHash !== hashPassword(password)) {
    return { success: false, error: 'Incorrect password.' }
  }

  return { success: true, email: user.email }
}

/**
 * Check whether an email is already registered (activated or pending).
 */
export function emailExists(email: string): boolean {
  const users = readUsers()
  return !!users[email.toLowerCase()]
}

/**
 * Check whether an email is registered and activated.
 */
export function isEmailActivated(email: string): boolean {
  const users = readUsers()
  return users[email.toLowerCase()]?.isActivated === true
}
