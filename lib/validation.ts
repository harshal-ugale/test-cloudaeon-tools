/**
 * Shared validation utilities — used on both client (signup form) and server (API routes).
 * No Node.js-only imports here so this file is safe to import in browser bundles.
 */

// ─── Email ────────────────────────────────────────────────────────────────────

export interface ValidationResult {
  valid: boolean
  error?: string
}

/**
 * Cloudaeon email rules:
 *  • Exactly one "@" symbol
 *  • Must end with "@cloudaeon.com"
 */
export function validateEmail(email: string): ValidationResult {
  if (!email || !email.trim()) {
    return { valid: false, error: 'Email is required.' }
  }
  const parts = email.split('@')
  if (parts.length !== 2) {
    return { valid: false, error: 'Email must contain exactly one "@" symbol.' }
  }
  if (!email.toLowerCase().endsWith('@cloudaeon.com')) {
    return { valid: false, error: 'Email must end with "@cloudaeon.com".' }
  }
  // basic local-part check
  if (!parts[0] || parts[0].length < 1) {
    return { valid: false, error: 'Email local part (before @) cannot be empty.' }
  }
  return { valid: true }
}

// ─── Password ─────────────────────────────────────────────────────────────────

/**
 * Cloudaeon password rules:
 *  • At least 8 characters
 *  • At least 1 uppercase letter
 *  • At least 1 lowercase letter
 *  • At least 1 digit (0-9)
 *  • At least 2 special characters (non-alphanumeric)
 *
 * Valid examples: #Work@123, #Airbase$1610
 */

export interface PasswordCheck {
  minLength: boolean      // ≥ 8 characters
  hasUppercase: boolean
  hasLowercase: boolean
  hasDigit: boolean
  hasSpecial: boolean     // ≥ 1 special char
  hasTwoSpecial: boolean  // ≥ 2 special chars  ← primary requirement
}

export function checkPassword(password: string): PasswordCheck {
  const specialMatches = password.match(/[^a-zA-Z0-9]/g) ?? []
  return {
    minLength:    password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasDigit:     /[0-9]/.test(password),
    hasSpecial:   specialMatches.length >= 1,
    hasTwoSpecial: specialMatches.length >= 2,
  }
}

export function validatePassword(password: string): ValidationResult {
  if (!password) return { valid: false, error: 'Password is required.' }

  const c = checkPassword(password)
  if (!c.minLength)     return { valid: false, error: 'Password must be at least 8 characters.' }
  if (!c.hasUppercase)  return { valid: false, error: 'Password must contain at least one uppercase letter.' }
  if (!c.hasLowercase)  return { valid: false, error: 'Password must contain at least one lowercase letter.' }
  if (!c.hasDigit)      return { valid: false, error: 'Password must contain at least one number (0-9).' }
  if (!c.hasTwoSpecial) return { valid: false, error: 'Password must contain at least 2 special characters (e.g. # @ $ !).' }

  return { valid: true }
}
