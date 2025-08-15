import { Link, Outlet, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { MdDashboard, MdRestaurant, MdRestaurantMenu, MdShoppingCart, MdPeople, MdLogout } from 'react-icons/md'
import './admin.css'

export default function AdminLayout() {
  const [user, setUser] = useState<any>(null)
  const navigate = useNavigate()

  useEffect(() => {
    // Vérification de l'authentification
    const token = localStorage.getItem('queast_admin_token')
    const userData = localStorage.getItem('queast_admin_user')
    
    if (!token || !userData) {
      navigate('/')
      return
    }
    
    try {
      setUser(JSON.parse(userData))
    } catch {
      navigate('/')
    }
  }, [navigate])

  const handleLogout = () => {
    localStorage.removeItem('queast_admin_token')
    localStorage.removeItem('queast_admin_user')
    navigate('/')
  }

  if (!user) {
    return <div>Chargement...</div>
  }

  return (
    <div className="admin-shell">
      <aside className="sidebar">
        <div className="brand">Queast Admin</div>
        <nav>
          <Link to="/admin/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <MdDashboard /> Dashboard
          </Link>
          <Link to="/admin/restaurants" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <MdRestaurant /> Restaurants
          </Link>
          <Link to="/admin/menus" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <MdRestaurantMenu /> Plats
          </Link>
          <Link to="/admin/commandes" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <MdShoppingCart /> Commandes
          </Link>
          <Link to="/admin/utilisateurs" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <MdPeople /> Utilisateurs
          </Link>
        </nav>
        
        <div style={{ marginTop: 'auto', paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.2)' }}>
          <div style={{ fontSize: '0.9em', marginBottom: 12, opacity: 0.8 }}>
            Connecté en tant que<br />
            <strong>{user.name}</strong>
          </div>
          <button 
            onClick={handleLogout}
            style={{
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.3)',
              color: 'white',
              padding: '8px 12px',
              borderRadius: 6,
              cursor: 'pointer',
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              justifyContent: 'center'
            }}
          >
            <MdLogout /> Déconnexion
          </button>
        </div>
      </aside>
      <main className="content">
        <Outlet />
      </main>
    </div>
  )
}
