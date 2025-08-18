import '../components/admin.css'
import { useEffect, useState } from 'react'
import { MdRestaurant, MdRestaurantMenu, MdShoppingCart, MdPeople, MdRefresh } from 'react-icons/md'
import { Link } from 'react-router-dom'
import { getAllRestaurants } from '../api/Restaurants'
import { getAllMenuItems } from '../api/Plats'
import { getAllUsers } from '../api/Utilisateurs'
import { getAllCommandes, type CommandeDetailed, type CommandeStatus } from '../api/Commandes'
import { useIsMobile, useIsSmallMobile } from '../hooks/useMediaQuery'

interface DashboardCardProps {
  title: string
  value: string | number
  color: string
  icon: React.ReactNode
}

function DashboardCard({ title, value, color, icon }: DashboardCardProps) {
  return (
    <div className="card" style={{ 
      background: `linear-gradient(135deg, ${color}20, ${color}10)`,
      border: `1px solid ${color}30`
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ fontSize: '2em', color: color }}>
          {icon}
        </div>
        <div>
          <h3 style={{ margin: 0, color: color }}>{value}</h3>
          <p style={{ margin: 0, fontSize: '0.9em', color: '#666' }}>{title}</p>
        </div>
      </div>
    </div>
  )
}

export default function Dashboard() {
  // Etats
  const [stats, setStats] = useState({ restaurants: 0, plats: 0, commandes: 0, utilisateurs: 0 })
  const [recentCommandes, setRecentCommandes] = useState<CommandeDetailed[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Hooks responsive
  const isMobile = useIsMobile()
  const isSmallMobile = useIsSmallMobile()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [restaurants, plats, commandesResp, usersResp] = await Promise.all([
        getAllRestaurants(),
        getAllMenuItems(),
        getAllCommandes(),
        getAllUsers()
      ])

      const commandesData = Array.isArray(commandesResp) ? commandesResp : (commandesResp as any)?.data || []
      // Normaliser les montants au format number pour éviter les erreurs .toFixed sur string
      const commandesNormalized: CommandeDetailed[] = commandesData.map((c: any) => ({
        ...c,
        total_price: typeof c.total_price === 'string' ? parseFloat(c.total_price) : c.total_price
      }))
      const usersData = Array.isArray(usersResp) ? usersResp : (usersResp as any)?.data || []

      // Trier par date décroissante et prendre les 5 dernières
      const recent = [...commandesNormalized]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 5)

      setStats({
        restaurants: restaurants.length,
        plats: plats.length,
        commandes: commandesNormalized.length,
        utilisateurs: usersData.length
      })
      setRecentCommandes(recent)
    } catch (e) {
      console.error('Erreur chargement dashboard:', e)
      setError("Impossible de charger les données du dashboard")
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: CommandeStatus) => {
    switch (status) {
      case 'pending': return '#f59e0b'
      case 'preparing': return '#f59e0b'
      case 'ready': return '#3b82f6'
      case 'in_delivery': return '#3b82f6'
      case 'delivered': return '#10b981'
      case 'cancelled': return '#ef4444'
      default: return '#6b7280'
    }
  }

  const getStatusLabel = (status: CommandeStatus) => {
    switch (status) {
      case 'pending': return 'En attente'
      case 'preparing': return 'En préparation'
      case 'ready': return 'Prête'
      case 'in_delivery': return 'En livraison'
      case 'delivered': return 'Livrée'
      case 'cancelled': return 'Annulée'
      default: return status
    }
  }

  const formatAmount = (val: unknown) => {
    const n = Number(val)
    return Number.isFinite(n) ? `${n.toFixed(2)} FC` : '—'
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '48px 20px' }}>
        <div style={{ fontSize: '2em', marginBottom: 16 }}>⏳</div>
        <h3>Chargement du dashboard...</h3>
        <p style={{ color: '#666' }}>Veuillez patienter</p>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '48px 20px' }}>
        <div style={{ fontSize: '2em', marginBottom: 16, color: '#dc2626' }}>❌</div>
        <h3 style={{ color: '#dc2626' }}>Erreur de chargement</h3>
        <p style={{ color: '#666', marginBottom: 16 }}>{error}</p>
        <button className="btn" onClick={loadData}>
          Réessayer
        </button>
      </div>
    )
  }

  return (
    <div style={{ padding: '20px 0' }}>
      <h1>Dashboard Admin</h1>
      <p style={{ color: '#666', marginBottom: 32 }}>
        Aperçu de l'activité de la plateforme Queast
      </p>

      {/* Cards de statistiques */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: 16, 
        marginBottom: 32 
      }} className="grid-responsive">
        <DashboardCard title="Restaurants" value={stats.restaurants} color="#3ba0ff" icon={<MdRestaurant />} />
        <DashboardCard title="Plats disponibles" value={stats.plats} color="#3ba0ff" icon={<MdRestaurantMenu />} />
        <DashboardCard title="Commandes totales" value={stats.commandes} color="#3ba0ff" icon={<MdShoppingCart />} />
        <DashboardCard title="Utilisateurs" value={stats.utilisateurs} color="#3ba0ff" icon={<MdPeople />} />
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr', 
        gap: 24 
      }} className="grid-responsive">
        {/* Commandes récentes */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ marginTop: 0 }}>Commandes récentes</h2>
            {/* <button className="btn" onClick={loadData} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <MdRefresh /> Rafraîchir
            </button> */}
          </div>
          <div style={{ display: 'grid', gap: 12 }}>
            {recentCommandes.map((commande) => (
              <div key={commande.id} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: isSmallMobile ? 'flex-start' : 'center',
                flexDirection: isSmallMobile ? 'column' : 'row',
                padding: 12,
                background: '#f8fafc',
                borderRadius: 8,
                border: '1px solid #e2e8f0',
                gap: isSmallMobile ? 8 : 0
              }}>
                <div style={{ flex: 1 }}>
                  <strong>#{commande.id} • {commande.client_name}</strong>
                  <div style={{ fontSize: '0.9em', color: '#666' }}>{commande.restaurant_name}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 500 }}>{formatAmount(commande.total_price)}</div>
                  <span style={{
                    fontSize: '0.8em',
                    padding: '2px 8px',
                    borderRadius: 12,
                    background: getStatusColor(commande.status) + '20',
                    color: getStatusColor(commande.status)
                  }}>
                    {getStatusLabel(commande.status)}
                  </span>
                </div>
              </div>
            ))}
            {recentCommandes.length === 0 && (
              <div style={{ textAlign: 'center', color: '#666', padding: '16px 0' }}>
                Aucune commande récente.
              </div>
            )}
          </div>
          <Link className="btn" style={{ marginTop: 16, width: '100%', textAlign: 'center', display: 'block' }} to="/admin/commandes">
            Voir toutes les commandes
          </Link>
        </div>

        {/* Actions rapides */}
        <div className="card">
          <h2 style={{ marginTop: 0 }}>Actions rapides</h2>
          <div style={{ display: 'grid', gap: 12 }}>
            <Link className="btn" to="/admin/restaurants">Ajouter un restaurant</Link>
            <Link className="btn" to="/admin/menus">Nouveau plat</Link>
            <Link className="btn" to="/admin/utilisateurs">Gérer utilisateurs</Link>
            <button className="btn" onClick={loadData} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <MdRefresh /> Rafraîchir
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
