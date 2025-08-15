import { type FormEvent, useState } from 'react'
import '../components/admin.css'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    // TODO: POST /auth/login
    setTimeout(() => setLoading(false), 600)
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', background: '#f7f9fc' }}>
      <div className="card" style={{ width: 360 }}>
        <h2 style={{ marginTop: 0, marginBottom: 12 }}>Connexion Admin</h2>
        <form onSubmit={onSubmit} style={{ display: 'grid', gap: 12 }}>
          <div>
            <label style={{ display: 'block', marginBottom: 6 }}>Email</label>
            <input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: 6 }}>Mot de passe</label>
            <input className="input" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          <button className="btn" type="submit" disabled={loading}>{loading ? 'Connexion…' : 'Se connecter'}</button>
        </form>
      </div>
    </div>
  )
}
