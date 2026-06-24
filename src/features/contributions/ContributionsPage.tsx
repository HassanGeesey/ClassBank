import { useState } from 'react'
import { useAuth } from '../auth/AuthContext'
import { useStudents } from '../students/useStudents'
import { Card, CardContent } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Table, TBody, Td, Th, THead } from '../../components/ui/Table'
import { Modal } from '../../components/ui/Modal'
import { useContributions, useContributionTotals } from './useContributions'
import { formatCurrency, formatDate } from '../../lib/utils'
import { Plus, Trash2, PiggyBank } from 'lucide-react'

export function ContributionsPage() {
  const { user } = useAuth()
  const classId = user?.class_id
  const { contributions, loading, create, remove } = useContributions(classId)
  const { total } = useContributionTotals(classId)
  const { students } = useStudents(classId)

  const [showForm, setShowForm] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState('')
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedStudent || !amount || !date) { setError('All fields required'); return }
    setSubmitting(true)
    const err = await create(selectedStudent, parseFloat(amount), date)
    if (err) setError(err)
    else { setShowForm(false); setSelectedStudent(''); setAmount(''); setError('') }
    setSubmitting(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Contributions</h1>
          <p className="text-sm text-slate-500">Total collected: <span className="font-semibold text-emerald-600">{formatCurrency(total)}</span></p>
        </div>
        <Button onClick={() => setShowForm(true)}><Plus size={16} /> Record Contribution</Button>
      </div>

      <Card>
        {loading ? (
          <CardContent className="py-8 text-center text-slate-400">Loading...</CardContent>
        ) : contributions.length === 0 ? (
          <CardContent className="flex flex-col items-center gap-3 py-12 text-slate-500">
            <PiggyBank size={40} className="text-slate-300" />
            <p>No contributions recorded yet</p>
          </CardContent>
        ) : (
          <Table>
            <THead>
              <tr>
                <Th>Student</Th>
                <Th>ID</Th>
                <Th>Amount</Th>
                <Th>Date</Th>
                <Th className="text-right">Action</Th>
              </tr>
            </THead>
            <TBody>
              {contributions.map((c) => (
                <tr key={c.id}>
                  <Td className="font-medium text-slate-900">{c.profiles?.name}</Td>
                  <Td className="font-mono text-slate-500">{c.profiles?.student_id}</Td>
                  <Td className="font-semibold text-emerald-600">{formatCurrency(Number(c.amount))}</Td>
                  <Td>{formatDate(c.date)}</Td>
                  <Td>
                    <div className="flex justify-end">
                      <Button variant="ghost" size="sm" onClick={() => remove(c.id)}>
                        <Trash2 size={16} className="text-red-500" />
                      </Button>
                    </div>
                  </Td>
                </tr>
              ))}
            </TBody>
          </Table>
        )}
      </Card>

      <Modal open={showForm} onClose={() => setShowForm(false)} title="Record Contribution">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label htmlFor="student" className="block text-sm font-medium text-slate-700">Student</label>
            <select
              id="student"
              value={selectedStudent}
              onChange={(e) => setSelectedStudent(e.target.value)}
              className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-900/20"
              required
            >
              <option value="">Select student...</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>{s.name} ({s.student_id})</option>
              ))}
            </select>
          </div>
          <Input
            id="amount"
            label="Amount"
            type="number"
            step="0.01"
            min="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            required
          />
          <Input
            id="date"
            label="Date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
          {error && <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</p>}
          <div className="flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button type="submit" loading={submitting}>Save</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
