'use client'

import { useState, type FormEvent, type ChangeEvent } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input }  from '@/components/ui/input'
import { Label }  from '@/components/ui/label'
import {
  Eye, EyeOff, ArrowLeft, ArrowRight, CheckCircle2, XCircle,
  AlertCircle, Mail, Lock, UserPlus, ExternalLink, User,
  Phone, MapPin, Briefcase, Shield, Heart, Settings,
  ChevronRight,
} from 'lucide-react'
import { checkPassword, type PasswordCheck } from '@/lib/validation'
import { DEPARTMENTS } from '@/lib/mock-data'

// ─── Static options ───────────────────────────────────────────────────────────

const GENDERS        = ['Male', 'Female', 'Non-binary', 'Prefer not to say']
const MARITAL        = ['Single', 'Married', 'Divorced', 'Widowed', 'Prefer not to say']
const COUNTRIES      = ['India', 'United States', 'United Kingdom', 'Canada', 'Australia', 'Germany', 'Singapore', 'UAE', 'Other']
const INDIAN_STATES  = [
  'Andhra Pradesh','Assam','Bihar','Chhattisgarh','Delhi','Goa','Gujarat',
  'Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh',
  'Maharashtra','Manipur','Meghalaya','Odisha','Punjab','Rajasthan','Tamil Nadu',
  'Telangana','Uttar Pradesh','Uttarakhand','West Bengal','Other',
]
const JOB_TITLES     = [
  'Founder & CEO','HR Director','Engineering Manager','Product Manager',
  'Senior Software Engineer','Full Stack Developer','UI/UX Designer',
  'QA Engineer','DevOps Engineer','Data Analyst','Business Analyst',
  'Marketing Manager','Finance Manager','Operations Manager','Intern','Other',
]
const WORK_LOCATIONS = ['Office','Remote','Hybrid']
const EMP_TYPES      = ['Full-time','Part-time','Contract','Internship']
const WORKER_TYPES   = ['Regular','Contractor','Consultant']
const ROLES          = [
  { value: 'EMPLOYEE',    label: 'Employee' },
  { value: 'MANAGER',     label: 'Manager' },
  { value: 'HR',          label: 'HR' },
  { value: 'SUPER_ADMIN', label: 'Founder / CEO' },
]
const RELATIONS      = ['Spouse','Parent','Sibling','Child','Friend','Other']
const LANGUAGES      = ['English','Hindi','Marathi','Tamil','Telugu','Kannada','Bengali','Other']
const TIMEZONES      = ['IST (UTC+5:30)','GMT (UTC+0)','EST (UTC-5)','PST (UTC-8)','GST (UTC+4)','SGT (UTC+8)']
const DATE_FORMATS   = ['DD/MM/YYYY','MM/DD/YYYY','YYYY-MM-DD']

// ─── Step metadata ────────────────────────────────────────────────────────────

const STEPS = [
  { id: 1, label: 'Personal',    icon: User,     required: true  },
  { id: 2, label: 'Contact',     icon: Phone,    required: true  },
  { id: 3, label: 'Employment',  icon: Briefcase,required: true  },
  { id: 4, label: 'Identity',    icon: Shield,   required: false },
  { id: 5, label: 'Credentials', icon: Lock,     required: true  },
  { id: 6, label: 'Emergency',   icon: Heart,    required: false },
  { id: 7, label: 'Preferences', icon: Settings, required: false },
]

// ─── Form data type ───────────────────────────────────────────────────────────

interface FormData {
  // Step 1 – Personal
  firstName: string; middleName: string; lastName: string
  preferredName: string; dateOfBirth: string; gender: string
  nationality: string; maritalStatus: string

  // Step 2 – Contact
  workEmail: string; personalEmail: string; mobileNumber: string
  alternatePhone: string; address: string; city: string
  state: string; postalCode: string; country: string

  // Step 3 – Employment
  role: string; jobTitle: string; department: string
  businessUnit: string; workLocation: string; startDate: string
  employmentType: string; workerType: string; managerName: string; costCenter: string

  // Step 4 – Identity (optional)
  nationalId: string; passportNumber: string; taxId: string; pfNumber: string

  // Step 5 – Credentials
  password: string; confirmPassword: string

