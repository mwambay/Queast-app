import { Link, Outlet } from 'react-router-dom'
import './admin.css'

export default function AdminLayout() {
  return (
    <div className="admin-shell">
      <aside className="sidebar">
        <div className="brand">Queast Admin</div>
        <nav>
          <Link to="/admin/restaurants">Restaurants</Link>
          <Link to="/admin/menus">Plats</Link>
          <Link to="/admin/commandes">Commandes</Link>
          <Link to="/admin/utilisateurs">Utilisateurs</Link>
        </nav>
      </aside>
      <main className="content">
        <Outlet />
      </main>
    </div>
  )
}
