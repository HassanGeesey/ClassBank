import jsPDF from 'jspdf'
import 'jspdf-autotable'
import { formatCurrency } from '../../lib/utils'
import i18n from '../../lib/i18n'
import type { Contribution, Expense, Profile } from '../../lib/types'

interface ContributionWithStudent extends Contribution {
  profiles: { student_id: string; name: string }
}

function hexToRgb(hex: string): [number, number, number] {
  const v = parseInt(hex.replace('#', ''), 16)
  return [(v >> 16) & 255, (v >> 8) & 255, v & 255]
}

const darkBg = hexToRgb('#0f172a')
const altBg = hexToRgb('#f8fafc')

export async function generateContributionReport(
  title: string,
  contributions: ContributionWithStudent[],
  total: number,
) {
  const doc = new jsPDF('p', 'mm', 'a4')
  doc.setFontSize(18)
  doc.text(title, 14, 22)
  doc.setFontSize(10)
  doc.text(i18n.t('pdf.generated', { date: new Date().toLocaleDateString() }), 14, 30)
  doc.text(i18n.t('pdf.totalContributions', { currency: formatCurrency(total) }), 14, 36)

  doc.autoTable({
    startY: 44,
    head: [[i18n.t('pdf.columns.studentId'), i18n.t('pdf.columns.name'), i18n.t('pdf.columns.amount'), i18n.t('pdf.columns.date')]],
    body: contributions.map((c) => [
      c.profiles?.student_id ?? '',
      c.profiles?.name ?? '',
      formatCurrency(Number(c.amount)),
      new Date(c.date).toLocaleDateString(),
    ]),
    theme: 'grid',
    headStyles: { fillColor: darkBg, textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: altBg },
    columnStyles: {
      2: { halign: 'right' },
      3: { halign: 'right' },
    },
    margin: { horizontal: 10 },
  })

  doc.save('contributions-report.pdf')
}

export async function generateExpenseReport(
  title: string,
  expenses: Expense[],
  total: number,
) {
  const doc = new jsPDF('p', 'mm', 'a4')
  doc.setFontSize(18)
  doc.text(title, 14, 22)
  doc.setFontSize(10)
  doc.text(i18n.t('pdf.generated', { date: new Date().toLocaleDateString() }), 14, 30)
  doc.text(i18n.t('pdf.totalExpenses', { currency: formatCurrency(total) }), 14, 36)

  doc.autoTable({
    startY: 44,
    head: [[i18n.t('pdf.columns.description'), i18n.t('pdf.columns.amount'), i18n.t('pdf.columns.date')]],
    body: expenses.map((e) => [
      e.description,
      formatCurrency(Number(e.amount)),
      new Date(e.date).toLocaleDateString(),
    ]),
    theme: 'grid',
    headStyles: { fillColor: darkBg, textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: altBg },
    columnStyles: {
      1: { halign: 'right' },
      2: { halign: 'right' },
    },
    margin: { horizontal: 10 },
  })

  doc.save('expenses-report.pdf')
}

export async function generateStudentStatusReport(
  title: string,
  students: Profile[],
  studentTotals: Record<string, number>,
  target: number,
) {
  const doc = new jsPDF('p', 'mm', 'a4')
  doc.setFontSize(18)
  doc.text(title, 14, 22)
  doc.setFontSize(10)
  doc.text(i18n.t('pdf.generated', { date: new Date().toLocaleDateString() }), 14, 30)
  doc.text(i18n.t('pdf.targetPerStudent', { currency: formatCurrency(target) }), 14, 36)

  const t = i18n.t

  doc.autoTable({
    startY: 44,
    head: [[t('pdf.columns.studentId'), t('pdf.columns.name'), t('pdf.columns.totalPaid'), t('pdf.columns.status')]],
    body: students.map((s) => {
      const paid = studentTotals[s.id] ?? 0
      const status = paid >= target ? t('pdf.status.paid') : paid > 0 ? t('pdf.status.partial') : t('pdf.status.unpaid')
      return [s.student_id, s.name, formatCurrency(paid), status]
    }),
    theme: 'grid',
    headStyles: { fillColor: darkBg, textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: altBg },
    columnStyles: {
      2: { halign: 'right' },
      3: { halign: 'center' },
    },
    margin: { horizontal: 10 },
  })

  doc.save('student-status-report.pdf')
}