  // Step 6 – Emergency Contact (optional)
  emergencyName: string; emergencyRelation: string
  emergencyPhone: string; emergencyEmail: string

  // Step 7 – Preferences (optional)
  preferredLanguage: string; timezone: string; dateFormat: string
}

const INITIAL: FormData = {
  firstName:'',middleName:'',lastName:'',preferredName:'',dateOfBirth:'',
  gender:'',nationality:'',maritalStatus:'',
  workEmail:'',personalEmail:'',mobileNumber:'',alternatePhone:'',
  address:'',city:'',state:'',postalCode:'',country:'India',
  role:'EMPLOYEE',jobTitle:'',department:'',businessUnit:'',
  workLocation:'Office',startDate:'',employmentType:'Full-time',
  workerType:'Regular',managerName:'',costCenter:'',
  nationalId:'',passportNumber:'',taxId:'',pfNumber:'',
  password:'',confirmPassword:'',
  emergencyName:'',emergencyRelation:'',emergencyPhone:'',emergencyEmail:'',
  preferredLanguage:'English',timezone:'IST (UTC+5:30)',dateFormat:'DD/MM/YYYY',
}

// ─── Small helpers ────────────────────────────────────────────────────────────

function FieldWrap({ label, required, children, hint }: {
  label: string; required?: boolean; children: React.ReactNode; hint?: string
}) {
  return (
    <div className="flex flex-col gap-1">
      <Label className="text-slate-300 text-xs font-medium">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </Label>
      {children}
      {hint && <p className="text-[11px] text-slate-500">{hint}</p>}
    </div>
  )
}

function TextInput({ value, onChange, placeholder, type = 'text', disabled }: {
  value: string; onChange: (v: string) => void
  placeholder?: string; type?: string; disabled?: boolean
}) {
  return (
    <Input type={type} value={value} placeholder={placeholder} disabled={disabled}
      onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
      className="bg-white/5 border-white/10 text-white placeholder:text-slate-600
                 focus-visible:ring-blue-500 h-9 text-sm" />
  )
}

function SelectInput({ value, onChange, options, placeholder }: {
  value: string; onChange: (v: string) => void
  options: string[] | { value: string; label: string }[]
  placeholder?: string
}) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)}
      className="w-full h-9 rounded-md bg-white/5 border border-white/10 text-sm
                 text-white px-3 focus:outline-none focus:ring-2 focus:ring-blue-500
                 [&>option]:bg-slate-800 [&>option]:text-white">
      {placeholder && <option value="" className="text-slate-500">{placeholder}</option>}
      {options.map((o) =>
        typeof o === 'string'
          ? <option key={o} value={o}>{o}</option>
          : <option key={o.value} value={o.value}>{o.label}</option>
      )}
    </select>
  )
}

