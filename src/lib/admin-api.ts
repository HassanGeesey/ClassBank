export async function adminCreateUser(student_id: string, name: string, password: string, class_id?: string | null, role: string = 'student'): Promise<{ id?: string; error?: string }> {
  const r = await fetch('/api/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ student_id, name, password, class_id, role }),
  })
  const data = await r.json()
  if (!r.ok) return { error: data.error || 'Unknown error' }
  return { id: data.id }
}

export async function adminDeleteUser(id: string): Promise<{ error?: string }> {
  const r = await fetch(`/api/users?id=${id}`, { method: 'DELETE' })
  if (!r.ok) return { error: 'Failed to delete user' }
  return {}
}
