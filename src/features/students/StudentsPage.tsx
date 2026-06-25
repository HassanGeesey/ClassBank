import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../auth/AuthContext'
import { Card, CardContent } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Table, TBody, Td, Th, THead } from '../../components/ui/Table'
import { Modal } from '../../components/ui/Modal'
import { Badge } from '../../components/ui/Badge'
import { StudentForm } from './StudentForm'
import { StudentImport } from './StudentImport'
import { useStudents } from './useStudents'
import { formatCurrency } from '../../lib/utils'
import { Search, Plus, Pencil, Trash2, Wallet } from 'lucide-react'

export function StudentsPage() {
  const { t } = useTranslation()
  const { user, activeClassId } = useAuth()
  const isSuperAdmin = user?.role === 'super_admin'
  const { students, loading, search, setSearch, create, update, remove, importCSV } = useStudents(activeClassId)
  const [availableClasses, setAvailableClasses] = useState<{ id: string; name: string }[]>([])

  useEffect(() => {
    if (!isSuperAdmin) return
    supabase.from('classes').select('id, name').order('name').then(({ data }) => {
      if (data) setAvailableClasses(data)
    })
  }, [isSuperAdmin])

  const [showForm, setShowForm] = useState(false)
  const [editStudent, setEditStudent] = useState<{ id: string; student_id: string; name: string; class_id?: string } | null>(null)
  const [showImport, setShowImport] = useState(false)
  const [importClassId, setImportClassId] = useState('')
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  const [studentTotals, setStudentTotals] = useState<Record<string, number>>({})

  useEffect(() => {
    if (!activeClassId) return
    supabase.rpc('get_student_payment_status', { p_class_id: activeClassId }).then(({ data }) => {
      if (data) {
        const map: Record<string, number> = {}
        for (const row of data as { student_id: string; total: number }[]) {
          map[row.student_id] = row.total
        }
        setStudentTotals(map)
      }
    })
  }, [activeClassId])

  const selectClass = 'w-full rounded-btn border border-border-hover bg-white px-3 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-brand-600/30'

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-2xl font-bold text-text">{t('students.title')}</h1>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setShowImport(!showImport)}>
            <Plus size={16} /> {t('students.importCsv')}
          </Button>
          <Button onClick={() => { setEditStudent(null); setShowForm(true) }}>
            <Plus size={16} /> {t('students.addStudent')}
          </Button>
        </div>
      </div>

      {showImport && (
        <Card>
          <CardContent className="space-y-3">
            {isSuperAdmin && availableClasses.length > 0 && (
              <select
                value={importClassId}
                onChange={(e) => setImportClassId(e.target.value)}
                className={selectClass}
              >
                <option value="">{t('students.selectClass')}</option>
                {availableClasses.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            )}
            <StudentImport onImport={(lines) => importCSV(lines, importClassId || undefined)} />
          </CardContent>
        </Card>
      )}

      <Card>
        <div className="px-4 pt-4">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <Input
              id="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('students.searchPlaceholder')}
              className="pl-9"
            />
          </div>
        </div>
        {loading ? (
          <CardContent className="py-8 text-center text-muted">{t('students.loading')}</CardContent>
        ) : students.length === 0 ? (
          <CardContent className="py-8 text-center text-muted">
            {search ? t('students.noResults') : t('students.noStudents')}
          </CardContent>
        ) : (
          <Table>
            <THead>
              <tr>
                <Th>{t('students.columns.studentId')}</Th>
                <Th>{t('students.columns.name')}</Th>
                <Th>{t('students.columns.status')}</Th>
                <Th className="text-right">{t('students.columns.totalContributed')}</Th>
                <Th className="text-right">{t('students.columns.actions')}</Th>
              </tr>
            </THead>
            <TBody>
              {students.map((s) => (
                <tr key={s.id}>
                  <Td className="font-mono text-sm text-muted">{s.student_id}</Td>
                  <Td className="font-medium text-text">{s.name}</Td>
                  <Td><Badge variant="info">{t('students.active')}</Badge></Td>
                  <Td className="text-right font-semibold tabular-nums text-text">
                    <span className="inline-flex items-center gap-1">
                      <Wallet size={14} className="text-muted" />
                      {formatCurrency(studentTotals[s.id] ?? 0)}
                    </span>
                  </Td>
                  <Td>
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => { setEditStudent({ id: s.id, student_id: s.student_id, name: s.name, class_id: s.class_id ?? undefined }); setShowForm(true) }}>
                        <Pencil size={16} />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setConfirmDelete(s.id)}>
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

      <Modal open={showForm} onClose={() => setShowForm(false)} title={editStudent ? t('students.modal.edit') : t('students.modal.new')}>
        <StudentForm
          initial={editStudent ?? undefined}
          classId={activeClassId}
          classes={isSuperAdmin ? availableClasses : undefined}
          onSave={async (sid, name, password, cid) =>
            editStudent
              ? update(editStudent.id, { name, ...(cid ? { class_id: cid } : {}) })
              : create(sid, name, password!, cid)
          }
          onCancel={() => setShowForm(false)}
        />
      </Modal>

      <Modal open={!!confirmDelete} onClose={() => setConfirmDelete(null)} title={t('students.modal.delete')}>
        <p className="text-sm text-secondary mb-4">{t('students.modal.deleteConfirm')}</p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setConfirmDelete(null)}>{t('students.modal.cancel')}</Button>
          <Button variant="danger" onClick={async () => {
            if (confirmDelete) await remove(confirmDelete)
            setConfirmDelete(null)
          }}>{t('students.modal.delete')}</Button>
        </div>
      </Modal>
    </div>
  )
}
