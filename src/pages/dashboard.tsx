import '../components/admin.css'
import { MdRestaurant, MdRestaurantMenu, MdShoppingCart, MdPeople, MdRefresh } from 'react-icons/md'

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
  // Données simulées pour le dashboard
  const stats = {
    restaurants: 12,
    plats: 89,
    commandes: 156,
    utilisateurs: 234
  }

  const recentCommandes = [
    { id: 1, client: "Marie Dupont", restaurant: "Pizza Palace", status: "en_cours", montant: "24.50€" },
    { id: 2, client: "Jean Martin", restaurant: "Burger House", status: "livrée", montant: "18.90€" },
    { id: 3, client: "Sophie Chen", restaurant: "Sushi Time", status: "en_attente", montant: "32.00€" },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'en_attente': return '#f59e0b'
      case 'en_cours': return '#3b82f6'  
      case 'livrée': return '#10b981'
      case 'annulée': return '#ef4444'
      default: return '#6b7280'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'en_attente': return 'En attente'
      case 'en_cours': return 'En cours'
      case 'livrée': return 'Livrée'
      case 'annulée': return 'Annulée'
      default: return status
    }
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
      }}>
        <DashboardCard title="Restaurants" value={stats.restaurants} color="#3ba0ff" icon={<MdRestaurant />} />
        <DashboardCard title="Plats disponibles" value={stats.plats} color="#3ba0ff" icon={<MdRestaurantMenu />} />
        <DashboardCard title="Commandes totales" value={stats.commandes} color="#3ba0ff" icon={<MdShoppingCart />} />
        <DashboardCard title="Utilisateurs" value={stats.utilisateurs} color="#3ba0ff" icon={<MdPeople />} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
        {/* Commandes récentes */}
        <div className="card">
          <h2 style={{ marginTop: 0 }}>Commandes récentes</h2>
          <div style={{ display: 'grid', gap: 12 }}>
            {recentCommandes.map(commande => (
              <div key={commande.id} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: 12,
                background: '#f8fafc',
                borderRadius: 8,
                border: '1px solid #e2e8f0'
              }}>
                <div>
                  <strong>{commande.client}</strong>
                  <div style={{ fontSize: '0.9em', color: '#666' }}>{commande.restaurant}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 500 }}>{commande.montant}</div>
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
          </div>
          <button className="btn" style={{ marginTop: 16, width: '100%' }}>
            Voir toutes les commandes
          </button>
        </div>

        {/* Actions rapides */}
        <div className="card">
          <h2 style={{ marginTop: 0 }}>Actions rapides</h2>
          <div style={{ display: 'grid', gap: 12 }}>
            <button className="btn">Ajouter un restaurant</button>
            <button className="btn">Nouveau plat</button>
            <button className="btn">Gérer utilisateurs</button>
            <button className="btn" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <MdRefresh /> Rafraîchir
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
