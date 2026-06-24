import { useState } from 'react'
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
import { Plus, Pencil, Trash2, UserPlus } from 'lucide-react'

export function ClassesPage() {
  const { user } = useAuth()
  const { classes, loading, create, update, remove } = useClasses()
  const [showForm, setShowForm] = useState(false)
  const [editClass, setEditClass] = useState<{ id: string; name: string } | null>(null)
  const [assignTo, setAssignTo] = useState<{ id: string; name: string } | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  if (user?.role !== ROLES.SUPER_ADMIN) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-slate-900">Classes</h1>
        <Card>
          <CardContent className="py-8 text-center text-slate-500">
            Your assigned class: <span className="font-medium text-slate-700">{user?.class_id ?? 'None'}</span>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Classes</h1>
        <Button onClick={() => { setEditClass(null); setShowForm(true) }}>
          <Plus size={16} /> New Class
        </Button>
      </div>

      <Card>
        {loading ? (
          <CardContent className="py-8 text-center text-slate-400">Loading...</CardContent>
        ) : classes.length === 0 ? (
          <CardContent className="py-8 text-center text-slate-500">No classes yet</CardContent>
        ) : (
          <Table>
            <THead>
              <tr>
                <Th>Name</Th>
                <Th>Created</Th>
                <Th className="text-right">Actions</Th>
              </tr>
            </THead>
            <TBody>
              {classes.map((c) => (
                <tr key={c.id}>
                  <Td className="font-medium text-slate-900">{c.name}</Td>
                  <Td>
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
                        <Trash2 size={16} className="text-red-500" />
                      </Button>
                    </div>
                  </Td>
                </tr>
              ))}
            </TBody>
          </Table>
        )}
      </Card>

      <Modal open={showForm} onClose={() => setShowForm(false)} title={editClass ? 'Edit Class' : 'New Class'}>
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

      <Modal open={!!confirmDelete} onClose={() => setConfirmDelete(null)} title="Delete Class">
        <p className="text-sm text-slate-600 mb-4">Are you sure you want to delete this class? This action cannot be undone.</p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setConfirmDelete(null)}>Cancel</Button>
          <Button variant="danger" onClick={async () => {
            if (confirmDelete) await remove(confirmDelete)
            setConfirmDelete(null)
          }}>Delete</Button>
        </div>
      </Modal>
    </div>
  )
}
