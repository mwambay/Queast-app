import '../components/admin.css'
import { MdRefresh, MdAssignment, MdVisibility, MdEdit, MdQrCode, MdDeliveryDining, MdRestaurant, MdPerson, MdAccessTime, MdCheckCircle, MdCancel, MdHourglassEmpty, MdLocalShipping } from 'react-icons/md'
import { useState, useEffect } from 'react'
import { getAllCommandes, updateCommandeStatus, type CommandeDetailed, type CommandeStatus } from '../api/Commandes'
import { getAllUsers } from '../api/Utilisateurs'
import { useIsMobile } from '../hooks/useMediaQuery'

// Types de statut mappés pour l'interface utilisateur  
type UIStatus = 'pending' | 'preparing' | 'ready' | 'in_delivery' | 'delivered' | 'cancelled'

interface User {
  id: number
  name: string
  email: string
  role: 'client' | 'livreur' | 'admin'
  phone: string
}

// Fonction de mappage des statuts API vers UI
const mapStatusToUI = (status: CommandeStatus): UIStatus => {
  return status as UIStatus // Les statuts sont identiques maintenant
}

const mapUIToApiStatus = (status: UIStatus): CommandeStatus => {
  return status as CommandeStatus // Les statuts sont identiques maintenant
}

export default function SuiviCommandes() {
  const [commandes, setCommandes] = useState<CommandeDetailed[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedStatus, setSelectedStatus] = useState<'all' | UIStatus>('all')
  const [viewingCommande, setViewingCommande] = useState<CommandeDetailed | null>(null)
  const [assigningCommande, setAssigningCommande] = useState<CommandeDetailed | null>(null)
  const [selectedLivreur, setSelectedLivreur] = useState<string>('')
  
  // Hook responsive
  const isMobile = useIsMobile()

  // Charger les données au montage du composant
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [commandesResponse, usersResponse] = await Promise.all([
        getAllCommandes(),
        getAllUsers()
      ])
      
      // L'API retourne un objet avec data, success, total - on extrait le tableau data
      const commandesData = Array.isArray(commandesResponse) 
        ? commandesResponse 
        : (commandesResponse as any)?.data || []
      
      const usersData = Array.isArray(usersResponse) 
        ? usersResponse 
        : (usersResponse as any)?.data || []
      
      setCommandes(commandesData)
      setUsers(usersData)
      
      console.log('Commandes chargées:', commandesData)
      console.log('Utilisateurs chargés:', usersData)
    } catch (err) {
      setError('Erreur lors du chargement des données')
      console.error('Erreur:', err)
    } finally {
      setLoading(false)
    }
  }

  const livreurs = Array.isArray(users) ? users.filter(u => u.role === 'livreur') : []

  const filteredCommandes = selectedStatus === 'all' 
    ? (Array.isArray(commandes) ? commandes : [])
    : (Array.isArray(commandes) ? commandes.filter(c => mapStatusToUI(c.status) === selectedStatus) : [])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusIcon = (status: CommandeStatus) => {
    switch(status) {
      case 'pending': return <MdHourglassEmpty />
      case 'preparing': return <MdRestaurant />
      case 'ready': return <MdCheckCircle />
      case 'in_delivery': return <MdLocalShipping />
      case 'delivered': return <MdCheckCircle />
      case 'cancelled': return <MdCancel />
      default: return <MdHourglassEmpty />
    }
  }

  const getStatusColor = (status: CommandeStatus) => {
    switch(status) {
      case 'pending': return { bg: '#fef3c7', color: '#92400e', border: '#f59e0b' }
      case 'preparing': return { bg: '#fef3c7', color: '#92400e', border: '#f59e0b' }
      case 'ready': return { bg: '#dbeafe', color: '#1e40af', border: '#3b82f6' }
      case 'in_delivery': return { bg: '#dbeafe', color: '#1e40af', border: '#3b82f6' }
      case 'delivered': return { bg: '#dcfce7', color: '#166534', border: '#16a34a' }
      case 'cancelled': return { bg: '#fee2e2', color: '#dc2626', border: '#ef4444' }
      default: return { bg: '#f3f4f6', color: '#374151', border: '#9ca3af' }
    }
  }

  const getStatusLabel = (status: CommandeStatus) => {
    switch(status) {
      case 'pending': return 'En attente'
      case 'preparing': return 'En préparation'
      case 'ready': return 'Prête'
      case 'in_delivery': return 'En livraison'
      case 'delivered': return 'Livrée'
      case 'cancelled': return 'Annulée'
      default: return status
    }
  }

  const handleAssignLivreur = async () => {
    if (assigningCommande && selectedLivreur) {
      try {
        await updateCommandeStatus(assigningCommande.id, 'in_delivery', undefined, parseInt(selectedLivreur))
        await loadData() // Recharger les données
        setAssigningCommande(null)
        setSelectedLivreur('')
      } catch (err) {
        alert('Erreur lors de l\'assignation du livreur')
        console.error(err)
      }
    }
  }

  const handleUpdateStatus = async (commandeId: number, newStatus: CommandeStatus) => {
    try {
      await updateCommandeStatus(commandeId, newStatus)
      await loadData() // Recharger les données
    } catch (err) {
      alert('Erreur lors de la mise à jour du statut')
      console.error(err)
    }
  }

  const getCommandeStats = () => {
    // Vérifier que commandes est bien un tableau
    if (!Array.isArray(commandes)) {
      return {
        total: 0,
        pending: 0,
        preparing: 0,
        ready: 0,
        in_delivery: 0,
        delivered: 0,
        cancelled: 0
      }
    }
    
    return {
      total: commandes.length,
      pending: commandes.filter(c => c.status === 'pending').length,
      preparing: commandes.filter(c => c.status === 'preparing').length,
      ready: commandes.filter(c => c.status === 'ready').length,
      in_delivery: commandes.filter(c => c.status === 'in_delivery').length,
      delivered: commandes.filter(c => c.status === 'delivered').length,
      cancelled: commandes.filter(c => c.status === 'cancelled').length
    }
  }

  const stats = getCommandeStats()

  // Affichage du loader
  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '48px 20px' }}>
        <div style={{ fontSize: '2em', marginBottom: 16 }}>⏳</div>
        <h3>Chargement des commandes...</h3>
        <p style={{ color: '#666' }}>Veuillez patienter</p>
      </div>
    )
  }

  // Affichage d'erreur
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
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0 }}>Suivi des Commandes</h1>
          <p style={{ color: '#666', margin: '4px 0 0 0' }}>
            {filteredCommandes.length} commandes • {stats.pending} en attente • {stats.in_delivery} en livraison
          </p>
        </div>
        <button 
          className="btn" 
          onClick={loadData}
          style={{ display: 'flex', alignItems: 'center', gap: 8 }}
        >
          <MdRefresh /> Rafraîchir
        </button>
      </div>

      {/* Filtres par statut */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <label style={{ fontWeight: 500 }}>Filtrer par statut :</label>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }} className={isMobile ? 'filter-buttons' : ''}>
            <button
              onClick={() => setSelectedStatus('all')}
              style={{
                background: selectedStatus === 'all' ? '#3ba0ff' : '#f3f4f6',
                color: selectedStatus === 'all' ? 'white' : '#374151',
                border: '1px solid ' + (selectedStatus === 'all' ? '#2f8fe8' : '#d1d5db'),
                padding: '6px 12px',
                borderRadius: 16,
                fontSize: '0.85em',
                fontWeight: 500,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 4
              }}
            >
              Toutes ({stats.total})
            </button>
            <button
              onClick={() => setSelectedStatus('pending')}
              style={{
                background: selectedStatus === 'pending' ? '#fef3c7' : '#f3f4f6',
                color: selectedStatus === 'pending' ? '#92400e' : '#374151',
                border: '1px solid ' + (selectedStatus === 'pending' ? '#f59e0b' : '#d1d5db'),
                padding: '6px 12px',
                borderRadius: 16,
                fontSize: '0.85em',
                fontWeight: 500,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 4
              }}
            >
              <MdHourglassEmpty /> En attente ({stats.pending})
            </button>
            <button
              onClick={() => setSelectedStatus('preparing')}
              style={{
                background: selectedStatus === 'preparing' ? '#fef3c7' : '#f3f4f6',
                color: selectedStatus === 'preparing' ? '#92400e' : '#374151',
                border: '1px solid ' + (selectedStatus === 'preparing' ? '#f59e0b' : '#d1d5db'),
                padding: '6px 12px',
                borderRadius: 16,
                fontSize: '0.85em',
                fontWeight: 500,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 4
              }}
            >
              <MdRestaurant /> En préparation ({stats.preparing})
            </button>
            <button
              onClick={() => setSelectedStatus('ready')}
              style={{
                background: selectedStatus === 'ready' ? '#dbeafe' : '#f3f4f6',
                color: selectedStatus === 'ready' ? '#1e40af' : '#374151',
                border: '1px solid ' + (selectedStatus === 'ready' ? '#3b82f6' : '#d1d5db'),
                padding: '6px 12px',
                borderRadius: 16,
                fontSize: '0.85em',
                fontWeight: 500,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 4
              }}
            >
              <MdCheckCircle /> Prête ({stats.ready})
            </button>
            <button
              onClick={() => setSelectedStatus('in_delivery')}
              style={{
                background: selectedStatus === 'in_delivery' ? '#dbeafe' : '#f3f4f6',
                color: selectedStatus === 'in_delivery' ? '#1e40af' : '#374151',
                border: '1px solid ' + (selectedStatus === 'in_delivery' ? '#3b82f6' : '#d1d5db'),
                padding: '6px 12px',
                borderRadius: 16,
                fontSize: '0.85em',
                fontWeight: 500,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 4
              }}
            >
              <MdLocalShipping /> En livraison ({stats.in_delivery})
            </button>
            <button
              onClick={() => setSelectedStatus('delivered')}
              style={{
                background: selectedStatus === 'delivered' ? '#dcfce7' : '#f3f4f6',
                color: selectedStatus === 'delivered' ? '#166534' : '#374151',
                border: '1px solid ' + (selectedStatus === 'delivered' ? '#16a34a' : '#d1d5db'),
                padding: '6px 12px',
                borderRadius: 16,
                fontSize: '0.85em',
                fontWeight: 500,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 4
              }}
            >
              <MdCheckCircle /> Livrées ({stats.delivered})
            </button>
            <button
              onClick={() => setSelectedStatus('cancelled')}
              style={{
                background: selectedStatus === 'cancelled' ? '#fee2e2' : '#f3f4f6',
                color: selectedStatus === 'cancelled' ? '#dc2626' : '#374151',
                border: '1px solid ' + (selectedStatus === 'cancelled' ? '#ef4444' : '#d1d5db'),
                padding: '6px 12px',
                borderRadius: 16,
                fontSize: '0.85em',
                fontWeight: 500,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 4
              }}
            >
              <MdCancel /> Annulées ({stats.cancelled})
            </button>
          </div>
        </div>
      </div>

      {/* Modal d'assignation de livreur */}
      {assigningCommande && (
        <div className="modal-overlay" onClick={(e) => {
          if (e.target === e.currentTarget) {
            setAssigningCommande(null)
            setSelectedLivreur('')
          }
        }}>
          <div className="modal-content">
            <div className="modal-header">
              <h3>Assigner un livreur</h3>
              <button 
                className="modal-close"
                onClick={() => {
                  setAssigningCommande(null)
                  setSelectedLivreur('')
                }}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div style={{ marginBottom: 16 }}>
                <p style={{ color: '#666', margin: '0 0 16px 0' }}>
                  Commande #{assigningCommande.id} - {assigningCommande.restaurant_name}
                </p>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>
                  Sélectionner un livreur :
                </label>
                <select
                  className="input"
                  value={selectedLivreur}
                  onChange={e => setSelectedLivreur(e.target.value)}
                  style={{ width: '100%' }}
                >
                  <option value="">-- Choisir un livreur --</option>
                  {livreurs.map(livreur => (
                    <option key={livreur.id} value={livreur.id}>
                      {livreur.name} ({livreur.email})
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="btn-secondary"
                onClick={() => {
                  setAssigningCommande(null)
                  setSelectedLivreur('')
                }}
              >
                Annuler
              </button>
              <button 
                className="btn"
                onClick={handleAssignLivreur}
                disabled={!selectedLivreur}
              >
                Assigner
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal d'aperçu de la commande */}
      {viewingCommande && (
        <div className="modal-overlay" onClick={(e) => {
          if (e.target === e.currentTarget) {
            setViewingCommande(null)
          }
        }}>
          <div className="modal-content">
            <div className="modal-header">
              <h3>Détails de la commande #{viewingCommande.id}</h3>
              <button 
                className="modal-close"
                onClick={() => setViewingCommande(null)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'grid', gap: 20 }}>
                {/* Statut actuel */}
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    ...getStatusColor(viewingCommande.status),
                    background: getStatusColor(viewingCommande.status).bg,
                    color: getStatusColor(viewingCommande.status).color,
                    border: `1px solid ${getStatusColor(viewingCommande.status).border}`,
                    padding: '12px 20px',
                    borderRadius: 20,
                    fontSize: '1.1em',
                    fontWeight: 600,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8
                  }}>
                    {getStatusIcon(viewingCommande.status)}
                    {getStatusLabel(viewingCommande.status)}
                  </div>
                </div>

                {/* Informations principales */}
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                  gap: 16,
                  padding: '16px',
                  background: '#f8fafc',
                  borderRadius: 8,
                  border: '1px solid #e2e8f0'
                }}>
                  <div>
                    <h6 style={{ margin: '0 0 4px 0', color: '#64748b', fontSize: '0.85em', textTransform: 'uppercase' }}>Client</h6>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <MdPerson style={{ color: '#666' }} />
                      <span style={{ fontWeight: 600, color: '#1e293b' }}>
                        {viewingCommande.client_name}
                      </span>
                    </div>
                  </div>
                  <div>
                    <h6 style={{ margin: '0 0 4px 0', color: '#64748b', fontSize: '0.85em', textTransform: 'uppercase' }}>Restaurant</h6>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <MdRestaurant style={{ color: '#666' }} />
                      <span style={{ fontWeight: 600, color: '#1e293b' }}>
                        {viewingCommande.restaurant_name}
                      </span>
                    </div>
                  </div>
                  <div>
                    <h6 style={{ margin: '0 0 4px 0', color: '#64748b', fontSize: '0.85em', textTransform: 'uppercase' }}>Livreur</h6>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <MdDeliveryDining style={{ color: '#666' }} />
                      <span style={{ fontWeight: 600, color: '#1e293b' }}>
                        {viewingCommande.delivery_person_name || 'Non assigné'}
                      </span>
                    </div>
                  </div>
                  <div>
                    <h6 style={{ margin: '0 0 4px 0', color: '#64748b', fontSize: '0.85em', textTransform: 'uppercase' }}>Code QR</h6>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <MdQrCode style={{ color: '#666' }} />
                      <span style={{ fontWeight: 600, color: '#1e293b', fontFamily: 'monospace' }}>
                        {viewingCommande.qr_code}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Dates */}
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                  gap: 16,
                  padding: '16px',
                  background: '#f1f5f9',
                  borderRadius: 8,
                  border: '1px solid #cbd5e1'
                }}>
                  <div>
                    <h6 style={{ margin: '0 0 4px 0', color: '#64748b', fontSize: '0.85em', textTransform: 'uppercase' }}>Créée le</h6>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <MdAccessTime style={{ color: '#666' }} />
                      <span style={{ fontWeight: 600, color: '#1e293b' }}>
                        {formatDate(viewingCommande.created_at)}
                      </span>
                    </div>
                  </div>
                  <div>
                    <h6 style={{ margin: '0 0 4px 0', color: '#64748b', fontSize: '0.85em', textTransform: 'uppercase' }}>Dernière MAJ</h6>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <MdAccessTime style={{ color: '#666' }} />
                      <span style={{ fontWeight: 600, color: '#1e293b' }}>
                        {formatDate(viewingCommande.updated_at)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="btn-secondary"
                onClick={() => setViewingCommande(null)}
              >
                Fermer
              </button>
              {!viewingCommande.delivery_person_id && viewingCommande.status === 'pending' && (
                <button 
                  className="btn"
                  onClick={() => {
                    setViewingCommande(null)
                    setAssigningCommande(viewingCommande)
                  }}
                  style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                >
                  <MdAssignment /> Assigner livreur
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Liste des commandes */}
      <div className="card">
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }} className={isMobile ? 'table-mobile-cards' : ''}>
            <thead style={{ display: isMobile ? 'none' : 'table-header-group' }}>
              <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                <th style={{ textAlign: 'left', padding: '12px 8px', fontWeight: 600 }}>Commande</th>
                <th style={{ textAlign: 'left', padding: '12px 8px', fontWeight: 600 }}>Client</th>
                <th style={{ textAlign: 'left', padding: '12px 8px', fontWeight: 600 }}>Restaurant</th>
                <th style={{ textAlign: 'left', padding: '12px 8px', fontWeight: 600 }}>Livreur</th>
                <th style={{ textAlign: 'center', padding: '12px 8px', fontWeight: 600 }}>Statut</th>
                <th style={{ textAlign: 'center', padding: '12px 8px', fontWeight: 600 }}>Créée le</th>
                <th style={{ textAlign: 'center', padding: '12px 8px', fontWeight: 600 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCommandes.map(commande => (
                <tr key={commande.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '16px 8px' }} data-label="Commande">
                    <div>
                      <div style={{ fontWeight: 600, marginBottom: 4 }}>#{commande.id}</div>
                      <div style={{ fontSize: '0.85em', color: '#666', fontFamily: 'monospace' }}>
                        {commande.qr_code}
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '16px 8px' }} data-label="Client">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <MdPerson style={{ color: '#666', fontSize: '1.1em' }} />
                      <span style={{ fontSize: '0.9em' }}>
                        {commande.client_name}
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: '16px 8px' }} data-label="Restaurant">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <MdRestaurant style={{ color: '#666', fontSize: '1.1em' }} />
                      <span style={{ fontSize: '0.9em' }}>
                        {commande.restaurant_name}
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: '16px 8px' }} data-label="Livreur">
                    {commande.delivery_person_name ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <MdDeliveryDining style={{ color: '#059669', fontSize: '1.1em' }} />
                        <span style={{ fontSize: '0.9em', color: '#059669' }}>
                          {commande.delivery_person_name}
                        </span>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <MdDeliveryDining style={{ color: '#dc2626', fontSize: '1.1em' }} />
                        <span style={{ fontSize: '0.9em', color: '#dc2626' }}>Non assigné</span>
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '16px 8px', textAlign: 'center' }} data-label="Statut">
                    <select
                      value={commande.status}
                      onChange={(e) => handleUpdateStatus(commande.id, e.target.value as CommandeStatus)}
                      style={{
                        ...getStatusColor(commande.status),
                        background: getStatusColor(commande.status).bg,
                        color: getStatusColor(commande.status).color,
                        border: `1px solid ${getStatusColor(commande.status).border}`,
                        padding: '4px 8px',
                        borderRadius: 16,
                        fontSize: '0.8em',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      <option value="pending">En attente</option>
                      <option value="preparing">En préparation</option>
                      <option value="ready">Prête</option>
                      <option value="in_delivery">En livraison</option>
                      <option value="delivered">Livrée</option>
                      <option value="cancelled">Annulée</option>
                    </select>
                  </td>
                  <td style={{ padding: '16px 8px', textAlign: 'center', fontSize: '0.9em', color: '#666' }} data-label="Créée le">
                    {formatDate(commande.created_at)}
                  </td>
                  <td style={{ padding: '16px 8px' }} data-label="Actions">
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }} className={isMobile ? 'actions-mobile' : ''}>
                      <button
                        onClick={() => setViewingCommande(commande)}
                        style={{
                          background: '#e0f2fe',
                          color: '#0369a1',
                          border: '1px solid #0ea5e9',
                          padding: '6px',
                          borderRadius: 6,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center'
                        }}
                        title="Voir les détails"
                      >
                        <MdVisibility />
                      </button>
                      {!commande.delivery_person_id && commande.status === 'pending' && (
                        <button
                          onClick={() => setAssigningCommande(commande)}
                          style={{
                            background: '#fef3c7',
                            color: '#92400e',
                            border: '1px solid #f59e0b',
                            padding: '6px',
                            borderRadius: 6,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center'
                          }}
                          title="Assigner un livreur"
                        >
                          <MdAssignment />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredCommandes.length === 0 && (
          <div style={{ 
            textAlign: 'center', 
            padding: '48px 20px', 
            color: '#666' 
          }}>
            <MdLocalShipping style={{ fontSize: '3em', marginBottom: 16, opacity: 0.5 }} />
            <h3>Aucune commande trouvée</h3>
            <p>
              {selectedStatus === 'all' 
                ? 'Aucune commande disponible pour le moment.' 
                : `Aucune commande avec le statut trouvée.`}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
