import { useState } from 'react'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'

interface ClassFormProps {
  initial?: { id: string; name: string; contribution_target?: number }
  onSave: (name: string, contribution_target: number) => Promise<string | null>
  onCancel: () => void
}

export function ClassForm({ initial, onSave, onCancel }: ClassFormProps) {
  const [name, setName] = useState(initial?.name ?? '')
  const [target, setTarget] = useState(String(initial?.contribution_target ?? ''))
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) { setError('Name is required'); return }
    setLoading(true)
    const err = await onSave(name.trim(), target ? parseFloat(target) : 0)
    if (err) setError(err)
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        id="className"
        label="Class Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="e.g. BSIT 3A"
        error={error}
        required
      />
      <Input
        id="target"
        label="Contribution Target per Student (₱)"
        type="number"
        step="0.01"
        min="0"
        value={target}
        onChange={(e) => setTarget(e.target.value)}
        placeholder="e.g. 500.00"
      />
      <div className="flex justify-end gap-3">
        <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button type="submit" loading={loading}>{initial ? 'Update' : 'Create'}</Button>
      </div>
    </form>
  )
}
