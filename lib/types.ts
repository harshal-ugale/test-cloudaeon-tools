export type Role = 'SUPER_ADMIN' | 'ADMIN' | 'HR' | 'MANAGER' | 'EMPLOYEE'
export type EmpStatus = 'ACTIVE' | 'INACTIVE' | 'ON_LEAVE' | 'TERMINATED'
export type LeaveType = 'ANNUAL' | 'SICK' | 'EMERGENCY' | 'MATERNITY' | 'PATERNITY' | 'COMPENSATORY' | 'UNPAID'
export type LeaveStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED'
export type AttStatus = 'PRESENT' | 'ABSENT' | 'HALF_DAY' | 'HOLIDAY' | 'WEEKEND'

export interface Employee {
  id: string
  employeeCode: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  avatar?: string
  department: string
  jobTitle: string
  role: Role
  status: EmpStatus
  startDate: string
  endDate?: string
  managerId?: string
  managerName?: string
  basicSalary: number
  hra: number
  transport: number
  pf: number
  taxSlab: number
}

export interface Leave {
  id: string
  employeeId: string
  employeeName: string
  employeeAvatar?: string
  department: string
  type: LeaveType
  startDate: string
  endDate: string
  days: number
  reason: string
  status: LeaveStatus
  approverId?: string
  approverName?: string
  approvedAt?: string
  notes?: string
  createdAt: string
}

export interface Payslip {
  id: string
  employeeId: string
  employeeName: string
  month: number
  year: number
  basicSalary: number
  hra: number
  transport: number
  grossPay: number
  pf: number
  tax: number
  deductions: number
  netPay: number
  paidOn?: string
}

export interface Attendance {
  id: string
  employeeId: string
  date: string
  checkIn?: string
  checkOut?: string
  status: AttStatus
  hoursWorked?: number
}

export interface Document {
  id: string
  employeeId: string
  name: string
  type: string
  fileUrl: string
  uploadedAt: string
}

export interface SalaryConfig {
  employeeId: string
  basicSalary: number
  hra: number
  transport: number
  pf: number
  taxSlab: number
  effectiveFrom: string
}

export interface PerformanceReview {
  id: string
  employeeId: string
  quarter: string
  year: number
  overallScore: number
  technicalSkills: number
  communication: number
  teamwork: number
  leadership: number
  delivery: number
  innovation: number
  reviewedBy: string
  comments: string
  createdAt: string
}

export interface AuthUser {
  id: string
  name: string
  email: string
  role: Role
  employeeId: string
  avatar?: string
  department: string
  jobTitle: string
}

export type CertificationStatus = 'PENDING_REVIEW' | 'VERIFIED' | 'REJECTED'

export interface Certification {
  id: string
  employeeId: string
  employeeName?: string
  employeeAvatar?: string
  department?: string
  certificateName: string
  issuingOrganization: string
  issueDate: string          // YYYY-MM-DD
  expiryDate?: string        // YYYY-MM-DD
  credentialId?: string
  fileUrl: string            // absolute disk path (empty for mock data)
  fileName: string
  fileSize: number           // bytes
  mimeType: string
  status: CertificationStatus
  uploadedAt: string
  verifiedAt?: string
  verifiedBy?: string
  remarks?: string
  createdAt: string
  updatedAt: string
}

export type TimesheetStatus = 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED'

export interface TimesheetEntry {
  id: string
  timesheetId: string
  date: string           // YYYY-MM-DD
  hoursWorked: number
  projectName: string
  description?: string
}

export interface Timesheet {
  id: string
  employeeId: string
  employeeName?: string
  employeeAvatar?: string
  department?: string
  periodStart: string    // YYYY-MM-DD
  periodEnd: string      // YYYY-MM-DD
  entries: TimesheetEntry[]
  status: TimesheetStatus
  totalHours: number
  submittedAt?: string
  reviewedAt?: string
  reviewedBy?: string
  remarks?: string
  createdAt: string
  updatedAt: string
}

export type Theme = 'default' | 'dark' | 'ocean' | 'forest' | 'sunset' | 'lavender'

export interface StatCard {
  title: string
  value: string | number
  change?: string
  changeType?: 'positive' | 'negative' | 'neutral'
  icon: string
  color: string
}
