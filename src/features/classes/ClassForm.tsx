import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'

interface ClassFormProps {
  initial?: { id: string; name: string; contribution_target?: number }
  onSave: (name: string, contribution_target: number) => Promise<string | null>
  onCancel: () => void
}

export function ClassForm({ initial, onSave, onCancel }: ClassFormProps) {
  const { t } = useTranslation()
  const [name, setName] = useState(initial?.name ?? '')
  const [target, setTarget] = useState(String(initial?.contribution_target ?? ''))
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) { setError(t('classes.form.validation.nameRequired')); return }
    setLoading(true)
    const err = await onSave(name.trim(), target ? parseFloat(target) : 0)
    if (err) setError(err)
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        id="className"
        label={t('classes.form.className')}
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder={t('classes.form.classNamePlaceholder')}
        error={error}
        required
      />
      <Input
        id="target"
        label={t('classes.form.target')}
        type="number"
        step="0.01"
        min="0"
        value={target}
        onChange={(e) => setTarget(e.target.value)}
        placeholder={t('classes.form.targetPlaceholder')}
      />
      <div className="flex justify-end gap-3">
        <Button type="button" variant="secondary" onClick={onCancel}>{t('classes.form.cancel')}</Button>
        <Button type="submit" loading={loading}>{initial ? t('classes.form.update') : t('classes.form.create')}</Button>
      </div>
    </form>
  )
}
