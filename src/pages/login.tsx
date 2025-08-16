import { type FormEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../components/admin.css'
import { AuthAPI, type LoginRequest } from '../api/Auth'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Appel à l'API réelle
      const credentials: LoginRequest = { email, password }
      const { data, error } = await AuthAPI.login(credentials)
      
      if (error) {
        setError(error)
        setLoading(false)
        return
      }
      
      if (data) {
        // Vérifier que l'utilisateur est admin
        if (data.user.role !== 'admin') {
          setError('Accès réservé aux administrateurs')
          setLoading(false)
          return
        }
        
        // Sauvegarder la session
        AuthAPI.saveSession(data, { email, name: 'Administrateur' })
        
        // Redirection vers le dashboard
        navigate('/admin/dashboard')
      }
    } catch (err) {
      console.error('Erreur de connexion:', err)
      setError('Erreur de connexion au serveur')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', background: '#f7f9fc' }}>
      <div className="card" style={{ width: 400 }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <h1 style={{ color: '#3ba0ff', marginBottom: 8 }}>Queast Admin</h1>
          <p style={{ color: '#666', margin: 0 }}>Connexion à l'interface d'administration</p>
        </div>

        {/* Info compte de test */}
        <div style={{
          background: '#f0f9ff',
          border: '1px solid #7dd3fc',
          color: '#0369a1',
          padding: '12px 16px',
          borderRadius: 8,
          marginBottom: 16,
          fontSize: '0.85em'
        }}>
          <strong>Compte de test :</strong><br />
          Email: admin@queast.com<br />
          Mot de passe: password
        </div>
        
        {error && (
          <div style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#dc2626',
            padding: '12px 16px',
            borderRadius: 8,
            marginBottom: 16,
            fontSize: '0.9em'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={onSubmit} style={{ display: 'grid', gap: 16 }}>
          <div>
            <label style={{ display: 'block', marginBottom: 6, fontWeight: 500 }}>Email</label>
            <input 
              className="input" 
              type="email" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              placeholder="admin@queast.com"
              required 
              style={{ width: '100%' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: 6, fontWeight: 500 }}>Mot de passe</label>
            <input 
              className="input" 
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              placeholder="password"
              required 
              style={{ width: '100%' }}
            />
          </div>
          <button className="btn" type="submit" disabled={loading} style={{ width: '100%' }}>
            {loading ? 'Connexion en cours...' : 'Se connecter'}
          </button>
        </form>
      </div>
    </div>
  )
}
