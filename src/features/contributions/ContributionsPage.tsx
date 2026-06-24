import { useState } from 'react'
import { useTranslation } from 'react-i18next'
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
  const { t } = useTranslation()
  const { activeClassId } = useAuth()
  const classId = activeClassId
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
    if (!selectedStudent || !amount || !date) { setError(t('contributions.validation.required')); return }
    setSubmitting(true)
    const err = await create(selectedStudent, parseFloat(amount), date)
    if (err) setError(err)
    else { setShowForm(false); setSelectedStudent(''); setAmount(''); setError('') }
    setSubmitting(false)
  }

  const selectClass = 'block w-full rounded-btn border border-border-hover bg-white px-3 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-brand-600/30'

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-bold text-text">{t('contributions.title')}</h1>
          <p className="text-sm text-muted">{t('contributions.totalCollected')} <span className="font-semibold text-success">{formatCurrency(total)}</span></p>
        </div>
        <Button onClick={() => setShowForm(true)}><Plus size={16} /> {t('contributions.record')}</Button>
      </div>

      <Card>
        {loading ? (
          <CardContent className="py-8 text-center text-muted">{t('contributions.loading')}</CardContent>
        ) : contributions.length === 0 ? (
          <CardContent className="flex flex-col items-center gap-3 py-12 text-muted">
            <PiggyBank size={40} className="text-muted/50" />
            <p>{t('contributions.none')}</p>
          </CardContent>
        ) : (
          <Table>
            <THead>
              <tr>
                <Th>{t('contributions.columns.student')}</Th>
                <Th>{t('contributions.columns.id')}</Th>
                <Th>{t('contributions.columns.amount')}</Th>
                <Th>{t('contributions.columns.date')}</Th>
                <Th className="text-right">{t('contributions.columns.action')}</Th>
              </tr>
            </THead>
            <TBody>
              {contributions.map((c) => (
                <tr key={c.id}>
                  <Td className="font-medium text-text">{c.profiles?.name}</Td>
                  <Td className="font-mono text-muted">{c.profiles?.student_id}</Td>
                  <Td className="font-semibold text-success tabular-nums">{formatCurrency(Number(c.amount))}</Td>
                  <Td className="text-secondary">{formatDate(c.date)}</Td>
                  <Td>
                    <div className="flex justify-end">
                      <Button variant="ghost" size="sm" onClick={() => remove(c.id)}>
                        <Trash2 size={16} className="text-error" />
                      </Button>
                    </div>
                  </Td>
                </tr>
              ))}
            </TBody>
          </Table>
        )}
      </Card>

      <Modal open={showForm} onClose={() => setShowForm(false)} title={t('contributions.modal.title')}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label htmlFor="student" className="block text-sm font-medium text-secondary">{t('contributions.modal.student')}</label>
            <select
              id="student"
              value={selectedStudent}
              onChange={(e) => setSelectedStudent(e.target.value)}
              className={selectClass}
              required
            >
              <option value="">{t('contributions.modal.selectStudent')}</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>{s.name} ({s.student_id})</option>
              ))}
            </select>
          </div>
          <Input
            id="amount"
            label={t('contributions.modal.amount')}
            type="number"
            step="0.01"
            min="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder={t('contributions.modal.amountPlaceholder')}
            required
          />
          <Input
            id="date"
            label={t('contributions.modal.date')}
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
          {error && <p className="text-sm text-error bg-error/10 rounded-btn px-3 py-2 border border-error/20">{error}</p>}
          <div className="flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>{t('contributions.modal.cancel')}</Button>
            <Button type="submit" loading={submitting}>{t('contributions.modal.save')}</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
