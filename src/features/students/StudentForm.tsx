import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'

interface StudentFormProps {
  initial?: { id: string; student_id: string; name: string; class_id?: string }
  onSave: (studentId: string, name: string, password?: string, classId?: string) => Promise<string | null>
  onCancel: () => void
  classId?: string | null
  classes?: { id: string; name: string }[]
}

export function StudentForm({ initial, onSave, onCancel, classId, classes }: StudentFormProps) {
  const { t } = useTranslation()
  const [studentId, setStudentId] = useState(initial?.student_id ?? '')
  const [name, setName] = useState(initial?.name ?? '')
  const [password, setPassword] = useState('')
  const [selectedClassId, setSelectedClassId] = useState(initial?.class_id ?? classId ?? '')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!studentId.trim() || !name.trim()) { setError(t('students.form.validation.required')); return }
    if (!initial && !password.trim()) { setError(t('students.form.validation.passwordRequired')); return }
    if (classes && !selectedClassId) { setError(t('students.form.validation.classRequired')); return }
    setLoading(true)
    const err = await onSave(studentId.trim(), name.trim(), initial ? undefined : password.trim(), selectedClassId || undefined)
    if (err) setError(err)
    setLoading(false)
  }

  const selectClass = 'block w-full rounded-btn border border-border-hover bg-white px-3 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-brand-600/30'

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        id="sid"
        label={t('students.form.studentId')}
        value={studentId}
        onChange={(e) => setStudentId(e.target.value)}
        placeholder={t('students.form.studentIdPlaceholder')}
        disabled={!!initial}
        error={error}
        required
      />
      <Input
        id="sname"
        label={t('students.form.name')}
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder={t('students.form.namePlaceholder')}
        required
      />
      {classes && classes.length > 0 && (
        <div>
          <label htmlFor="sclass" className="block text-sm font-medium text-secondary mb-1">{t('students.form.class')}</label>
          <select
            id="sclass"
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className={selectClass}
            required
          >
            <option value="">{t('students.selectClass')}</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      )}

      {!initial && (
        <Input
          id="spassword"
          label={t('students.form.password')}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={t('students.form.passwordPlaceholder')}
          required
        />
      )}
      <div className="flex justify-end gap-3">
        <Button type="button" variant="secondary" onClick={onCancel}>{t('students.modal.cancel')}</Button>
        <Button type="submit" loading={loading}>{initial ? t('students.modal.update') : t('students.modal.create')}</Button>
      </div>
    </form>
  )
}
