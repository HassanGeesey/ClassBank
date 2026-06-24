import { useState } from 'react'
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
  const [studentId, setStudentId] = useState(initial?.student_id ?? '')
  const [name, setName] = useState(initial?.name ?? '')
  const [password, setPassword] = useState('')
  const [selectedClassId, setSelectedClassId] = useState(initial?.class_id ?? classId ?? '')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!studentId.trim() || !name.trim()) { setError('Student ID and Name are required'); return }
    if (!initial && !password.trim()) { setError('Password is required for new students'); return }
    if (classes && !selectedClassId) { setError('Please select a class'); return }
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
        label="Student ID"
        value={studentId}
        onChange={(e) => setStudentId(e.target.value)}
        placeholder="e.g. 2024-0001"
        disabled={!!initial}
        error={error}
        required
      />
      <Input
        id="sname"
        label="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Full name"
        required
      />
      {classes && classes.length > 0 && (
        <div>
          <label htmlFor="sclass" className="block text-sm font-medium text-secondary mb-1">Class</label>
          <select
            id="sclass"
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className={selectClass}
            required
          >
            <option value="">Select a class</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      )}

      {!initial && (
        <Input
          id="spassword"
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Initial password"
          required
        />
      )}
      <div className="flex justify-end gap-3">
        <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button type="submit" loading={loading}>{initial ? 'Update' : 'Create'}</Button>
      </div>
    </form>
  )
}
