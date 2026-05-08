'use client'

import { Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer'
import type { Payslip } from '@/lib/types'

const MONTHS = [
  '', 'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

function fmt(n: number): string {
  return `₹${n.toLocaleString('en-IN')}`
}

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: '#1e293b',
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: '#2563eb',
  },
  companyName: {
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
    color: '#2563eb',
  },
  companyTagline: {
    fontSize: 9,
    color: '#64748b',
    marginTop: 3,
  },
  payslipLabel: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'right',
    color: '#1e293b',
  },
  periodLabel: {
    fontSize: 10,
    color: '#64748b',
    textAlign: 'right',
    marginTop: 3,
  },
  sectionTitle: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 18,
    marginBottom: 6,
  },
  table: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 4,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  rowAlt: {
    backgroundColor: '#f8fafc',
  },
  rowLabel: {
    fontSize: 10,
    color: '#475569',
  },
  rowValue: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: '#1e293b',
  },
  earnValue: {
    color: '#059669',
  },
  deductValue: {
    color: '#dc2626',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  totalLabel: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: '#1e293b',
  },
  totalValue: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
  },
  netBox: {
    backgroundColor: '#ecfdf5',
    borderRadius: 6,
    paddingVertical: 14,
    paddingHorizontal: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 18,
  },
  netLabel: {
    fontSize: 13,
    fontFamily: 'Helvetica-Bold',
    color: '#065f46',
  },
  netValue: {
    fontSize: 16,
    fontFamily: 'Helvetica-Bold',
    color: '#059669',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerText: {
    fontSize: 8,
    color: '#94a3b8',
  },
})

export function PayslipDocument({ payslip }: { payslip: Payslip }) {
  const period = `${MONTHS[payslip.month]} ${payslip.year}`

  const employeeRows = [
    ['Employee Name', payslip.employeeName],
    ['Employee ID', payslip.employeeId.toUpperCase()],
    ['Pay Period', period],
  ]

  const earningRows: [string, number][] = [
    ['Basic Salary', payslip.basicSalary],
    ['House Rent Allowance (HRA)', payslip.hra],
    ['Transport Allowance', payslip.transport],
  ]

  const deductionRows: [string, number][] = [
    ['Provident Fund (12% of Basic)', payslip.pf],
    ['Income Tax', payslip.tax],
  ]

  return (
    <Document title={`Payslip — ${payslip.employeeName} — ${period}`}>
      <Page size="A4" style={styles.page}>

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.companyName}>Cloudaeon Technologies</Text>
            <Text style={styles.companyTagline}>Cloudaeon Employee Management Tool (CEMT)</Text>
          </View>
          <View>
            <Text style={styles.payslipLabel}>PAYSLIP</Text>
            <Text style={styles.periodLabel}>{period}</Text>
          </View>
        </View>

        {/* Employee Details */}
        <Text style={styles.sectionTitle}>Employee Details</Text>
        <View style={styles.table}>
          {employeeRows.map(([label, value], i) => (
            <View key={label} style={[styles.row, i % 2 === 1 ? styles.rowAlt : {}]}>
              <Text style={styles.rowLabel}>{label}</Text>
              <Text style={styles.rowValue}>{value}</Text>
            </View>
          ))}
        </View>

        {/* Earnings */}
        <Text style={styles.sectionTitle}>Earnings</Text>
        <View style={styles.table}>
          {earningRows.map(([label, value], i) => (
            <View key={label} style={[styles.row, i % 2 === 1 ? styles.rowAlt : {}]}>
              <Text style={styles.rowLabel}>{label}</Text>
              <Text style={[styles.rowValue, styles.earnValue]}>{fmt(value)}</Text>
            </View>
          ))}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Gross Pay</Text>
            <Text style={[styles.totalValue, { color: '#1e293b' }]}>{fmt(payslip.grossPay)}</Text>
          </View>
        </View>

        {/* Deductions */}
        <Text style={styles.sectionTitle}>Deductions</Text>
        <View style={styles.table}>
          {deductionRows.map(([label, value], i) => (
            <View key={label} style={[styles.row, i % 2 === 1 ? styles.rowAlt : {}]}>
              <Text style={styles.rowLabel}>{label}</Text>
              <Text style={[styles.rowValue, styles.deductValue]}>-{fmt(value)}</Text>
            </View>
          ))}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Deductions</Text>
            <Text style={[styles.totalValue, styles.deductValue]}>-{fmt(payslip.deductions)}</Text>
          </View>
        </View>

        {/* Net Pay */}
        <View style={styles.netBox}>
          <Text style={styles.netLabel}>Net Take-Home Pay</Text>
          <Text style={styles.netValue}>{fmt(payslip.netPay)}</Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            This is a system-generated payslip and does not require a signature.
          </Text>
          <Text style={styles.footerText}>© {payslip.year} Cloudaeon Technologies</Text>
        </View>

      </Page>
    </Document>
  )
}
