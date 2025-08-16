import '../components/admin.css'
import { MdAdd, MdEdit, MdDelete, MdLocationOn, MdRestaurant, MdVisibility } from 'react-icons/md'
import { useState } from 'react'

interface Restaurant {
  id: number
  name: string
  image: string
  description: string
  location: string
  created_at: string
}

// Données de test pour les restaurants
const mockRestaurants: Restaurant[] = [
  {
    id: 1,
    name: "Pizza Palace",
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400",
    description: "Authentiques pizzas italiennes avec des ingrédients frais et une pâte faite maison.",
    location: "123 Rue de la Pizza, Dakar",
    created_at: "2024-01-15T10:30:00Z"
  },
  {
    id: 2,
    name: "Burger House",
    image: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400",
    description: "Burgers gourmets avec des viandes de qualité et des frites croustillantes.",
    location: "456 Avenue des Burgers, Dakar",
    created_at: "2024-02-20T14:15:00Z"
  },
  {
    id: 3,
    name: "Sushi Time",
    image: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400",
    description: "Sushis frais préparés par des chefs expérimentés avec du poisson de première qualité.",
    location: "789 Boulevard du Sushi, Dakar",
    created_at: "2024-03-10T16:45:00Z"
  },
  {
    id: 4,
    name: "Café Central",
    image: "https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=400",
    description: "Café cosy avec pâtisseries maison et boissons chaudes de qualité.",
    location: "321 Place du Café, Dakar",
    created_at: "2024-01-30T09:00:00Z"
  },
  {
    id: 5,
    name: "Taco Libre",
    image: "https://images.unsplash.com/photo-1565299585323-38174c4a6a1f?w=400",
    description: "Cuisine mexicaine authentique avec des tacos, burritos et nachos savoureux.",
    location: "654 Rue du Mexique, Dakar",
    created_at: "2024-03-25T12:20:00Z"
  },
  {
    id: 6,
    name: "Le Gourmet",
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400",
    description: "Restaurant gastronomique proposant une cuisine française raffinée.",
    location: "987 Avenue de la Gastronomie, Dakar",
    created_at: "2024-02-05T18:30:00Z"
  }
]

export default function GererRestaurants() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>(mockRestaurants)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingRestaurant, setEditingRestaurant] = useState<Restaurant | null>(null)
  const [viewingRestaurant, setViewingRestaurant] = useState<Restaurant | null>(null)
  const [newRestaurant, setNewRestaurant] = useState({
    name: '',
    image: '',
    description: '',
    location: ''
  })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }



  const handleAddRestaurant = () => {
    if (newRestaurant.name && newRestaurant.location) {
      const restaurant: Restaurant = {
        id: Math.max(...restaurants.map(r => r.id)) + 1,
        ...newRestaurant,
        created_at: new Date().toISOString(),
        image: newRestaurant.image || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400'
      }
      setRestaurants([...restaurants, restaurant])
      setNewRestaurant({ name: '', image: '', description: '', location: '' })
      setShowAddForm(false)
    }
  }

  const handleEditRestaurant = (restaurant: Restaurant) => {
    setEditingRestaurant(restaurant)
    setNewRestaurant({
      name: restaurant.name,
      image: restaurant.image,
      description: restaurant.description,
      location: restaurant.location
    })
    setShowAddForm(true)
  }

  const handleSaveEdit = () => {
    if (editingRestaurant && newRestaurant.name && newRestaurant.location) {
      const updatedRestaurants = restaurants.map(r => 
        r.id === editingRestaurant.id 
          ? { ...r, ...newRestaurant }
          : r
      )
      setRestaurants(updatedRestaurants)
      setEditingRestaurant(null)
      setNewRestaurant({ name: '', image: '', description: '', location: '' })
      setShowAddForm(false)
    }
  }

  const handleDeleteRestaurant = (id: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce restaurant ?')) {
      setRestaurants(restaurants.filter(r => r.id !== id))
    }
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
            setNewRestaurant({ name: '', image: '', description: '', location: '' })
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
                  setNewRestaurant({ name: '', image: '', description: '', location: '' })
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
                    value={newRestaurant.image}
                    onChange={e => setNewRestaurant({...newRestaurant, image: e.target.value})}
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
                    value={newRestaurant.location}
                    onChange={e => setNewRestaurant({...newRestaurant, location: e.target.value})}
                    placeholder="123 Rue de la Pizza, Dakar"
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
                  setNewRestaurant({ name: '', image: '', description: '', location: '' })
                }}
              >
                Annuler
              </button>
              <button 
                className="btn"
                onClick={editingRestaurant ? handleSaveEdit : handleAddRestaurant}
                disabled={!newRestaurant.name || !newRestaurant.location}
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
                    src={viewingRestaurant.image} 
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
                    <span>{viewingRestaurant.location}</span>
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
                        src={restaurant.image} 
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
                      <span style={{ fontSize: '0.9em', color: '#666' }}>{restaurant.location}</span>
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