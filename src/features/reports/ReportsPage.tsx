import { useState } from 'react'
import { useAuth } from '../auth/AuthContext'
import { supabase } from '../../lib/supabase'
import { Card, CardContent } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import {
  generateContributionReport,
  generateExpenseReport,
  generateStudentStatusReport,
} from './PDFGenerator'
import { useContributionTotals } from '../contributions/useContributions'
import { useExpenseTotal } from '../expenses/useExpenses'
import { useStudents } from '../students/useStudents'
import { formatCurrency } from '../../lib/utils'
import { FileText, FileDown, Receipt, Users } from 'lucide-react'

export function ReportsPage() {
  const { activeClassId } = useAuth()
  const classId = activeClassId
  const { total: contribTotal } = useContributionTotals(classId)
  const { total: expenseTotal } = useExpenseTotal(classId)
  const { allStudents } = useStudents(classId)
  const [loading, setLoading] = useState<string | null>(null)

  async function loadContributions() {
    const { data } = await supabase
      .from('contributions')
      .select('*, profiles!contributions_student_id_fkey(student_id, name)')
      .eq('class_id', classId)
      .order('date', { ascending: false })
    return data ?? []
  }

  async function loadExpenses() {
    const { data } = await supabase
      .from('expenses')
      .select('*')
      .eq('class_id', classId)
      .order('date', { ascending: false })
    return data ?? []
  }

  async function handleContributions() {
    setLoading('contributions')
    const data = await loadContributions()
    await generateContributionReport('Contributions Report', data as any, contribTotal)
    setLoading(null)
  }

  async function handleExpenses() {
    setLoading('expenses')
    const data = await loadExpenses()
    await generateExpenseReport('Expenses Report', data as any, expenseTotal)
    setLoading(null)
  }

  async function handleStudentStatus() {
    setLoading('status')
    const { data: classData } = await supabase
      .from('classes')
      .select('contribution_target')
      .eq('id', classId)
      .single()
    const target = classData?.contribution_target ?? 0

    const { data: contribData } = await supabase
      .from('contributions')
      .select('student_id, amount')
      .eq('class_id', classId)

    const studentTotals: Record<string, number> = {}
    ;(contribData ?? []).forEach((c: any) => {
      studentTotals[c.student_id] = (studentTotals[c.student_id] ?? 0) + Number(c.amount)
    })

    await generateStudentStatusReport('Student Payment Status', allStudents, studentTotals, target)
    setLoading(null)
  }

  const remaining = contribTotal - expenseTotal

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text">Reports</h1>
        <p className="text-secondary">Download PDF reports</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="py-6">
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="rounded-lg bg-success/10 p-3">
                <FileDown size={24} className="text-success" />
              </div>
              <div>
                <h3 className="font-semibold text-text">Contributions</h3>
                <p className="text-sm text-muted">{formatCurrency(contribTotal)} total</p>
              </div>
              <Button
                size="sm"
                onClick={handleContributions}
                loading={loading === 'contributions'}
              >
                <FileText size={16} /> Download
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="py-6">
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="rounded-lg bg-error/10 p-3">
                <Receipt size={24} className="text-error" />
              </div>
              <div>
                <h3 className="font-semibold text-text">Expenses</h3>
                <p className="text-sm text-muted">{formatCurrency(expenseTotal)} total</p>
              </div>
              <Button
                size="sm"
                onClick={handleExpenses}
                loading={loading === 'expenses'}
              >
                <FileText size={16} /> Download
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="py-6">
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="rounded-lg bg-info/10 p-3">
                <Users size={24} className="text-info" />
              </div>
              <div>
                <h3 className="font-semibold text-text">Student Status</h3>
                <p className="text-sm text-muted">{formatCurrency(remaining)} remaining</p>
              </div>
              <Button
                size="sm"
                onClick={handleStudentStatus}
                loading={loading === 'status'}
              >
                <FileText size={16} /> Download
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
