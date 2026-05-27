/**
 * Server-side user registry — file-backed JSON store.
 * Works in demo mode without a real database.
 *
 * Production note: Replace with a proper DB model (Prisma UserAccount) and
 * use bcrypt for password hashing.
 */

import * as fs   from 'fs'
import * as path from 'path'
import * as crypto from 'crypto'

// ─── Registration profile ─────────────────────────────────────────────────────
// Mirrors the fields in employee_registration_form.html

export interface RegistrationProfile {
  // Personal Information
  firstName:     string
  middleName?:   string
  lastName:      string
  preferredName?: string
  dateOfBirth:   string          // ISO date YYYY-MM-DD
  gender?:       string
  nationality:   string
  maritalStatus?: string

  // Contact Details
  personalEmail?:  string
  mobileNumber:    string
  alternatePhone?: string
  address:         string
  city:            string
  state:           string
  postalCode:      string
  country:         string

  // Employment Details
  role:             string       // EMPLOYEE | HR | MANAGER | SUPER_ADMIN
  jobTitle:         string
  department:       string
  businessUnit?:    string
  workLocation:     string       // Office | Remote | Hybrid
  startDate:        string       // ISO date
  employmentType:   string       // Full-time | Part-time | Contract | Intern
  workerType?:      string       // Regular | Contractor
  managerName?:     string
  costCenter?:      string

  // Identity & Government IDs
  nationalId?:      string       // Aadhar / SSN (encrypted at rest in prod)
  passportNumber?:  string
  taxId?:           string       // PAN / TIN / EIN
  pfNumber?:        string

  // Emergency Contact
  emergencyContactName?:     string
  emergencyContactRelation?: string
  emergencyContactPhone?:    string
  emergencyContactEmail?:    string

  // Profile & Preferences
  preferredLanguage?: string
  timezone?:          string
  dateFormat?:        string
}

// ─── Auth record ──────────────────────────────────────────────────────────────

export interface RegisteredUser {
  email:           string        // lowercase normalised
  passwordHash:    string        // SHA-256(password + SALT)
  activationToken: string | null
  isActivated:     boolean
  registeredAt:    string        // ISO string
  activatedAt?:    string
  employeeId?:     string        // auto-generated on registration
  profile?:        RegistrationProfile
}

// ─── Storage helpers ──────────────────────────────────────────────────────────

const DATA_DIR   = path.join(process.cwd(), 'data')
const USERS_FILE = path.join(DATA_DIR, 'registered-users.json')

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

/** Sequential employee code for self-registered users: REG-0001, REG-0002 … */
function nextEmployeeId(users: Record<string, RegisteredUser>): string {
  const count = Object.values(users).filter((u) => u.employeeId?.startsWith('reg-')).length
  return `reg-${String(count + 1).padStart(4, '0')}`
}

// ─── Public API ───────────────────────────────────────────────────────────────

export type RegisterResult =
  | { success: true; token: string; alreadyPending: boolean }
  | { success: false; error: string }

export function registerUser(
  email:    string,
  password: string,
  profile?: RegistrationProfile
): RegisterResult {
  const users = readUsers()
  const key   = email.toLowerCase()
  const existing = users[key]

  if (existing?.isActivated) {
    return { success: false, error: 'This email is already registered. Please sign in.' }
  }

  const token      = generateToken()
  const alreadyPending = !!existing

  users[key] = {
    email:           key,
    passwordHash:    hashPassword(password),
    activationToken: token,
    isActivated:     false,
    registeredAt:    new Date().toISOString(),
    employeeId:      existing?.employeeId ?? nextEmployeeId(users),
    profile,
  }

  writeUsers(users)
  return { success: true, token, alreadyPending }
}

export type ActivateResult =
  | { success: true; email: string }
  | { success: false; error: string }

export function activateUser(token: string): ActivateResult {
  if (!token) return { success: false, error: 'No activation token provided.' }

  const users = readUsers()
  const entry = Object.values(users).find((u) => u.activationToken === token)

  if (!entry) return { success: false, error: 'Invalid or expired activation link.' }
  if (entry.isActivated) {
    return { success: false, error: 'Account is already activated. Please sign in.' }
  }

  users[entry.email].isActivated  = true
  users[entry.email].activationToken = null
  users[entry.email].activatedAt  = new Date().toISOString()

  writeUsers(users)
  return { success: true, email: entry.email }
}

export type LoginResult =
  | { success: true; email: string; user: RegisteredUser }
  | { success: false; error: string }

export function verifyLogin(email: string, password: string): LoginResult {
  const users = readUsers()
  const user  = users[email.toLowerCase()]

  if (!user) return { success: false, error: 'No account found for this email.' }
  if (!user.isActivated) {
    return {
      success: false,
      error: 'Account not yet activated. Please check your email for the activation link.',
    }
  }
  if (user.passwordHash !== hashPassword(password)) {
    return { success: false, error: 'Incorrect password.' }
  }

  return { success: true, email: user.email, user }
}

export function getRegisteredUser(email: string): RegisteredUser | null {
  const users = readUsers()
  return users[email.toLowerCase()] ?? null
}

export function isEmailActivated(email: string): boolean {
  const users = readUsers()
  return users[email.toLowerCase()]?.isActivated === true
}
