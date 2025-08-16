import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { MdDashboard, MdRestaurant, MdRestaurantMenu, MdShoppingCart, MdPeople, MdLogout } from 'react-icons/md'
import './admin.css'

export default function AdminLayout() {
  const [user, setUser] = useState<any>(null)
  const navigate = useNavigate()
  const location = useLocation()

  // Fonction pour vérifier si le lien est actif
  const isActiveLink = (path: string) => {
    if (path === '/admin/dashboard') {
      return location.pathname === '/admin' || location.pathname === '/admin/dashboard'
    }
    return location.pathname === path
  }

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
          <Link 
            to="/admin/dashboard" 
            className={isActiveLink('/admin/dashboard') ? 'nav-link active' : 'nav-link'}
          >
            <MdDashboard /> Dashboard
          </Link>
          <Link 
            to="/admin/restaurants" 
            className={isActiveLink('/admin/restaurants') ? 'nav-link active' : 'nav-link'}
          >
            <MdRestaurant /> Restaurants
          </Link>
          <Link 
            to="/admin/menus" 
            className={isActiveLink('/admin/menus') ? 'nav-link active' : 'nav-link'}
          >
            <MdRestaurantMenu /> Plats
          </Link>
          <Link 
            to="/admin/commandes" 
            className={isActiveLink('/admin/commandes') ? 'nav-link active' : 'nav-link'}
          >
            <MdShoppingCart /> Commandes
          </Link>
          <Link 
            to="/admin/utilisateurs" 
            className={isActiveLink('/admin/utilisateurs') ? 'nav-link active' : 'nav-link'}
          >
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
