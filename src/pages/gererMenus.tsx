import '../components/admin.css'
import { MdAdd, MdEdit, MdDelete, MdVisibility, MdRestaurant, MdAttachMoney, MdCheckCircle, MdCancel } from 'react-icons/md'
import { useState } from 'react'

interface Plat {
  id: number
  restaurant_id: number
  name: string
  description: string
  price: number
  image_url: string
  available: boolean
}

interface Restaurant {
  id: number
  name: string
}

// Données de test pour les restaurants
const mockRestaurants: Restaurant[] = [
  { id: 1, name: "Pizza Palace" },
  { id: 2, name: "Burger House" },
  { id: 3, name: "Sushi Time" },
  { id: 4, name: "Café Central" },
  { id: 5, name: "Taco Libre" },
  { id: 6, name: "Le Gourmet" }
]

// Données de test pour les plats
const mockPlats: Plat[] = [
  {
    id: 1,
    restaurant_id: 1,
    name: "Pizza Margherita",
    description: "Pizza classique avec tomates, mozzarella fraîche et basilic",
    price: 12.50,
    image_url: "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=400",
    available: true
  },
  {
    id: 2,
    restaurant_id: 1,
    name: "Pizza Quatre Fromages",
    description: "Mozzarella, gorgonzola, parmesan et chèvre sur base tomate",
    price: 15.00,
    image_url: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400",
    available: true
  },
  {
    id: 3,
    restaurant_id: 2,
    name: "Burger Classic",
    description: "Steak haché, salade, tomate, oignon, cornichons, sauce burger",
    price: 11.90,
    image_url: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400",
    available: true
  },
  {
    id: 4,
    restaurant_id: 2,
    name: "Burger Bacon",
    description: "Steak haché, bacon croustillant, cheddar, salade, tomate",
    price: 13.50,
    image_url: "https://images.unsplash.com/photo-1553979459-d2229ba7433a?w=400",
    available: false
  },
  {
    id: 5,
    restaurant_id: 3,
    name: "Sashimi Saumon",
    description: "Tranches de saumon frais de qualité sashimi (6 pièces)",
    price: 18.00,
    image_url: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400",
    available: true
  },
  {
    id: 6,
    restaurant_id: 3,
    name: "Maki California",
    description: "Avocat, concombre, chair de crabe, graines de sésame (8 pièces)",
    price: 9.50,
    image_url: "https://images.unsplash.com/photo-1611143669185-af224c5e3252?w=400",
    available: true
  },
  {
    id: 7,
    restaurant_id: 4,
    name: "Cappuccino",
    description: "Café expresso avec mousse de lait onctueuse",
    price: 3.50,
    image_url: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400",
    available: true
  },
  {
    id: 8,
    restaurant_id: 5,
    name: "Tacos Poulet",
    description: "Tortillas de maïs, poulet mariné, avocat, coriandre, sauce piquante",
    price: 8.90,
    image_url: "https://images.unsplash.com/photo-1565299585323-38174c4a6a1f?w=400",
    available: true
  }
]