function Req({ met, label }: { met: boolean; label: string }) {
  return (
    <li className="flex items-center gap-2 text-xs">
      {met ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
           : <XCircle      className="h-3.5 w-3.5 text-slate-600   shrink-0" />}
      <span className={met ? 'text-emerald-300' : 'text-slate-400'}>{label}</span>
    </li>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function SignupPage() {
  const [step,    setStep]    = useState(1)
  const [form,    setForm]    = useState<FormData>(INITIAL)
  const [error,   setError]   = useState('')
  const [loading, setLoading] = useState(false)
  const [showPw,  setShowPw]  = useState(false)
  const [showCpw, setShowCpw] = useState(false)

  // success state
  const [success,   setSuccess]   = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const [demoLink,  setDemoLink]  = useState<string | null>(null)

  const set = (k: keyof FormData) => (v: string) =>
    setForm((f) => ({ ...f, [k]: v }))

  // ── Password live checks ────────────────────────────────────────────────
  const pwChecks: PasswordCheck = checkPassword(form.password)
  const pwAllMet =
    pwChecks.minLength && pwChecks.hasUppercase &&
    pwChecks.hasLowercase && pwChecks.hasDigit && pwChecks.hasTwoSpecial

  // ── Email live check ────────────────────────────────────────────────────
  const emailParts = form.workEmail.split('@')
  const emailOk =
    form.workEmail.length > 0 &&
    emailParts.length === 2 &&
    form.workEmail.toLowerCase().endsWith('@cloudaeon.com')

  // ── Per-step validation ─────────────────────────────────────────────────
  function validateStep(s: number): string | null {
    switch (s) {
      case 1:
        if (!form.firstName.trim()) return 'First name is required.'
        if (!form.lastName.trim())  return 'Last name is required.'
        if (!form.dateOfBirth)      return 'Date of birth is required.'
        if (!form.nationality)      return 'Nationality is required.'
        return null
      case 2:
        if (!emailOk)               return 'Work email must end with @cloudaeon.com and contain exactly one @.'
        if (!form.mobileNumber.trim()) return 'Mobile number is required.'
        if (!form.address.trim())   return 'Residential address is required.'
        if (!form.city.trim())      return 'City is required.'
        if (!form.state)            return 'State / Province is required.'
        if (!form.postalCode.trim())return 'Postal / ZIP code is required.'
        if (!form.country)          return 'Country is required.'
        return null
      case 3:
        if (!form.jobTitle)         return 'Job title is required.'
        if (!form.department)       return 'Department is required.'
        if (!form.workLocation)     return 'Work location is required.'
        if (!form.startDate)        return 'Start date is required.'
        if (!form.employmentType)   return 'Employment type is required.'
        return null
      case 4: return null   // all optional
      case 5:
        if (!pwAllMet)              return 'Password does not meet requirements.'
        if (form.password !== form.confirmPassword) return 'Passwords do not match.'
        return null
      case 6: return null   // all optional
      case 7: return null   // all optional
      default: return null
    }
  }

  function nextStep() {
    const err = validateStep(step)
    if (err) { setError(err); return }
    setError('')
    setStep((s) => Math.min(s + 1, STEPS.length))
  }

  function prevStep() {
    setError('')
    setStep((s) => Math.max(s - 1, 1))
  }

  // ── Final submit ────────────────────────────────────────────────────────
  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')

    // Validate step 5 (credentials) on final submit too
    const err = validateStep(5)
    if (err) { setError(err); return }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email:    form.workEmail.trim().toLowerCase(),
          password: form.password,
          profile: {
            firstName:      form.firstName.trim(),
            middleName:     form.middleName.trim() || undefined,
            lastName:       form.lastName.trim(),
            preferredName:  form.preferredName.trim() || undefined,
            dateOfBirth:    form.dateOfBirth,
            gender:         form.gender || undefined,
            nationality:    form.nationality,
            maritalStatus:  form.maritalStatus || undefined,

            personalEmail:  form.personalEmail.trim() || undefined,
            mobileNumber:   form.mobileNumber.trim(),
            alternatePhone: form.alternatePhone.trim() || undefined,
            address:        form.address.trim(),
            city:           form.city.trim(),
            state:          form.state,
            postalCode:     form.postalCode.trim(),
            country:        form.country,

            role:           form.role,
            jobTitle:       form.jobTitle,
            department:     form.department,
            businessUnit:   form.businessUnit.trim() || undefined,
            workLocation:   form.workLocation,
            startDate:      form.startDate,
            employmentType: form.employmentType,
            workerType:     form.workerType || undefined,
            managerName:    form.managerName.trim() || undefined,
            costCenter:     form.costCenter.trim() || undefined,

            nationalId:     form.nationalId.trim() || undefined,
            passportNumber: form.passportNumber.trim() || undefined,
            taxId:          form.taxId.trim() || undefined,
            pfNumber:       form.pfNumber.trim() || undefined,

            emergencyContactName:     form.emergencyName.trim() || undefined,
            emergencyContactRelation: form.emergencyRelation || undefined,
            emergencyContactPhone:    form.emergencyPhone.trim() || undefined,
            emergencyContactEmail:    form.emergencyEmail.trim() || undefined,

            preferredLanguage: form.preferredLanguage || undefined,
            timezone:          form.timezone || undefined,
            dateFormat:        form.dateFormat || undefined,
          },
        }),
      })

      const data = await res.json() as {
        message?: string; error?: string; demoActivationLink?: string | null
      }

      if (!res.ok) {
        setError(data.error ?? 'Registration failed. Please try again.')
        return
      }

      setEmailSent(!data.demoActivationLink)
      setDemoLink(data.demoActivationLink ?? null)
      setSuccess(true)
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // ── Success screen ──────────────────────────────────────────────────────
  if (success) {
    return (
      <div className="relative z-10 w-full max-w-lg">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 mb-4">
              <CheckCircle2 className="h-8 w-8 text-emerald-400" />
            </div>
            <h1 className="text-2xl font-bold text-white">Registration Successful!</h1>
            <p className="text-sm text-slate-400 mt-1">One more step to activate your account</p>
          </div>

          {emailSent ? (
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 mb-6">
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-blue-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-blue-300 mb-1">Check your email</p>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    We sent an activation email to{' '}
                    <span className="text-white font-mono">{form.workEmail.toLowerCase()}</span>.
                    Click the <strong className="text-white">Activate Account</strong> button in
                    the email to complete your registration.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3 mb-6">
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-amber-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-amber-300 mb-1">Demo mode — no email sent</p>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      No <code className="text-slate-300">RESEND_API_KEY</code> is set.
                      Use the link below to activate instantly.
                    </p>
                  </div>
                </div>
              </div>
              {demoLink && (
                <a href={demoLink}
                  className="flex items-center justify-center gap-2 w-full py-3 px-4
                             bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30
                             rounded-xl text-emerald-300 text-sm font-medium transition-colors">
                  <ExternalLink className="h-4 w-4" />
                  Click here to Activate your Account
                </a>
              )}
            </div>
          )}

          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-xs text-slate-500">already activated?</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>
          <Link href="/login">
            <Button className="w-full gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white border-0">
              <ArrowLeft className="h-4 w-4" /> Back to Sign In
            </Button>
          </Link>
        </div>
        <p className="text-center text-xs text-slate-500 mt-4">© 2025 Cloudaeon Technologies · CEMT v1.0</p>
      </div>
    )
  }

  // ── Step progress bar ───────────────────────────────────────────────────
  const currentStep = STEPS[step - 1]

  // ── Render form ─────────────────────────────────────────────────────────
  return (
    <div className="relative z-10 w-full max-w-2xl">
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden">

        {/* ── Header ──────────────────────────────────────────────────── */}
        <div className="bg-gradient-to-r from-blue-600/20 to-indigo-600/20 border-b border-white/10 px-6 py-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600">
              <UserPlus className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">Employee Registration</h1>
              <p className="text-xs text-slate-400">Cloudaeon Tracker · Complete all required fields</p>
            </div>
          </div>

          {/* Step tabs */}
          <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-none">
            {STEPS.map((s) => {
              const Icon = s.icon
              const isDone    = step > s.id
              const isCurrent = step === s.id
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => { if (step > s.id) { setError(''); setStep(s.id) } }}
                  disabled={step < s.id}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
                    whitespace-nowrap transition-all shrink-0
                    ${isCurrent ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                      : isDone  ? 'bg-emerald-500/20 text-emerald-300 cursor-pointer'
                                : 'bg-white/5 text-slate-500 cursor-not-allowed opacity-50'}`}
                >
                  {isDone
                    ? <CheckCircle2 className="h-3 w-3" />
                    : <Icon className="h-3 w-3" />}
                  {s.label}
                  {!s.required && !isDone && !isCurrent &&
                    <span className="text-[10px] opacity-60 ml-0.5">(opt)</span>}
                </button>
              )
            })}
          </div>
        </div>

        {/* ── Form body ────────────────────────────────────────────────── */}
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-5 max-h-[62vh] overflow-y-auto">

            {/* Section header */}
            <div className="flex items-center gap-2 mb-1">
              {(() => { const Icon = currentStep.icon; return <Icon className="h-4 w-4 text-blue-400" /> })()}
              <h2 className="text-sm font-semibold text-white">{currentStep.label} Information</h2>
              {!currentStep.required && (
                <span className="ml-auto text-[11px] text-slate-500 bg-white/5 px-2 py-0.5 rounded-full">
                  Optional — you can skip
                </span>
              )}
            </div>

            {/* ══════════════ STEP 1 — Personal Info ══════════════ */}
            {step === 1 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FieldWrap label="First Name" required>
                  <TextInput value={form.firstName} onChange={set('firstName')} placeholder="e.g. Harshal" />
                </FieldWrap>
                <FieldWrap label="Middle Name">
                  <TextInput value={form.middleName} onChange={set('middleName')} placeholder="Optional" />
                </FieldWrap>
                <FieldWrap label="Last Name" required>
                  <TextInput value={form.lastName} onChange={set('lastName')} placeholder="e.g. Ugale" />
                </FieldWrap>
                <FieldWrap label="Preferred / Display Name">
                  <TextInput value={form.preferredName} onChange={set('preferredName')} placeholder="Optional nickname" />
                </FieldWrap>
                <FieldWrap label="Date of Birth" required>
                  <TextInput type="date" value={form.dateOfBirth} onChange={set('dateOfBirth')} />
                </FieldWrap>
                <FieldWrap label="Gender">
                  <SelectInput value={form.gender} onChange={set('gender')} options={GENDERS} placeholder="Select gender" />
                </FieldWrap>
                <FieldWrap label="Nationality / Citizenship" required>
                  <SelectInput value={form.nationality} onChange={set('nationality')} options={COUNTRIES} placeholder="Select country" />
                </FieldWrap>
                <FieldWrap label="Marital Status">
                  <SelectInput value={form.maritalStatus} onChange={set('maritalStatus')} options={MARITAL} placeholder="Select" />
                </FieldWrap>
              </div>
            )}

            {/* ══════════════ STEP 2 — Contact Details ══════════════ */}
            {step === 2 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Work email — full width with validation */}
                <div className="sm:col-span-2 flex flex-col gap-1">
                  <Label className="text-slate-300 text-xs font-medium">
                    Work Email Address <span className="text-red-400">*</span>
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2 h-4 w-4 text-slate-500 pointer-events-none" />
                    <Input
                      type="text"
                      value={form.workEmail}
                      placeholder="firstname.lastname@cloudaeon.com"
                      onChange={(e: ChangeEvent<HTMLInputElement>) => set('workEmail')(e.target.value)}
                      className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-slate-600
                                 focus-visible:ring-blue-500 h-9 text-sm"
                    />
                  </div>
                  {form.workEmail.length > 0 && (
                    <p className={`text-xs flex items-center gap-1.5 ${emailOk ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {emailOk
                        ? <><CheckCircle2 className="h-3 w-3" /> Valid Cloudaeon email</>
                        : <><AlertCircle  className="h-3 w-3" /> Must end with @cloudaeon.com · exactly one @</>}
                    </p>
                  )}
                </div>

                <FieldWrap label="Personal Email">
                  <TextInput type="email" value={form.personalEmail} onChange={set('personalEmail')} placeholder="personal@example.com (optional)" />
                </FieldWrap>
                <FieldWrap label="Mobile Number" required hint="+91 XXXXX XXXXX">
                  <TextInput type="tel" value={form.mobileNumber} onChange={set('mobileNumber')} placeholder="+91 98765 00000" />
                </FieldWrap>
                <FieldWrap label="Alternate / Home Phone">
                  <TextInput type="tel" value={form.alternatePhone} onChange={set('alternatePhone')} placeholder="Optional" />
                </FieldWrap>

                <div className="sm:col-span-2">
                  <FieldWrap label="Residential Address" required>
                    <textarea
                      value={form.address}
                      onChange={(e) => set('address')(e.target.value)}
                      placeholder="Street / Apartment / Area"
                      rows={2}
                      className="w-full rounded-md bg-white/5 border border-white/10 text-sm text-white
                                 px-3 py-2 placeholder:text-slate-600 focus:outline-none focus:ring-2
                                 focus:ring-blue-500 resize-none"
                    />
                  </FieldWrap>
                </div>

                <FieldWrap label="City" required>
                  <TextInput value={form.city} onChange={set('city')} placeholder="Mumbai" />
                </FieldWrap>
                <FieldWrap label="State / Province" required>
                  <SelectInput value={form.state} onChange={set('state')} options={INDIAN_STATES} placeholder="Select state" />
                </FieldWrap>
                <FieldWrap label="Postal / ZIP Code" required>
                  <TextInput value={form.postalCode} onChange={set('postalCode')} placeholder="400001" />
                </FieldWrap>
                <FieldWrap label="Country" required>
                  <SelectInput value={form.country} onChange={set('country')} options={COUNTRIES} placeholder="Select country" />
                </FieldWrap>
              </div>
            )}

            {/* ══════════════ STEP 3 — Employment Details ══════════════ */}
            {step === 3 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FieldWrap label="Employee ID" hint="Auto-generated after activation">
                  <div className="h-9 flex items-center px-3 bg-white/5 border border-white/10 rounded-md text-slate-500 text-sm gap-2">
                    <Lock className="h-3.5 w-3.5" /> Auto-generated
                  </div>
                </FieldWrap>
                <FieldWrap label="Role / Access Level" required>
                  <SelectInput value={form.role} onChange={set('role')} options={ROLES} />
                </FieldWrap>
                <FieldWrap label="Job Title / Designation" required>
                  <SelectInput value={form.jobTitle} onChange={set('jobTitle')} options={JOB_TITLES} placeholder="Select title" />
                </FieldWrap>
                <FieldWrap label="Department" required>
                  <SelectInput value={form.department} onChange={set('department')} options={DEPARTMENTS} placeholder="Select department" />
                </FieldWrap>
                <FieldWrap label="Business Unit / Division">
                  <TextInput value={form.businessUnit} onChange={set('businessUnit')} placeholder="e.g. Cloud Infrastructure" />
                </FieldWrap>
                <FieldWrap label="Work Location" required>
                  <SelectInput value={form.workLocation} onChange={set('workLocation')} options={WORK_LOCATIONS} />
                </FieldWrap>
                <FieldWrap label="Hire / Start Date" required>
                  <TextInput type="date" value={form.startDate} onChange={set('startDate')} />
                </FieldWrap>
                <FieldWrap label="Employment Type" required>
                  <SelectInput value={form.employmentType} onChange={set('employmentType')} options={EMP_TYPES} />
                </FieldWrap>
                <FieldWrap label="Worker Type">
                  <SelectInput value={form.workerType} onChange={set('workerType')} options={WORKER_TYPES} />
                </FieldWrap>
                <FieldWrap label="Direct Manager / Supervisor">
                  <TextInput value={form.managerName} onChange={set('managerName')} placeholder="Manager's name (optional)" />
                </FieldWrap>
                <FieldWrap label="Cost Center">
                  <TextInput value={form.costCenter} onChange={set('costCenter')} placeholder="CC-XXXX (optional)" />
                </FieldWrap>
              </div>
            )}

            {/* ══════════════ STEP 4 — Identity & Govt IDs (optional) ══════════════ */}
            {step === 4 && (
              <div className="space-y-4">
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 text-xs text-blue-300">
                  All fields on this page are optional. Your information is stored securely and encrypted at rest.
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FieldWrap label="National ID / Aadhar" hint="Encrypted">
                    <TextInput value={form.nationalId} onChange={set('nationalId')} placeholder="XXXX XXXX XXXX" />
                  </FieldWrap>
                  <FieldWrap label="Passport Number">
                    <TextInput value={form.passportNumber} onChange={set('passportNumber')} placeholder="Optional" />
                  </FieldWrap>
                  <FieldWrap label="Tax ID (PAN / TIN / EIN)">
                    <TextInput value={form.taxId} onChange={set('taxId')} placeholder="ABCDE1234F" />
                  </FieldWrap>
                  <FieldWrap label="Social Security / PF Number">
                    <TextInput value={form.pfNumber} onChange={set('pfNumber')} placeholder="Optional" />
                  </FieldWrap>
                </div>
              </div>
            )}

            {/* ══════════════ STEP 5 — Account Credentials ══════════════ */}
            {step === 5 && (
              <div className="space-y-4">
                {/* Username — auto-filled from email */}
                <FieldWrap label="Username (auto-filled from work email)" hint="Cannot be changed here">
                  <div className="flex items-center gap-2 h-9 px-3 bg-white/5 border border-white/10 rounded-md text-sm">
                    <Mail className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                    <span className={emailOk ? 'text-white' : 'text-slate-500'}>
                      {emailOk ? form.workEmail.trim().toLowerCase() : 'Enter work email in Step 2 first'}
                    </span>
                  </div>
                </FieldWrap>

                {/* Password */}
                <FieldWrap label="Password" required>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2 h-4 w-4 text-slate-500 pointer-events-none" />
                    <Input type={showPw ? 'text' : 'password'} value={form.password}
                      placeholder="e.g. #Work@123"
                      onChange={(e: ChangeEvent<HTMLInputElement>) => set('password')(e.target.value)}
                      className="pl-9 pr-10 bg-white/5 border-white/10 text-white placeholder:text-slate-600
                                 focus-visible:ring-blue-500 h-9 text-sm" />
                    <button type="button" onClick={() => setShowPw(v => !v)}
                      className="absolute right-3 top-2 text-slate-400 hover:text-slate-200 transition-colors">
                      {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </FieldWrap>

                {/* Live password requirements */}
                {form.password.length > 0 && (
                  <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                      Password Requirements
                    </p>
                    <ul className="space-y-1">
                      <Req met={pwChecks.minLength}     label="At least 8 characters" />
                      <Req met={pwChecks.hasUppercase}  label="At least 1 uppercase letter (A-Z)" />
                      <Req met={pwChecks.hasLowercase}  label="At least 1 lowercase letter (a-z)" />
                      <Req met={pwChecks.hasDigit}      label="At least 1 number (0-9)" />
                      <Req met={pwChecks.hasTwoSpecial} label="At least 2 special characters (e.g. # @ $ !)" />
                    </ul>
                    <p className="mt-2 text-[10px] text-slate-500">
                      Examples: <span className="text-slate-400 font-mono">#Work@123</span>
                      {' · '}
                      <span className="text-slate-400 font-mono">#Airbase$1610</span>
                    </p>
                  </div>
                )}

                {/* Confirm password */}
                <FieldWrap label="Confirm Password" required>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2 h-4 w-4 text-slate-500 pointer-events-none" />
                    <Input type={showCpw ? 'text' : 'password'} value={form.confirmPassword}
                      placeholder="Re-enter your password"
                      onChange={(e: ChangeEvent<HTMLInputElement>) => set('confirmPassword')(e.target.value)}
                      className="pl-9 pr-10 bg-white/5 border-white/10 text-white placeholder:text-slate-600
                                 focus-visible:ring-blue-500 h-9 text-sm" />
                    <button type="button" onClick={() => setShowCpw(v => !v)}
                      className="absolute right-3 top-2 text-slate-400 hover:text-slate-200 transition-colors">
                      {showCpw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {form.confirmPassword.length > 0 && (
                    <p className={`text-xs flex items-center gap-1.5 mt-1 ${form.password === form.confirmPassword ? 'text-emerald-400' : 'text-red-400'}`}>
                      {form.password === form.confirmPassword
                        ? <><CheckCircle2 className="h-3 w-3" /> Passwords match</>
                        : <><XCircle      className="h-3 w-3" /> Passwords do not match</>}
                    </p>
                  )}
                </FieldWrap>

                {/* MFA hint */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-slate-400">
                  <span className="text-slate-300 font-medium">MFA / 2FA:</span>{' '}
                  Multi-factor authentication can be configured after your account is activated.
                </div>
              </div>
            )}

            {/* ══════════════ STEP 6 — Emergency Contact (optional) ══════════════ */}
            {step === 6 && (
              <div className="space-y-4">
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 text-xs text-blue-300">
                  Emergency contact details are optional but recommended.
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FieldWrap label="Contact Full Name">
                    <TextInput value={form.emergencyName} onChange={set('emergencyName')} placeholder="Full name" />
                  </FieldWrap>
                  <FieldWrap label="Relationship">
                    <SelectInput value={form.emergencyRelation} onChange={set('emergencyRelation')} options={RELATIONS} placeholder="Select" />
                  </FieldWrap>
                  <FieldWrap label="Contact Phone">
                    <TextInput type="tel" value={form.emergencyPhone} onChange={set('emergencyPhone')} placeholder="+91 XXXXX XXXXX" />
                  </FieldWrap>
                  <FieldWrap label="Contact Email">
                    <TextInput type="email" value={form.emergencyEmail} onChange={set('emergencyEmail')} placeholder="emergency@example.com" />
                  </FieldWrap>
                </div>
              </div>
            )}

            {/* ══════════════ STEP 7 — Preferences (optional) ══════════════ */}
            {step === 7 && (
              <div className="space-y-4">
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 text-xs text-blue-300">
                  These preferences can also be changed later from your profile settings.
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FieldWrap label="Preferred Language">
                    <SelectInput value={form.preferredLanguage} onChange={set('preferredLanguage')} options={LANGUAGES} />
                  </FieldWrap>
                  <FieldWrap label="Time Zone">
                    <SelectInput value={form.timezone} onChange={set('timezone')} options={TIMEZONES} />
                  </FieldWrap>
                  <FieldWrap label="Date Format">
                    <SelectInput value={form.dateFormat} onChange={set('dateFormat')} options={DATE_FORMATS} />
                  </FieldWrap>
                  <FieldWrap label="Profile Photo" hint="Can be uploaded after activation">
                    <div className="h-9 flex items-center px-3 bg-white/5 border border-white/10 rounded-md text-slate-500 text-sm gap-2">
                      <Lock className="h-3.5 w-3.5" /> Available after account activation
                    </div>
                  </FieldWrap>
                </div>

                {/* Summary box */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-2">
                  <p className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3">Registration Summary</p>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                    <span className="text-slate-500">Name:</span>
                    <span className="text-white">{[form.firstName, form.lastName].filter(Boolean).join(' ') || '—'}</span>
                    <span className="text-slate-500">Work Email:</span>
                    <span className="text-white font-mono">{form.workEmail || '—'}</span>
                    <span className="text-slate-500">Role:</span>
                    <span className="text-white">{ROLES.find(r => r.value === form.role)?.label ?? form.role}</span>
                    <span className="text-slate-500">Department:</span>
                    <span className="text-white">{form.department || '—'}</span>
                    <span className="text-slate-500">Job Title:</span>
                    <span className="text-white">{form.jobTitle || '—'}</span>
                    <span className="text-slate-500">Password:</span>
                    <span className={pwAllMet ? 'text-emerald-400' : 'text-red-400'}>
                      {pwAllMet ? '✓ Meets requirements' : '✗ Not set / invalid'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Error message */}
            {error && (
              <div className="flex items-start gap-2 text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* ── Footer navigation ────────────────────────────────────────── */}
          <div className="px-6 py-4 border-t border-white/10 flex items-center justify-between gap-3 bg-black/10">
            {step > 1 ? (
              <Button type="button" variant="outline" onClick={prevStep}
                className="gap-2 border-white/10 text-slate-300 hover:text-white hover:bg-white/10 bg-transparent">
                <ArrowLeft className="h-4 w-4" /> Back
              </Button>
            ) : (
              <Link href="/login">
                <Button variant="outline"
                  className="gap-2 border-white/10 text-slate-300 hover:text-white hover:bg-white/10 bg-transparent">
                  <ArrowLeft className="h-4 w-4" /> Sign In
                </Button>
              </Link>
            )}

            <div className="flex items-center gap-1.5">
              {STEPS.map((s) => (
                <div key={s.id}
                  className={`h-1.5 rounded-full transition-all
                    ${s.id === step ? 'w-6 bg-blue-500'
                      : s.id < step  ? 'w-3 bg-emerald-500'
                                     : 'w-3 bg-white/15'}`}
                />
              ))}
            </div>

            {step < STEPS.length ? (
              <Button type="button" onClick={nextStep}
                className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 border-0 text-white">
                Next <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button type="submit" disabled={loading || !pwAllMet || !emailOk}
                className="gap-2 bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-500 hover:to-blue-500 border-0 text-white disabled:opacity-40">
                {loading ? 'Submitting…' : <><CheckCircle2 className="h-4 w-4" /> Submit Registration</>}
              </Button>
            )}
          </div>
        </form>
      </div>

      <p className="text-center text-xs text-slate-500 mt-4">
        © 2025 Cloudaeon Technologies · CEMT v1.0 Demo
      </p>
    </div>
  )
}
