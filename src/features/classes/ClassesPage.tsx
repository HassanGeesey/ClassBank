import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../auth/AuthContext'
import { Card, CardContent } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Table, TBody, Td, Th, THead } from '../../components/ui/Table'
import { Modal } from '../../components/ui/Modal'
import { Badge } from '../../components/ui/Badge'
import { ClassForm } from './ClassForm'
import { AssignAdminsModal } from './AssignAdminsModal'
import { useClasses } from './useClasses'
import { ROLES } from '../../lib/constants'
import { Plus, Pencil, Trash2, UserPlus, School } from 'lucide-react'

export function ClassesPage() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const { classes, loading, create, update, remove } = useClasses()
  const [showForm, setShowForm] = useState(false)
  const [editClass, setEditClass] = useState<{ id: string; name: string } | null>(null)
  const [assignTo, setAssignTo] = useState<{ id: string; name: string } | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  if (user?.role !== ROLES.SUPER_ADMIN) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-text">{t('classes.admin.title')}</h1>
        {loading ? (
          <Card><CardContent className="py-8 text-center text-muted">{t('classes.admin.loading')}</CardContent></Card>
        ) : classes.length === 0 ? (
          <Card>
            <CardContent className="py-12 flex flex-col items-center gap-3 text-muted">
              <School size={40} className="text-muted/50" />
              <p>{t('classes.admin.none')}</p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <Table>
              <THead>
                <tr>
                  <Th>{t('classes.admin.columns.className')}</Th>
                  <Th>{t('classes.admin.columns.target')}</Th>
                  <Th>{t('classes.admin.columns.created')}</Th>
                </tr>
              </THead>
              <TBody>
                {classes.map((c) => (
                  <tr key={c.id}>
                    <Td className="font-medium text-text">{c.name}</Td>
                    <Td className="text-secondary">{c.contribution_target}</Td>
                    <Td className="text-secondary"><Badge variant="default">{new Date(c.created_at).toLocaleDateString()}</Badge></Td>
                  </tr>
                ))}
              </TBody>
            </Table>
          </Card>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-2xl font-bold text-text">{t('classes.superAdmin.title')}</h1>
        <Button onClick={() => { setEditClass(null); setShowForm(true) }}>
          <Plus size={16} /> {t('classes.superAdmin.new')}
        </Button>
      </div>

      <Card>
        {loading ? (
          <CardContent className="py-8 text-center text-muted">{t('classes.superAdmin.loading')}</CardContent>
        ) : classes.length === 0 ? (
          <CardContent className="py-8 text-center text-muted">{t('classes.superAdmin.none')}</CardContent>
        ) : (
          <Table>
            <THead>
              <tr>
                <Th>{t('classes.superAdmin.columns.name')}</Th>
                <Th>{t('classes.superAdmin.columns.created')}</Th>
                <Th className="text-right">{t('classes.superAdmin.columns.actions')}</Th>
              </tr>
            </THead>
            <TBody>
              {classes.map((c) => (
                <tr key={c.id}>
                  <Td className="font-medium text-text">{c.name}</Td>
                  <Td className="text-secondary">
                    <Badge variant="default">{new Date(c.created_at).toLocaleDateString()}</Badge>
                  </Td>
                  <Td>
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => setAssignTo({ id: c.id, name: c.name })}>
                        <UserPlus size={16} />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => { setEditClass(c); setShowForm(true) }}>
                        <Pencil size={16} />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setConfirmDelete(c.id)}>
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

      <Modal open={showForm} onClose={() => setShowForm(false)} title={editClass ? t('classes.modal.edit') : t('classes.modal.new')}>
          <ClassForm
            initial={editClass ?? undefined}
            onSave={async (name, target) => editClass ? update(editClass.id, name, target) : create(name, target)}
            onCancel={() => setShowForm(false)}
          />
      </Modal>

      {assignTo && (
        <AssignAdminsModal
          classId={assignTo.id}
          className={assignTo.name}
          open={!!assignTo}
          onClose={() => setAssignTo(null)}
        />
      )}

      <Modal open={!!confirmDelete} onClose={() => setConfirmDelete(null)} title={t('classes.modal.delete')}>
        <p className="text-sm text-secondary mb-4">{t('classes.modal.deleteConfirm')}</p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setConfirmDelete(null)}>{t('classes.modal.cancel')}</Button>
          <Button variant="danger" onClick={async () => {
            if (confirmDelete) await remove(confirmDelete)
            setConfirmDelete(null)
          }}>{t('classes.modal.delete')}</Button>
        </div>
      </Modal>
    </div>
  )
}
