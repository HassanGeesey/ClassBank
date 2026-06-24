import { useState } from 'react'
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
import { Search, Plus, Pencil, Trash2 } from 'lucide-react'

export function StudentsPage() {
  const { user } = useAuth()
  const { students, loading, search, setSearch, create, update, remove, importCSV } = useStudents(user?.class_id)

  const [showForm, setShowForm] = useState(false)
  const [editStudent, setEditStudent] = useState<{ id: string; student_id: string; name: string } | null>(null)
  const [showImport, setShowImport] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Students</h1>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setShowImport(!showImport)}>
            <Plus size={16} /> Import CSV
          </Button>
          <Button onClick={() => { setEditStudent(null); setShowForm(true) }}>
            <Plus size={16} /> Add Student
          </Button>
        </div>
      </div>

      {showImport && (
        <Card>
          <CardContent>
            <StudentImport onImport={importCSV} />
          </CardContent>
        </Card>
      )}

      <Card>
        <div className="px-4 pt-4">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              id="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or ID..."
              className="pl-9"
            />
          </div>
        </div>
        {loading ? (
          <CardContent className="py-8 text-center text-slate-400">Loading...</CardContent>
        ) : students.length === 0 ? (
          <CardContent className="py-8 text-center text-slate-500">
            {search ? 'No students match your search' : 'No students yet'}
          </CardContent>
        ) : (
          <Table>
            <THead>
              <tr>
                <Th>Student ID</Th>
                <Th>Name</Th>
                <Th>Status</Th>
                <Th className="text-right">Actions</Th>
              </tr>
            </THead>
            <TBody>
              {students.map((s) => (
                <tr key={s.id}>
                  <Td className="font-mono text-sm">{s.student_id}</Td>
                  <Td className="font-medium text-slate-900">{s.name}</Td>
                  <Td><Badge variant="info">Active</Badge></Td>
                  <Td>
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => { setEditStudent(s); setShowForm(true) }}>
                        <Pencil size={16} />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setConfirmDelete(s.id)}>
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

      <Modal open={showForm} onClose={() => setShowForm(false)} title={editStudent ? 'Edit Student' : 'New Student'}>
        <StudentForm
          initial={editStudent ?? undefined}
          onSave={async (sid, name, password) =>
            editStudent
              ? update(editStudent.id, { name })
              : create(sid, name, password!)
          }
          onCancel={() => setShowForm(false)}
        />
      </Modal>

      <Modal open={!!confirmDelete} onClose={() => setConfirmDelete(null)} title="Delete Student">
        <p className="text-sm text-slate-600 mb-4">Are you sure? This will permanently delete the student and all their data.</p>
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
