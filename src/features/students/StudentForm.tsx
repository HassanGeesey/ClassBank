import { useState } from 'react'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'

interface StudentFormProps {
  initial?: { id: string; student_id: string; name: string }
  onSave: (studentId: string, name: string, password?: string) => Promise<string | null>
  onCancel: () => void
}

export function StudentForm({ initial, onSave, onCancel }: StudentFormProps) {
  const [studentId, setStudentId] = useState(initial?.student_id ?? '')
  const [name, setName] = useState(initial?.name ?? '')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!studentId.trim() || !name.trim()) { setError('Student ID and Name are required'); return }
    if (!initial && !password.trim()) { setError('Password is required for new students'); return }
    setLoading(true)
    const err = await onSave(studentId.trim(), name.trim(), initial ? undefined : password.trim())
    if (err) setError(err)
    setLoading(false)
  }

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
