import { createServer } from 'http'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const envPath = resolve(__dirname, '..', '.env')

const env = Object.fromEntries(
  readFileSync(envPath, 'utf-8')
    .split('\n')
    .filter(Boolean)
    .map((l) => {
      const i = l.indexOf('=')
      return [l.slice(0, i), l.slice(i + 1)]
    }),
)

const SUPABASE_URL = env.VITE_SUPABASE_URL
const SERVICE_ROLE_KEY = env.SUPABASE_SERVICE_ROLE_KEY
const AUTH_DOMAIN = 'classbank.local'

const AUTH_URL = `${SUPABASE_URL}/auth/v1/admin`

const port = Number(env.ADMIN_API_PORT) || 3001

function json(res, code, data) {
  res.writeHead(code, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify(data))
}

async function fetchAdmin(method, path, body) {
  const url = `${AUTH_URL}${path}`
  const opts = {
    method,
    headers: {
      Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
      apikey: SERVICE_ROLE_KEY,
      'Content-Type': 'application/json',
    },
  }
  if (body) opts.body = JSON.stringify(body)
  const r = await fetch(url, opts)
  const data = await r.json()
  return { status: r.status, data }
}

const server = createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    res.writeHead(204)
    res.end()
    return
  }

  const url = new URL(req.url, `http://localhost:${port}`)
  const path = url.pathname

  try {
    if (req.method === 'POST' && path === '/api/users') {
      let body = ''
      req.on('data', (c) => (body += c))
      req.on('end', async () => {
        const { student_id, name, password, class_id, role } = JSON.parse(body)
        const email = `${student_id}@${AUTH_DOMAIN}`
        const r = await fetchAdmin('POST', '/users', {
          email,
          password,
          email_confirm: true,
        })
        if (r.status !== 200) return json(res, 400, { error: r.data.msg || 'Failed to create user' })

        const pr = await fetch(`${SUPABASE_URL}/rest/v1/profiles`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
            apikey: SERVICE_ROLE_KEY,
            'Content-Type': 'application/json',
            Prefer: 'return=minimal',
          },
          body: JSON.stringify({
            id: r.data.id,
            student_id,
            name,
            role: role || 'student',
            class_id: class_id || null,
          }),
        })

        if (!pr.ok) {
          const pErr = await pr.json().catch(() => ({}))
          await fetchAdmin('DELETE', `/users/${r.data.id}`)
          return json(res, 400, { error: pErr.message || 'Failed to create profile' })
        }

        json(res, 201, { id: r.data.id })
      })
    } else if (req.method === 'DELETE' && path.startsWith('/api/users/')) {
      const id = path.slice(11)
      await fetchAdmin('DELETE', `/users/${id}`)
      json(res, 200, { ok: true })
    } else if (req.method === 'POST' && path === '/api/chat') {
      let body = ''
      req.on('data', (c) => (body += c))
      req.on('end', async () => {
        const { question, context } = JSON.parse(body)
        const systemPrompt = 'You are a class contribution assistant. Answer questions using the provided class data. Be concise and use USD formatting. If the data doesn\'t contain the answer, say so.'
        const userPrompt = `Class data:\n${JSON.stringify(context, null, 2)}\n\nQuestion: ${question}`

        try {
          const r = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${env.OPENROUTER_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'nvidia/nemotron-3-ultra-550b-a55b:free',
              messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt },
              ],
              max_tokens: 512,
            }),
          })
          const data = await r.json()
          const answer = data.choices?.[0]?.message?.content ?? 'No response'
          json(res, 200, { answer })
        } catch (e) {
          json(res, 500, { error: e.message })
        }
      })
    } else {
      json(res, 404, { error: 'Not found' })
    }
  } catch (e) {
    json(res, 500, { error: e.message })
  }
})

server.listen(port, () => {
  console.log(`Admin API server running on http://localhost:${port}`)
})
