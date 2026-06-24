import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import { formatCurrency } from '../../lib/utils'
import type { Contribution, Expense, Profile } from '../../lib/types'

interface ContributionWithStudent extends Contribution {
  profiles: { student_id: string; name: string }
}

export async function generateContributionReport(
  title: string,
  contributions: ContributionWithStudent[],
  total: number,
) {
  const doc = new jsPDF('p', 'mm', 'a4')
  doc.setFontSize(18)
  doc.text(title, 14, 22)
  doc.setFontSize(10)
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 30)
  doc.text(`Total Contributions: ${formatCurrency(total)}`, 14, 36)

  const rows = [['Student ID', 'Name', 'Amount', 'Date']]
  contributions.forEach((c) => {
    rows.push([
      c.profiles?.student_id ?? '',
      c.profiles?.name ?? '',
      formatCurrency(Number(c.amount)),
      new Date(c.date).toLocaleDateString(),
    ])
  })

  const table = buildTable(rows)
  doc.addImage(await tableToImage(table, doc), 'PNG', 10, 44, 190, 0)
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
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 30)
  doc.text(`Total Expenses: ${formatCurrency(total)}`, 14, 36)

  const rows = [['Description', 'Amount', 'Date']]
  expenses.forEach((e) => {
    rows.push([
      e.description,
      formatCurrency(Number(e.amount)),
      new Date(e.date).toLocaleDateString(),
    ])
  })

  const table = buildTable(rows)
  doc.addImage(await tableToImage(table, doc), 'PNG', 10, 44, 190, 0)
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
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 30)
  doc.text(`Target per Student: ${formatCurrency(target)}`, 14, 36)

  const rows = [['Student ID', 'Name', 'Total Paid', 'Status']]
  students.forEach((s) => {
    const paid = studentTotals[s.id] ?? 0
    const status = paid >= target ? 'Paid' : paid > 0 ? 'Partial' : 'Unpaid'
    rows.push([s.student_id, s.name, formatCurrency(paid), status])
  })

  const table = buildTable(rows)
  doc.addImage(await tableToImage(table, doc), 'PNG', 10, 44, 190, 0)
  doc.save('student-status-report.pdf')
}

function buildTable(rows: string[][]) {
  const table = document.createElement('table')
  table.style.width = '100%'
  table.style.borderCollapse = 'collapse'
  table.style.fontSize = '10px'
  table.style.fontFamily = 'monospace'

  rows.forEach((row, i) => {
    const tr = document.createElement('tr')
    if (i === 0) {
      tr.style.backgroundColor = '#0f172a'
      tr.style.color = '#fff'
      tr.style.fontWeight = 'bold'
    } else if (i % 2 === 0) {
      tr.style.backgroundColor = '#f8fafc'
    }
    row.forEach((cell) => {
      const td = document.createElement(i === 0 ? 'th' : 'td')
      td.textContent = cell
      td.style.padding = '4px 8px'
      td.style.border = '1px solid #e2e8f0'
      td.style.textAlign = ['Amount', 'Total Paid', 'Status', 'Date'].some((h) =>
        cell.includes(h),
      )
        ? 'right'
        : 'left'
      tr.appendChild(td)
    })
    table.appendChild(tr)
  })
  return table
}

async function tableToImage(table: HTMLTableElement, _doc: jsPDF) {
  const wrapper = document.createElement('div')
  wrapper.style.position = 'absolute'
  wrapper.style.left = '-9999px'
  wrapper.appendChild(table)
  document.body.appendChild(wrapper)

  const canvas = await html2canvas(table, { scale: 2 })
  document.body.removeChild(wrapper)
  return canvas.toDataURL('image/png')
}
