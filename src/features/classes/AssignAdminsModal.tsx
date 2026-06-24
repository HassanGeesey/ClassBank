import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { Modal } from '../../components/ui/Modal'
import { Button } from '../../components/ui/Button'
import { useClassAdmins, useAssignableAdmins } from './useClasses'
import type { Profile } from '../../lib/types'

interface AssignAdminsModalProps {
  classId: string
  className: string
  open: boolean
  onClose: () => void
}

export function AssignAdminsModal({ classId, className, open, onClose }: AssignAdminsModalProps) {
  const { admins: currentAdmins, loading: loadingCurrent } = useClassAdmins(classId)
  const excludeIds = currentAdmins.map((a) => a.id)
  const { admins: availableAdmins } = useAssignableAdmins(excludeIds)
  const [message, setMessage] = useState('')

  async function assign(admin: Profile) {
    setMessage('')
    const { error } = await supabase.from('class_admins').insert({
      class_id: classId,
      admin_id: admin.id,
    } as never)
    if (error) setMessage(error.message)
    else setMessage(`${admin.name} assigned`)
  }

  async function remove(admin: Profile) {
    setMessage('')
    const { error } = await supabase
      .from('class_admins')
      .delete()
      .eq('class_id', classId)
      .eq('admin_id', admin.id)
    if (error) setMessage(error.message)
    else setMessage(`${admin.name} removed`)
  }

  return (
    <Modal open={open} onClose={onClose} title={`Admins — ${className}`}>
      <div className="space-y-4">
        {message && (
          <p className="text-sm text-secondary bg-bg-elevated rounded-btn px-3 py-2 border border-border">{message}</p>
        )}

        <div>
          <h3 className="text-sm font-medium text-secondary mb-2">Current Admins</h3>
          {loadingCurrent ? (
            <p className="text-sm text-muted">Loading...</p>
          ) : currentAdmins.length === 0 ? (
            <p className="text-sm text-muted">No admins assigned</p>
          ) : (
            <ul className="space-y-1">
              {currentAdmins.map((admin) => (
                <li key={admin.id} className="flex items-center justify-between py-1">
                  <span className="text-sm text-text">{admin.name} ({admin.student_id})</span>
                  <Button variant="ghost" size="sm" onClick={() => remove(admin)}>Remove</Button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {availableAdmins.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-secondary mb-2">Available Admins</h3>
            <ul className="space-y-1">
              {availableAdmins.map((admin) => (
                <li key={admin.id} className="flex items-center justify-between py-1">
                  <span className="text-sm text-text">{admin.name} ({admin.student_id})</span>
                  <Button variant="secondary" size="sm" onClick={() => assign(admin)}>Assign</Button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </Modal>
  )
}
