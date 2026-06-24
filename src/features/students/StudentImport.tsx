import { useState, useRef } from 'react'
import { Button } from '../../components/ui/Button'
import { Upload, FileDown } from 'lucide-react'

interface StudentImportProps {
  onImport: (rows: string[][]) => Promise<string[]>
}

export function StudentImport({ onImport }: StudentImportProps) {
  const [errors, setErrors] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  function downloadTemplate() {
    const csv = 'student_id,name,password\n2024-0001,Juan Dela Cruz,pass123\n2024-0002,Maria Santos,pass456'
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'student_template.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setErrors([])
    setLoading(true)
    const text = await file.text()
    const lines = text.split('\n').filter(Boolean).slice(1).map((l) => l.split(',').map((c) => c.trim()))
    const result = await onImport(lines)
    setErrors(result)
    setLoading(false)
    if (fileRef.current) fileRef.current.value = ''
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Button variant="secondary" onClick={downloadTemplate}>
          <FileDown size={16} /> Template
        </Button>
        <label className="cursor-pointer">
          <input ref={fileRef} type="file" accept=".csv" onChange={handleFile} className="hidden" />
          <span className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
            <Upload size={16} /> Import CSV
          </span>
        </label>
      </div>
      {loading && <p className="text-sm text-slate-500">Importing students...</p>}
      {errors.length > 0 && (
        <div className="rounded-lg bg-red-50 p-3 max-h-40 overflow-y-auto">
          {errors.map((e, i) => (
            <p key={i} className="text-sm text-red-600">{e}</p>
          ))}
        </div>
      )}
    </div>
  )
}