export default function GererMenus() {
  const [plats, setPlats] = useState<Plat[]>(mockPlats)
  const [restaurants] = useState<Restaurant[]>(mockRestaurants)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingPlat, setEditingPlat] = useState<Plat | null>(null)
  const [viewingPlat, setViewingPlat] = useState<Plat | null>(null)
  const [selectedRestaurant, setSelectedRestaurant] = useState<number | 'all'>('all')
  const [newPlat, setNewPlat] = useState({
    restaurant_id: 1,
    name: '',
    description: '',
    price: '',
    image_url: '',
    available: true
  })

  const getRestaurantName = (restaurantId: number) => {
    return restaurants.find(r => r.id === restaurantId)?.name || 'Restaurant inconnu'
  }

  const filteredPlats = selectedRestaurant === 'all' 
    ? plats 
    : plats.filter(p => p.restaurant_id === selectedRestaurant)

  const handleAddPlat = () => {
    if (newPlat.name && newPlat.price) {
      const plat: Plat = {
        id: Math.max(...plats.map(p => p.id)) + 1,
        restaurant_id: newPlat.restaurant_id,
        name: newPlat.name,
        description: newPlat.description,
        price: parseFloat(newPlat.price),
        image_url: newPlat.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400',
        available: newPlat.available
      }
      setPlats([...plats, plat])
      setNewPlat({ restaurant_id: 1, name: '', description: '', price: '', image_url: '', available: true })
      setShowAddForm(false)
    }
  }

  const handleEditPlat = (plat: Plat) => {
    setEditingPlat(plat)
    setNewPlat({
      restaurant_id: plat.restaurant_id,
      name: plat.name,
      description: plat.description,
      price: plat.price.toString(),
      image_url: plat.image_url,
      available: plat.available
    })
    setShowAddForm(true)
  }

  const handleSaveEdit = () => {
    if (editingPlat && newPlat.name && newPlat.price) {
      const updatedPlats = plats.map(p => 
        p.id === editingPlat.id 
          ? { 
              ...p, 
              restaurant_id: newPlat.restaurant_id,
              name: newPlat.name,
              description: newPlat.description,
              price: parseFloat(newPlat.price),
              image_url: newPlat.image_url,
              available: newPlat.available
            }
          : p
      )
      setPlats(updatedPlats)
      setEditingPlat(null)
      setNewPlat({ restaurant_id: 1, name: '', description: '', price: '', image_url: '', available: true })
      setShowAddForm(false)
    }
  }

  const handleDeletePlat = (id: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce plat ?')) {
      setPlats(plats.filter(p => p.id !== id))
    }
  }

  const toggleAvailability = (id: number) => {
    const updatedPlats = plats.map(p => 
      p.id === id 
        ? { ...p, available: !p.available }
        : p
    )
    setPlats(updatedPlats)
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0 }}>Gestion des Plats</h1>
          <p style={{ color: '#666', margin: '4px 0 0 0' }}>
            {filteredPlats.length} plats • {filteredPlats.filter(p => p.available).length} disponibles
          </p>
        </div>
        <button 
          className="btn" 
          onClick={() => setShowAddForm(true)}
          style={{ display: 'flex', alignItems: 'center', gap: 8 }}
        >
          <MdAdd /> Ajouter un plat
        </button>
      </div>

      {/* Filtre par restaurant */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <label style={{ fontWeight: 500 }}>Filtrer par restaurant :</label>
          <select
            className="input"
            value={selectedRestaurant}
            onChange={(e) => setSelectedRestaurant(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
            style={{ minWidth: 200 }}
          >
            <option value="all">Tous les restaurants ({plats.length})</option>
            {restaurants.map(restaurant => (
              <option key={restaurant.id} value={restaurant.id}>
                {restaurant.name} ({plats.filter(p => p.restaurant_id === restaurant.id).length})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Modal pour le formulaire d'ajout/édition */}
      {showAddForm && (
        <div className="modal-overlay" onClick={(e) => {
          if (e.target === e.currentTarget) {
            setShowAddForm(false)
            setEditingPlat(null)
            setNewPlat({ restaurant_id: 1, name: '', description: '', price: '', image_url: '', available: true })
          }
        }}>
          <div className="modal-content">
            <div className="modal-header">
              <h3>
                {editingPlat ? 'Modifier le plat' : 'Nouveau plat'}
              </h3>
              <button 
                className="modal-close"
                onClick={() => {
                  setShowAddForm(false)
                  setEditingPlat(null)
                  setNewPlat({ restaurant_id: 1, name: '', description: '', price: '', image_url: '', available: true })
                }}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'grid', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', marginBottom: 6, fontWeight: 500 }}>
                    Restaurant *
                  </label>
                  <select
                    className="input"
                    value={newPlat.restaurant_id}
                    onChange={e => setNewPlat({...newPlat, restaurant_id: parseInt(e.target.value)})}
                    style={{ width: '100%' }}
                  >
                    {restaurants.map(restaurant => (
                      <option key={restaurant.id} value={restaurant.id}>
                        {restaurant.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: 6, fontWeight: 500 }}>
                    Nom du plat *
                  </label>
                  <input
                    className="input"
                    type="text"
                    value={newPlat.name}
                    onChange={e => setNewPlat({...newPlat, name: e.target.value})}
                    placeholder="Ex: Pizza Margherita"
                    style={{ width: '100%' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: 6, fontWeight: 500 }}>
                    Prix (€) *
                  </label>
                  <input
                    className="input"
                    type="number"
                    step="0.01"
                    min="0"
                    value={newPlat.price}
                    onChange={e => setNewPlat({...newPlat, price: e.target.value})}
                    placeholder="12.50"
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
                    value={newPlat.image_url}
                    onChange={e => setNewPlat({...newPlat, image_url: e.target.value})}
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
                    value={newPlat.description}
                    onChange={e => setNewPlat({...newPlat, description: e.target.value})}
                    placeholder="Description du plat, ingrédients..."
                    rows={3}
                    style={{ width: '100%', resize: 'vertical' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={newPlat.available}
                      onChange={e => setNewPlat({...newPlat, available: e.target.checked})}
                    />
                    <span style={{ fontWeight: 500 }}>Plat disponible</span>
                  </label>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="btn-secondary"
                onClick={() => {
                  setShowAddForm(false)
                  setEditingPlat(null)
                  setNewPlat({ restaurant_id: 1, name: '', description: '', price: '', image_url: '', available: true })
                }}
              >
                Annuler
              </button>
              <button 
                className="btn"
                onClick={editingPlat ? handleSaveEdit : handleAddPlat}
                disabled={!newPlat.name || !newPlat.price}
              >
                {editingPlat ? 'Sauvegarder' : 'Ajouter'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal d'aperçu du plat */}
      {viewingPlat && (
        <div className="modal-overlay" onClick={(e) => {
          if (e.target === e.currentTarget) {
            setViewingPlat(null)
          }
        }}>
          <div className="modal-content">
            <div className="modal-header">
              <h3>Détails du plat</h3>
              <button 
                className="modal-close"
                onClick={() => setViewingPlat(null)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'grid', gap: 20 }}>
                {/* Image du plat */}
                <div style={{ textAlign: 'center' }}>
                  <img 
                    src={viewingPlat.image_url} 
                    alt={viewingPlat.name}
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
                    {viewingPlat.name}
                  </h4>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#666' }}>
                      <MdRestaurant style={{ fontSize: '1.1em' }} />
                      <span>{getRestaurantName(viewingPlat.restaurant_id)}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#059669', fontWeight: 600 }}>
                      <MdAttachMoney style={{ fontSize: '1.1em' }} />
                      <span>{viewingPlat.price.toFixed(2)} €</span>
                    </div>
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
                    {viewingPlat.description || 'Aucune description disponible.'}
                  </p>
                </div>

                {/* Informations supplémentaires */}
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
                  gap: 16,
                  padding: '16px',
                  background: '#f8fafc',
                  borderRadius: 8,
                  border: '1px solid #e2e8f0'
                }}>
                  <div>
                    <h6 style={{ margin: '0 0 4px 0', color: '#64748b', fontSize: '0.85em', textTransform: 'uppercase', letterSpacing: '0.05em' }}>ID Plat</h6>
                    <span style={{ fontWeight: 600, color: '#1e293b' }}>#{viewingPlat.id}</span>
                  </div>
                  <div>
                    <h6 style={{ margin: '0 0 4px 0', color: '#64748b', fontSize: '0.85em', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Disponibilité</h6>
                    <span style={{ 
                      fontWeight: 600, 
                      color: viewingPlat.available ? '#059669' : '#dc2626',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4
                    }}>
                      {viewingPlat.available ? <MdCheckCircle /> : <MdCancel />}
                      {viewingPlat.available ? 'Disponible' : 'Indisponible'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="btn-secondary"
                onClick={() => setViewingPlat(null)}
              >
                Fermer
              </button>
              <button 
                className="btn"
                onClick={() => {
                  setViewingPlat(null)
                  handleEditPlat(viewingPlat)
                }}
                style={{ display: 'flex', alignItems: 'center', gap: 6 }}
              >
                <MdEdit /> Modifier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Liste des plats */}
      <div className="card">
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                <th style={{ textAlign: 'left', padding: '12px 8px', fontWeight: 600 }}>Plat</th>
                <th style={{ textAlign: 'left', padding: '12px 8px', fontWeight: 600 }}>Restaurant</th>
                <th style={{ textAlign: 'center', padding: '12px 8px', fontWeight: 600 }}>Prix</th>
                <th style={{ textAlign: 'center', padding: '12px 8px', fontWeight: 600 }}>Disponibilité</th>
                <th style={{ textAlign: 'center', padding: '12px 8px', fontWeight: 600 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPlats.map(plat => (
                <tr key={plat.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '16px 8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <img 
                        src={plat.image_url} 
                        alt={plat.name}
                        style={{ 
                          width: 50, 
                          height: 50, 
                          borderRadius: 8, 
                          objectFit: 'cover',
                          border: '1px solid #e5e7eb'
                        }}
                      />
                      <div>
                        <div style={{ fontWeight: 600, marginBottom: 4 }}>{plat.name}</div>
                        <div style={{ 
                          fontSize: '0.85em', 
                          color: '#666',
                          maxWidth: 300,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {plat.description}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '16px 8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <MdRestaurant style={{ color: '#666', fontSize: '1.1em' }} />
                      <span style={{ fontSize: '0.9em', color: '#666' }}>{getRestaurantName(plat.restaurant_id)}</span>
                    </div>
                  </td>
                  <td style={{ padding: '16px 8px', textAlign: 'center' }}>
                    <div style={{ 
                      background: '#dcfce7',
                      color: '#166534',
                      padding: '4px 8px',
                      borderRadius: 6,
                      fontSize: '0.9em',
                      fontWeight: 600,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4
                    }}>
                      <MdAttachMoney style={{ fontSize: '1em' }} />
                      {plat.price.toFixed(2)} €
                    </div>
                  </td>
                  <td style={{ padding: '16px 8px', textAlign: 'center' }}>
                    <button
                      onClick={() => toggleAvailability(plat.id)}
                      style={{
                        background: plat.available ? '#dcfce7' : '#fee2e2',
                        color: plat.available ? '#166534' : '#dc2626',
                        border: `1px solid ${plat.available ? '#16653440' : '#dc262640'}`,
                        padding: '4px 12px',
                        borderRadius: 16,
                        fontSize: '0.8em',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        margin: '0 auto'
                      }}
                    >
                      {plat.available ? <MdCheckCircle /> : <MdCancel />}
                      {plat.available ? 'Disponible' : 'Indisponible'}
                    </button>
                  </td>
                  <td style={{ padding: '16px 8px' }}>
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                      <button
                        onClick={() => setViewingPlat(plat)}
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
                        onClick={() => handleEditPlat(plat)}
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
                        onClick={() => handleDeletePlat(plat.id)}
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

        {filteredPlats.length === 0 && (
          <div style={{ 
            textAlign: 'center', 
            padding: '48px 20px', 
            color: '#666' 
          }}>
            <MdRestaurant style={{ fontSize: '3em', marginBottom: 16, opacity: 0.5 }} />
            <h3>Aucun plat trouvé</h3>
            <p>
              {selectedRestaurant === 'all' 
                ? 'Commencez par ajouter votre premier plat.' 
                : 'Aucun plat trouvé pour ce restaurant.'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
