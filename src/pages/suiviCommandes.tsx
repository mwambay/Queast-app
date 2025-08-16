import '../components/admin.css'
import { MdRefresh, MdAssignment, MdVisibility, MdEdit, MdQrCode, MdDeliveryDining, MdRestaurant, MdPerson, MdAccessTime, MdCheckCircle, MdCancel, MdHourglassEmpty, MdLocalShipping } from 'react-icons/md'
import { useState } from 'react'

interface Commande {
  id: number
  client_id: number
  livreur_id: number | null
  restaurant_id: number
  status: 'en_attente' | 'en_cours' | 'livrée' | 'annulée'
  qr_code: string
  created_at: string
  updated_at: string
}

interface User {
  id: number
  name: string
  email: string
  role: 'client' | 'livreur' | 'admin'
}

interface Restaurant {
  id: number
  name: string
  location: string
}

// Données de test pour les utilisateurs (clients et livreurs)
const mockUsers: User[] = [
  { id: 1, name: "Marie Diop", email: "marie.diop@email.com", role: "client" },
  { id: 2, name: "Amadou Ba", email: "amadou.ba@email.com", role: "livreur" },
  { id: 3, name: "Fatou Sall", email: "fatou.sall@email.com", role: "client" },
  { id: 4, name: "Ousmane Ndiaye", email: "ousmane.ndiaye@email.com", role: "livreur" },
  { id: 5, name: "Aïssatou Sy", email: "aissatou.sy@email.com", role: "client" },
  { id: 6, name: "Modou Fall", email: "modou.fall@email.com", role: "livreur" },
  { id: 7, name: "Ndeye Thiam", email: "ndeye.thiam@email.com", role: "client" },
  { id: 8, name: "Cheikh Diallo", email: "cheikh.diallo@email.com", role: "livreur" }
]

// Données de test pour les restaurants
const mockRestaurants: Restaurant[] = [
  { id: 1, name: "Pizza Palace", location: "123 Rue de la Pizza, Dakar" },
  { id: 2, name: "Burger House", location: "456 Avenue des Burgers, Dakar" },
  { id: 3, name: "Sushi Time", location: "789 Boulevard du Sushi, Dakar" },
  { id: 4, name: "Café Central", location: "321 Place du Café, Dakar" },
  { id: 5, name: "Taco Libre", location: "654 Rue du Mexique, Dakar" },
  { id: 6, name: "Le Gourmet", location: "987 Avenue de la Gastronomie, Dakar" }
]

// Données de test pour les commandes
const mockCommandes: Commande[] = [
  {
    id: 1,
    client_id: 1,
    livreur_id: null,
    restaurant_id: 1,
    status: 'en_attente',
    qr_code: 'QR001234567890',
    created_at: '2024-08-16T10:30:00Z',
    updated_at: '2024-08-16T10:30:00Z'
  },
  {
    id: 2,
    client_id: 3,
    livreur_id: 2,
    restaurant_id: 2,
    status: 'en_cours',
    qr_code: 'QR001234567891',
    created_at: '2024-08-16T09:15:00Z',
    updated_at: '2024-08-16T10:45:00Z'
  },
  {
    id: 3,
    client_id: 5,
    livreur_id: 4,
    restaurant_id: 3,
    status: 'livrée',
    qr_code: 'QR001234567892',
    created_at: '2024-08-16T08:00:00Z',
    updated_at: '2024-08-16T09:30:00Z'
  },
  {
    id: 4,
    client_id: 7,
    livreur_id: null,
    restaurant_id: 4,
    status: 'en_attente',
    qr_code: 'QR001234567893',
    created_at: '2024-08-16T11:00:00Z',
    updated_at: '2024-08-16T11:00:00Z'
  },
  {
    id: 5,
    client_id: 1,
    livreur_id: 6,
    restaurant_id: 5,
    status: 'en_cours',
    qr_code: 'QR001234567894',
    created_at: '2024-08-16T10:00:00Z',
    updated_at: '2024-08-16T11:15:00Z'
  },
  {
    id: 6,
    client_id: 3,
    livreur_id: null,
    restaurant_id: 6,
    status: 'annulée',
    qr_code: 'QR001234567895',
    created_at: '2024-08-15T16:30:00Z',
    updated_at: '2024-08-15T17:00:00Z'
  }
]

