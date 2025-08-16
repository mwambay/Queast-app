import '../components/admin.css'
import { MdAdd, MdEdit, MdDelete, MdLocationOn, MdRestaurant, MdVisibility, MdPhone } from 'react-icons/md'
import { useState, useEffect } from 'react'
import { RestaurantAPI } from '../api/Restaurants'
import type { Restaurant, CreateRestaurantData, UpdateRestaurantData } from '../api/Restaurants'

export default function GererRestaurants() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingRestaurant, setEditingRestaurant] = useState<Restaurant | null>(null)
  const [viewingRestaurant, setViewingRestaurant] = useState<Restaurant | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [newRestaurant, setNewRestaurant] = useState<CreateRestaurantData>({
    name: '',
    address: '',
    phone: '',
    description: '',
    image_url: ''
  })

  // Charger les restaurants au montage du composant
  useEffect(() => {
    loadRestaurants()
  }, [])

  const loadRestaurants = async () => {
    setLoading(true)
    setError(null)
    try {
      const { data, error } = await RestaurantAPI.getAll()
      if (error) {
        setError(error)
      } else if (data) {
        setRestaurants(data)
      }
    } catch (err) {
      setError('Erreur lors du chargement des restaurants')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const handleAddRestaurant = async () => {
    if (newRestaurant.name && newRestaurant.address && newRestaurant.phone) {
      setSubmitting(true)
      try {
        const { data, error } = await RestaurantAPI.create(newRestaurant)
        if (error) {
          alert('Erreur lors de la création du restaurant: ' + error)
        } else if (data) {
          setRestaurants([...restaurants, data])
          setNewRestaurant({ name: '', address: '', phone: '', description: '', image_url: '' })
          setShowAddForm(false)
        }
      } catch (err) {
        alert('Erreur lors de la création du restaurant')
        console.error(err)
      } finally {
        setSubmitting(false)
      }
    }
  }

  const handleEditRestaurant = (restaurant: Restaurant) => {
    setEditingRestaurant(restaurant)
    setNewRestaurant({
      name: restaurant.name,
      address: restaurant.address,
      phone: restaurant.phone,
      description: restaurant.description || '',
      image_url: restaurant.image_url || ''
    })
    setShowAddForm(true)
  }

  const handleSaveEdit = async () => {
    if (editingRestaurant && newRestaurant.name && newRestaurant.address && newRestaurant.phone) {
      setSubmitting(true)
      try {
        const updateData: UpdateRestaurantData = {
          name: newRestaurant.name,
          address: newRestaurant.address,
          phone: newRestaurant.phone,
          description: newRestaurant.description,
          image_url: newRestaurant.image_url
        }

        const { data, error } = await RestaurantAPI.update(editingRestaurant.id, updateData)
        
        if (error) {
          alert('Erreur lors de la mise à jour du restaurant: ' + error)
        } else if (data) {
          setRestaurants(restaurants.map(r => r.id === editingRestaurant.id ? data : r))
          setEditingRestaurant(null)
          setNewRestaurant({ name: '', address: '', phone: '', description: '', image_url: '' })
          setShowAddForm(false)
        }
      } catch (err) {
        alert('Erreur lors de la mise à jour du restaurant')
        console.error(err)
      } finally {
        setSubmitting(false)
      }
    }
  }

  const handleDeleteRestaurant = async (id: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce restaurant ?')) {
      try {
        const { error } = await RestaurantAPI.delete(id)
        if (error) {
          alert('Erreur lors de la suppression du restaurant: ' + error)
        } else {
          setRestaurants(restaurants.filter(r => r.id !== id))
        }
      } catch (err) {
        alert('Erreur lors de la suppression du restaurant')
        console.error(err)
      }
    }
  }

  // Afficher l'état de chargement
  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '48px 20px' }}>
        <div style={{ fontSize: '2em', marginBottom: 16 }}>⏳</div>
        <h3>Chargement des restaurants...</h3>
        <p style={{ color: '#666' }}>Veuillez patienter</p>
      </div>
    )
  }

  // Afficher l'erreur si elle existe
  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '48px 20px' }}>
        <div style={{ fontSize: '2em', marginBottom: 16, color: '#dc2626' }}>❌</div>
        <h3 style={{ color: '#dc2626' }}>Erreur de chargement</h3>
        <p style={{ color: '#666', marginBottom: 16 }}>{error}</p>
        <button className="btn" onClick={loadRestaurants}>
          Réessayer
        </button>
      </div>
    )
  }



  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0 }}>Gestion des Restaurants</h1>
          <p style={{ color: '#666', margin: '4px 0 0 0' }}>
            {restaurants.length} restaurants enregistrés
          </p>
        </div>
        <button 
          className="btn" 
          onClick={() => setShowAddForm(true)}
          style={{ display: 'flex', alignItems: 'center', gap: 8 }}
        >
          <MdAdd /> Ajouter un restaurant
        </button>
      </div>

      {/* Modal pour le formulaire d'ajout/édition */}
      {showAddForm && (
        <div className="modal-overlay" onClick={(e) => {
          if (e.target === e.currentTarget) {
            setShowAddForm(false)
            setEditingRestaurant(null)
            setNewRestaurant({ name: '', address: '', phone: '', description: '', image_url: '' })
          }
        }}>
          <div className="modal-content">
            <div className="modal-header">
              <h3>
                {editingRestaurant ? 'Modifier le restaurant' : 'Nouveau restaurant'}
              </h3>
              <button 
                className="modal-close"
                onClick={() => {
                  setShowAddForm(false)
                  setEditingRestaurant(null)
                  setNewRestaurant({ name: '', address: '', phone: '', description: '', image_url: '' })
                }}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'grid', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', marginBottom: 6, fontWeight: 500 }}>
                    Nom du restaurant *
                  </label>
                  <input
                    className="input"
                    type="text"
                    value={newRestaurant.name}
                    onChange={e => setNewRestaurant({...newRestaurant, name: e.target.value})}
                    placeholder="Ex: Pizza Palace"
                    style={{ width: '100%' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: 6, fontWeight: 500 }}>
                    URL de l'image
                  </label>
                  <input
                    className="input"
                    type="url"
                    value={newRestaurant.image_url || ''}
                    onChange={e => setNewRestaurant({...newRestaurant, image_url: e.target.value})}
                    placeholder="https://..."
                    style={{ width: '100%' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: 6, fontWeight: 500 }}>
                    Description
                  </label>
                  <textarea
                    className="input"
                    value={newRestaurant.description}
                    onChange={e => setNewRestaurant({...newRestaurant, description: e.target.value})}
                    placeholder="Description du restaurant et de sa spécialité..."
                    rows={3}
                    style={{ width: '100%', resize: 'vertical' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: 6, fontWeight: 500 }}>
                    Adresse *
                  </label>
                  <input
                    className="input"
                    type="text"
                    value={newRestaurant.address}
                    onChange={e => setNewRestaurant({...newRestaurant, address: e.target.value})}
                    placeholder="123 Rue de la Pizza, Dakar"
                    style={{ width: '100%' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: 6, fontWeight: 500 }}>
                    Téléphone *
                  </label>
                  <input
                    className="input"
                    type="tel"
                    value={newRestaurant.phone}
                    onChange={e => setNewRestaurant({...newRestaurant, phone: e.target.value})}
                    placeholder="+221 77 123 45 67"
                    style={{ width: '100%' }}
                  />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="btn-secondary"
                onClick={() => {
                  setShowAddForm(false)
                  setEditingRestaurant(null)
                  setNewRestaurant({ name: '', address: '', phone: '', description: '', image_url: '' })
                }}
              >
                Annuler
              </button>
              <button 
                className="btn"
                onClick={editingRestaurant ? handleSaveEdit : handleAddRestaurant}
                disabled={!newRestaurant.name || !newRestaurant.address || !newRestaurant.phone || submitting}
              >
                {editingRestaurant ? 'Sauvegarder' : 'Ajouter'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal d'aperçu du restaurant */}
      {viewingRestaurant && (
        <div className="modal-overlay" onClick={(e) => {
          if (e.target === e.currentTarget) {
            setViewingRestaurant(null)
          }
        }}>
          <div className="modal-content">
            <div className="modal-header">
              <h3>Détails du restaurant</h3>
              <button 
                className="modal-close"
                onClick={() => setViewingRestaurant(null)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'grid', gap: 20 }}>
                {/* Image du restaurant */}
                <div style={{ textAlign: 'center' }}>
                  <img 
                    src={viewingRestaurant.image_url} 
                    alt={viewingRestaurant.name}
                    style={{ 
                      width: '100%', 
                      maxWidth: 400, 
                      height: 200, 
                      borderRadius: 12, 
                      objectFit: 'cover',
                      border: '1px solid #e5e7eb'
                    }}
                  />
                </div>
                
                {/* Informations principales */}
                <div>
                  <h4 style={{ margin: '0 0 8px 0', fontSize: '1.4em', color: '#1f2937' }}>
                    {viewingRestaurant.name}
                  </h4>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#666', marginBottom: 16 }}>
                    <MdLocationOn style={{ fontSize: '1.1em' }} />
                    <span>{viewingRestaurant.address}</span>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h5 style={{ margin: '0 0 8px 0', color: '#374151', fontSize: '1.1em' }}>Description</h5>
                  <p style={{ 
                    color: '#6b7280', 
                    lineHeight: 1.6, 
                    margin: 0,
                    padding: '12px',
                    background: '#f9fafb',
                    borderRadius: 8,
                    border: '1px solid #e5e7eb'
                  }}>
                    {viewingRestaurant.description || 'Aucune description disponible.'}
                  </p>
                </div>

                {/* Informations de création */}
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
                    <h6 style={{ margin: '0 0 4px 0', color: '#64748b', fontSize: '0.85em', textTransform: 'uppercase', letterSpacing: '0.05em' }}>ID Restaurant</h6>
                    <span style={{ fontWeight: 600, color: '#1e293b' }}>#{viewingRestaurant.id}</span>
                  </div>
                  <div>
                    <h6 style={{ margin: '0 0 4px 0', color: '#64748b', fontSize: '0.85em', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Date de création</h6>
                    <span style={{ fontWeight: 600, color: '#1e293b' }}>{formatDate(viewingRestaurant.created_at)}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="btn-secondary"
                onClick={() => setViewingRestaurant(null)}
              >
                Fermer
              </button>
              <button 
                className="btn"
                onClick={() => {
                  setViewingRestaurant(null)
                  handleEditRestaurant(viewingRestaurant)
                }}
                style={{ display: 'flex', alignItems: 'center', gap: 6 }}
              >
                <MdEdit /> Modifier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Liste des restaurants */}
      <div className="card">
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                <th style={{ textAlign: 'left', padding: '12px 8px', fontWeight: 600 }}>Restaurant</th>
                <th style={{ textAlign: 'left', padding: '12px 8px', fontWeight: 600 }}>Localisation</th>
                <th style={{ textAlign: 'center', padding: '12px 8px', fontWeight: 600 }}>Créé le</th>
                <th style={{ textAlign: 'center', padding: '12px 8px', fontWeight: 600 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {restaurants.map(restaurant => (
                <tr key={restaurant.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '16px 8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <img 
                        src={restaurant.image_url} 
                        alt={restaurant.name}
                        style={{ 
                          width: 50, 
                          height: 50, 
                          borderRadius: 8, 
                          objectFit: 'cover',
                          border: '1px solid #e5e7eb'
                        }}
                      />
                      <div>
                        <div style={{ fontWeight: 600, marginBottom: 4 }}>{restaurant.name}</div>
                        <div style={{ 
                          fontSize: '0.85em', 
                          color: '#666',
                          maxWidth: 300,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {restaurant.description}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '16px 8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <MdLocationOn style={{ color: '#666', fontSize: '1.1em' }} />
                      <span style={{ fontSize: '0.9em', color: '#666' }}>{restaurant.address}</span>
                    </div>
                  </td>
                  <td style={{ padding: '16px 8px', textAlign: 'center', fontSize: '0.9em', color: '#666' }}>
                    {formatDate(restaurant.created_at)}
                  </td>
                  <td style={{ padding: '16px 8px' }}>
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                      <button
                        onClick={() => setViewingRestaurant(restaurant)}
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
                      <button
                        onClick={() => handleEditRestaurant(restaurant)}
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
                        title="Modifier"
                      >
                        <MdEdit />
                      </button>
                      <button
                        onClick={() => handleDeleteRestaurant(restaurant.id)}
                        style={{
                          background: '#fee2e2',
                          color: '#dc2626',
                          border: '1px solid #ef4444',
                          padding: '6px',
                          borderRadius: 6,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center'
                        }}
                        title="Supprimer"
                      >
                        <MdDelete />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {restaurants.length === 0 && (
          <div style={{ 
            textAlign: 'center', 
            padding: '48px 20px', 
            color: '#666' 
          }}>
            <MdRestaurant style={{ fontSize: '3em', marginBottom: 16, opacity: 0.5 }} />
            <h3>Aucun restaurant</h3>
            <p>Commencez par ajouter votre premier restaurant.</p>
          </div>
        )}
      </div>
    </div>
  )
}