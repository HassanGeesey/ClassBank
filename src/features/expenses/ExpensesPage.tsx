import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../auth/AuthContext'
import { Card, CardContent } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Table, TBody, Td, Th, THead } from '../../components/ui/Table'
import { Modal } from '../../components/ui/Modal'
import { useExpenses, useExpenseTotal } from './useExpenses'
import { formatCurrency, formatDate } from '../../lib/utils'
import { Plus, Trash2, Receipt } from 'lucide-react'

export function ExpensesPage() {
  const { t } = useTranslation()
  const { activeClassId } = useAuth()
  const classId = activeClassId
  const { expenses, loading, create, remove } = useExpenses(classId)
  const { total } = useExpenseTotal(classId)

  const [showForm, setShowForm] = useState(false)
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!description.trim() || !amount || !date) { setError(t('expenses.validation.required')); return }
    setSubmitting(true)
    const err = await create(description.trim(), parseFloat(amount), date)
    if (err) setError(err)
    else { setShowForm(false); setDescription(''); setAmount(''); setError('') }
    setSubmitting(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-bold text-text">{t('expenses.title')}</h1>
          <p className="text-sm text-muted">{t('expenses.totalSpent')} <span className="font-semibold text-error">{formatCurrency(total)}</span></p>
        </div>
        <Button onClick={() => setShowForm(true)}><Plus size={16} /> {t('expenses.record')}</Button>
      </div>

      <Card>
        {loading ? (
          <CardContent className="py-8 text-center text-muted">{t('expenses.loading')}</CardContent>
        ) : expenses.length === 0 ? (
          <CardContent className="flex flex-col items-center gap-3 py-12 text-muted">
            <Receipt size={40} className="text-muted/50" />
            <p>{t('expenses.none')}</p>
          </CardContent>
        ) : (
          <Table>
            <THead>
              <tr>
                <Th>{t('expenses.columns.description')}</Th>
                <Th>{t('expenses.columns.amount')}</Th>
                <Th>{t('expenses.columns.date')}</Th>
                <Th className="text-right">{t('expenses.columns.action')}</Th>
              </tr>
            </THead>
            <TBody>
              {expenses.map((e) => (
                <tr key={e.id}>
                  <Td className="font-medium text-text">{e.description}</Td>
                  <Td className="font-semibold text-error tabular-nums">{formatCurrency(Number(e.amount))}</Td>
                  <Td className="text-secondary">{formatDate(e.date)}</Td>
                  <Td>
                    <div className="flex justify-end">
                      <Button variant="ghost" size="sm" onClick={() => remove(e.id)}>
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

      <Modal open={showForm} onClose={() => setShowForm(false)} title={t('expenses.modal.title')}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            id="desc"
            label={t('expenses.modal.description')}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t('expenses.modal.descriptionPlaceholder')}
            required
          />
          <Input
            id="amount"
            label={t('expenses.modal.amount')}
            type="number"
            step="0.01"
            min="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder={t('expenses.modal.amountPlaceholder')}
            required
          />
          <Input
            id="date"
            label={t('expenses.modal.date')}
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
          {error && <p className="text-sm text-error bg-error/10 rounded-btn px-3 py-2 border border-error/20">{error}</p>}
          <div className="flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>{t('expenses.modal.cancel')}</Button>
            <Button type="submit" loading={submitting}>{t('expenses.modal.save')}</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
