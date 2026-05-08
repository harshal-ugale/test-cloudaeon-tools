/**
 * proxy.ts — Next.js 16 route interception (replaces middleware.ts)
 *
 * For production with Clerk, replace with:
 *   import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
 *   const isProtected = createRouteMatcher(['/dashboard(.*)', '/employees(.*)', ...])
 *   export function proxy(request: Request) {
 *     // Clerk auth check here
 *   }
 *
 * In demo mode, auth is checked client-side in app/(dashboard)/layout.tsx
 */

export function proxy(_request: Request) {
  // Pass-through — auth guard is handled client-side for the demo
  return
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