export default function SuiviCommandes() {
  const [commandes, setCommandes] = useState<Commande[]>(mockCommandes)
  const [users] = useState<User[]>(mockUsers)
  const [restaurants] = useState<Restaurant[]>(mockRestaurants)
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'en_attente' | 'en_cours' | 'livrée' | 'annulée'>('all')
  const [viewingCommande, setViewingCommande] = useState<Commande | null>(null)
  const [assigningCommande, setAssigningCommande] = useState<Commande | null>(null)
  const [selectedLivreur, setSelectedLivreur] = useState<string>('')

  const livreurs = users.filter(u => u.role === 'livreur')
  const clients = users.filter(u => u.role === 'client')

  const getUser = (userId: number) => users.find(u => u.id === userId)
  const getRestaurant = (restaurantId: number) => restaurants.find(r => r.id === restaurantId)

  const filteredCommandes = selectedStatus === 'all' 
    ? commandes 
    : commandes.filter(c => c.status === selectedStatus)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'en_attente': return <MdHourglassEmpty />
      case 'en_cours': return <MdLocalShipping />
      case 'livrée': return <MdCheckCircle />
      case 'annulée': return <MdCancel />
      default: return <MdHourglassEmpty />
    }
  }

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'en_attente': return { bg: '#fef3c7', color: '#92400e', border: '#f59e0b' }
      case 'en_cours': return { bg: '#dbeafe', color: '#1e40af', border: '#3b82f6' }
      case 'livrée': return { bg: '#dcfce7', color: '#166534', border: '#16a34a' }
      case 'annulée': return { bg: '#fee2e2', color: '#dc2626', border: '#ef4444' }
      default: return { bg: '#f3f4f6', color: '#374151', border: '#9ca3af' }
    }
  }

  const getStatusLabel = (status: string) => {
    switch(status) {
      case 'en_attente': return 'En attente'
      case 'en_cours': return 'En cours'
      case 'livrée': return 'Livrée'
      case 'annulée': return 'Annulée'
      default: return status
    }
  }

  const handleAssignLivreur = () => {
    if (assigningCommande && selectedLivreur) {
      const updatedCommandes = commandes.map(c =>
        c.id === assigningCommande.id
          ? { 
              ...c, 
              livreur_id: parseInt(selectedLivreur),
              status: 'en_cours' as const,
              updated_at: new Date().toISOString()
            }
          : c
      )
      setCommandes(updatedCommandes)
      setAssigningCommande(null)
      setSelectedLivreur('')
    }
  }

  const handleUpdateStatus = (commandeId: number, newStatus: 'en_attente' | 'en_cours' | 'livrée' | 'annulée') => {
    const updatedCommandes = commandes.map(c =>
      c.id === commandeId
        ? { 
            ...c, 
            status: newStatus,
            updated_at: new Date().toISOString(),
            // Si on annule, retirer le livreur
            ...(newStatus === 'annulée' && { livreur_id: null })
          }
        : c
    )
    setCommandes(updatedCommandes)
  }

  const getCommandeStats = () => {
    return {
      total: commandes.length,
      en_attente: commandes.filter(c => c.status === 'en_attente').length,
      en_cours: commandes.filter(c => c.status === 'en_cours').length,
      livree: commandes.filter(c => c.status === 'livrée').length,
      annulee: commandes.filter(c => c.status === 'annulée').length
    }
  }

  const stats = getCommandeStats()

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0 }}>Suivi des Commandes</h1>
          <p style={{ color: '#666', margin: '4px 0 0 0' }}>
            {filteredCommandes.length} commandes • {stats.en_attente} en attente • {stats.en_cours} en cours
          </p>
        </div>
        <button 
          className="btn" 
          onClick={() => window.location.reload()}
          style={{ display: 'flex', alignItems: 'center', gap: 8 }}
        >
          <MdRefresh /> Rafraîchir
        </button>
      </div>

      {/* Filtres par statut */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <label style={{ fontWeight: 500 }}>Filtrer par statut :</label>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
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
              onClick={() => setSelectedStatus('en_attente')}
              style={{
                background: selectedStatus === 'en_attente' ? '#fef3c7' : '#f3f4f6',
                color: selectedStatus === 'en_attente' ? '#92400e' : '#374151',
                border: '1px solid ' + (selectedStatus === 'en_attente' ? '#f59e0b' : '#d1d5db'),
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
              <MdHourglassEmpty /> En attente ({stats.en_attente})
            </button>
            <button
              onClick={() => setSelectedStatus('en_cours')}
              style={{
                background: selectedStatus === 'en_cours' ? '#dbeafe' : '#f3f4f6',
                color: selectedStatus === 'en_cours' ? '#1e40af' : '#374151',
                border: '1px solid ' + (selectedStatus === 'en_cours' ? '#3b82f6' : '#d1d5db'),
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
              <MdLocalShipping /> En cours ({stats.en_cours})
            </button>
            <button
              onClick={() => setSelectedStatus('livrée')}
              style={{
                background: selectedStatus === 'livrée' ? '#dcfce7' : '#f3f4f6',
                color: selectedStatus === 'livrée' ? '#166534' : '#374151',
                border: '1px solid ' + (selectedStatus === 'livrée' ? '#16a34a' : '#d1d5db'),
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
              <MdCheckCircle /> Livrées ({stats.livree})
            </button>
            <button
              onClick={() => setSelectedStatus('annulée')}
              style={{
                background: selectedStatus === 'annulée' ? '#fee2e2' : '#f3f4f6',
                color: selectedStatus === 'annulée' ? '#dc2626' : '#374151',
                border: '1px solid ' + (selectedStatus === 'annulée' ? '#ef4444' : '#d1d5db'),
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
              <MdCancel /> Annulées ({stats.annulee})
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
                  Commande #{assigningCommande.id} - {getRestaurant(assigningCommande.restaurant_id)?.name}
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
                        {getUser(viewingCommande.client_id)?.name || 'Client inconnu'}
                      </span>
                    </div>
                  </div>
                  <div>
                    <h6 style={{ margin: '0 0 4px 0', color: '#64748b', fontSize: '0.85em', textTransform: 'uppercase' }}>Restaurant</h6>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <MdRestaurant style={{ color: '#666' }} />
                      <span style={{ fontWeight: 600, color: '#1e293b' }}>
                        {getRestaurant(viewingCommande.restaurant_id)?.name || 'Restaurant inconnu'}
                      </span>
                    </div>
                  </div>
                  <div>
                    <h6 style={{ margin: '0 0 4px 0', color: '#64748b', fontSize: '0.85em', textTransform: 'uppercase' }}>Livreur</h6>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <MdDeliveryDining style={{ color: '#666' }} />
                      <span style={{ fontWeight: 600, color: '#1e293b' }}>
                        {viewingCommande.livreur_id 
                          ? getUser(viewingCommande.livreur_id)?.name || 'Livreur inconnu'
                          : 'Non assigné'
                        }
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
              {!viewingCommande.livreur_id && viewingCommande.status === 'en_attente' && (
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
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
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
                  <td style={{ padding: '16px 8px' }}>
                    <div>
                      <div style={{ fontWeight: 600, marginBottom: 4 }}>#{commande.id}</div>
                      <div style={{ fontSize: '0.85em', color: '#666', fontFamily: 'monospace' }}>
                        {commande.qr_code}
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '16px 8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <MdPerson style={{ color: '#666', fontSize: '1.1em' }} />
                      <span style={{ fontSize: '0.9em' }}>
                        {getUser(commande.client_id)?.name || 'Client inconnu'}
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: '16px 8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <MdRestaurant style={{ color: '#666', fontSize: '1.1em' }} />
                      <span style={{ fontSize: '0.9em' }}>
                        {getRestaurant(commande.restaurant_id)?.name || 'Restaurant inconnu'}
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: '16px 8px' }}>
                    {commande.livreur_id ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <MdDeliveryDining style={{ color: '#059669', fontSize: '1.1em' }} />
                        <span style={{ fontSize: '0.9em', color: '#059669' }}>
                          {getUser(commande.livreur_id)?.name || 'Livreur inconnu'}
                        </span>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <MdDeliveryDining style={{ color: '#dc2626', fontSize: '1.1em' }} />
                        <span style={{ fontSize: '0.9em', color: '#dc2626' }}>Non assigné</span>
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '16px 8px', textAlign: 'center' }}>
                    <select
                      value={commande.status}
                      onChange={(e) => handleUpdateStatus(commande.id, e.target.value as any)}
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
                      <option value="en_attente">En attente</option>
                      <option value="en_cours">En cours</option>
                      <option value="livrée">Livrée</option>
                      <option value="annulée">Annulée</option>
                    </select>
                  </td>
                  <td style={{ padding: '16px 8px', textAlign: 'center', fontSize: '0.9em', color: '#666' }}>
                    {formatDate(commande.created_at)}
                  </td>
                  <td style={{ padding: '16px 8px' }}>
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
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
                      {!commande.livreur_id && commande.status === 'en_attente' && (
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
                : `Aucune commande avec le statut "${getStatusLabel(selectedStatus)}" trouvée.`}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
