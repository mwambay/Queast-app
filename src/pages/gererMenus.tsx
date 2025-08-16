import '../components/admin.css'
import { MdAdd, MdEdit, MdDelete, MdVisibility, MdRestaurant, MdAttachMoney, MdCheckCircle, MdCancel } from 'react-icons/md'
import { useState, useEffect } from 'react'
import { MenuAPI } from '../api/Plats';
import { RestaurantAPI } from '../api/Restaurants';
import type { MenuItem, CreateMenuItemData, UpdateMenuItemData } from '../api/Plats';
import type { Restaurant } from '../api/Restaurants';

export default function GererMenus() {
  const [plats, setPlats] = useState<MenuItem[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [editing, setEditing] = useState<MenuItem | null>(null);
  const [viewingPlat, setViewingPlat] = useState<MenuItem | null>(null);
  const [selectedRestaurant, setSelectedRestaurant] = useState<number | 'all'>('all');
  const [formData, setFormData] = useState<CreateMenuItemData>({
    restaurant_id: 1,
    name: '',
    description: '',
    price: 0,
    category: '',
    image_url: '',
    is_available: true
  });


  useEffect(() => {
    async function load() {
      try {
        const [resResto, resPlats] = await Promise.all([
          RestaurantAPI.getAll(),
          MenuAPI.getAll()
        ]);
        if (resResto.error) throw new Error(resResto.error!);
        if (resPlats.error) throw new Error(resPlats.error!);
        const restos = resResto.data || [];
        const itemsRaw = resPlats.data || [];
        // Convert price from string to number
        const items = itemsRaw.map(item => ({
          ...item,
          price: typeof item.price === 'string' ? parseFloat(item.price) : item.price
        }));
        setRestaurants(restos);
        setPlats(items);
        if (restos.length > 0) {
          setFormData((f) => ({ ...f, restaurant_id: restos[0].id }));
        }
      } catch (e: any) {
        setError(e.message || 'Erreur de chargement');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const openForm = (item?: MenuItem) => {
    if (item) {
      setEditing(item);
      setFormData({
        restaurant_id: item.restaurant_id,
        name: item.name,
        description: item.description || '',
        price: item.price,
        category: item.category || '',
        image_url: item.image_url,
        is_available: item.is_available
      });
    } else {
      setEditing(null);
      setFormData({ restaurant_id: restaurants[0]?.id || 1, name: '', description: '', price: 0, category: '', image_url: '', is_available: true });
    }
    setShowForm(true);
  };

  const submitForm = async () => {
    try {
      const res = editing
        ? await MenuAPI.update(editing.id, formData as UpdateMenuItemData)
        : await MenuAPI.create({
            ...formData,
            price: Number(formData.price)
          });
      if (res.error) throw new Error(res.error);
      if (res.data) {
        // Ensure price is a number
        const item = {
          ...res.data,
          price: typeof res.data.price === 'string' ? parseFloat(res.data.price) : res.data.price
        };
        if (editing) {
          setPlats((ps) => ps.map((p) => (p.id === editing.id ? item : p)));
        } else {
          setPlats((ps) => [...ps, item]);
        }
      }
      setShowForm(false);
    } catch (e: any) {
      setError(e.message);
    }
  };

  const remove = async (id: number) => {
    if (!window.confirm('Supprimer ce plat ?')) return;
    try {
      const res = await MenuAPI.delete(id);
      if (res.error) throw new Error(res.error);
      setPlats((ps) => ps.filter((p) => p.id !== id));
    } catch (e: any) {
      setError(e.message);
    }
  };

  const toggleAvailability = (id: number) => {
    const updatedPlats = plats.map(p =>
      p.id === id
        ? { ...p, is_available: !p.is_available }
        : p
    );
    setPlats(updatedPlats);
  };

  if (loading) return <div>Chargement...</div>;
  if (error) return <div className="error">{error}</div>;

  const filteredPlats = selectedRestaurant === 'all'
    ? plats
    : plats.filter(p => p.restaurant_id === selectedRestaurant);

  return (
    <div className="admin-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0 }}>Gestion des Plats</h1>
          <p style={{ color: '#666', margin: '4px 0 0 0' }}>
            {filteredPlats.length} plats • {filteredPlats.filter(p => p.is_available).length} disponibles
          </p>
        </div>
        <button 
          className="btn" 
          onClick={() => openForm()}
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
      {showForm && (
        <div className="modal-overlay" onClick={(e) => {
          if (e.target === e.currentTarget) {
            setShowForm(false);
            setEditing(null);
            setFormData({ restaurant_id: 1, name: '', description: '', price: 0, category: '', image_url: '', is_available: true });
          }
        }}>
          <div className="modal-content">
            <div className="modal-header">
              <h3>{editing ? 'Modifier le plat' : 'Nouveau plat'}</h3>
              <button className="modal-close" onClick={() => {
                setShowForm(false);
                setEditing(null);
                setFormData({ restaurant_id: 1, name: '', description: '', price: 0, category: '', image_url: '', is_available: true });
              }}>×</button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'grid', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', marginBottom: 6, fontWeight: 500 }}>Restaurant *</label>
                  <select
                    className="input"
                    value={formData.restaurant_id}
                    onChange={e => setFormData({ ...formData, restaurant_id: parseInt(e.target.value) })}
                    style={{ width: '100%' }}
                  >
                    {restaurants.map(restaurant => (
                      <option key={restaurant.id} value={restaurant.id}>{restaurant.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: 6, fontWeight: 500 }}>Nom du plat *</label>
                  <input
                    className="input"
                    type="text"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: Pizza Margherita"
                    style={{ width: '100%' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: 6, fontWeight: 500 }}>Prix (€) *</label>
                  <input
                    className="input"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                    placeholder="12.50"
                    style={{ width: '100%' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: 6, fontWeight: 500 }}>URL de l'image</label>
                  <input
                    className="input"
                    type="url"
                    value={formData.image_url}
                    onChange={e => setFormData({ ...formData, image_url: e.target.value })}
                    placeholder="https://..."
                    style={{ width: '100%' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: 6, fontWeight: 500 }}>Description</label>
                  <textarea
                    className="input"
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Description du plat, ingrédients..."
                    rows={3}
                    style={{ width: '100%', resize: 'vertical' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={formData.is_available}
                      onChange={e => setFormData({ ...formData, is_available: e.target.checked })}
                    />
                    <span style={{ fontWeight: 500 }}>Plat disponible</span>
                  </label>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => {
                setShowForm(false);
                setEditing(null);
                setFormData({ restaurant_id: 1, name: '', description: '', price: 0, category: '', image_url: '', is_available: true });
              }}>Annuler</button>
              <button className="btn" onClick={editing ? submitForm : submitForm} disabled={!formData.name || !formData.price}>
                {editing ? 'Sauvegarder' : 'Ajouter'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal d'aperçu du plat */}
      {viewingPlat && (
        <div className="modal-overlay" onClick={(e) => {
          if (e.target === e.currentTarget) {
            setViewingPlat(null);
          }
        }}>
          <div className="modal-content">
            <div className="modal-header">
              <h3>Détails du plat</h3>
              <button className="modal-close" onClick={() => setViewingPlat(null)}>×</button>
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
                  <h4 style={{ margin: '0 0 8px 0', fontSize: '1.4em', color: '#1f2937' }}>{viewingPlat.name}</h4>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#666' }}>
                      <MdRestaurant style={{ fontSize: '1.1em' }} />
                      <span>{restaurants.find(r => r.id === viewingPlat.restaurant_id)?.name || 'Restaurant inconnu'}</span>
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
                  <p style={{ color: '#6b7280', lineHeight: 1.6, margin: 0, padding: '12px', background: '#f9fafb', borderRadius: 8, border: '1px solid #e5e7eb' }}>
                    {viewingPlat.description || 'Aucune description disponible.'}
                  </p>
                </div>

                {/* Informations supplémentaires */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 16, padding: '16px', background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                  <div>
                    <h6 style={{ margin: '0 0 4px 0', color: '#64748b', fontSize: '0.85em', textTransform: 'uppercase', letterSpacing: '0.05em' }}>ID Plat</h6>
                    <span style={{ fontWeight: 600, color: '#1e293b' }}>#{viewingPlat.id}</span>
                  </div>
                  <div>
                    <h6 style={{ margin: '0 0 4px 0', color: '#64748b', fontSize: '0.85em', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Disponibilité</h6>
                    <span style={{ fontWeight: 600, color: viewingPlat.is_available ? '#059669' : '#dc2626', display: 'flex', alignItems: 'center', gap: 4 }}>
                      {viewingPlat.is_available ? <MdCheckCircle /> : <MdCancel />}
                      {viewingPlat.is_available ? 'Disponible' : 'Indisponible'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setViewingPlat(null)}>Fermer</button>
              <button className="btn" onClick={() => { setViewingPlat(null); openForm(viewingPlat); }} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
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
                        style={{ width: 50, height: 50, borderRadius: 8, objectFit: 'cover', border: '1px solid #e5e7eb' }}
                      />
                      <div>
                        <div style={{ fontWeight: 600, marginBottom: 4 }}>{plat.name}</div>
                        <div style={{ fontSize: '0.85em', color: '#666', maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {plat.description}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '16px 8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <MdRestaurant style={{ color: '#666', fontSize: '1.1em' }} />
                      <span style={{ fontSize: '0.9em', color: '#666' }}>{restaurants.find(r => r.id === plat.restaurant_id)?.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '16px 8px', textAlign: 'center' }}>
                    <div style={{ background: '#dcfce7', color: '#166534', padding: '4px 8px', borderRadius: 6, fontSize: '0.9em', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      <MdAttachMoney style={{ fontSize: '1em' }} />
                      {plat.price.toFixed(2)} €
                    </div>
                  </td>
                  <td style={{ padding: '16px 8px', textAlign: 'center' }}>
                    <button
                      onClick={() => toggleAvailability(plat.id)}
                      style={{ background: plat.is_available ? '#dcfce7' : '#fee2e2', color: plat.is_available ? '#166534' : '#dc2626', border: `1px solid ${plat.is_available ? '#16653440' : '#dc262640'}`, padding: '4px 12px', borderRadius: 16, fontSize: '0.8em', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, margin: '0 auto' }}
                    >
                      {plat.is_available ? <MdCheckCircle /> : <MdCancel />}
                      {plat.is_available ? 'Disponible' : 'Indisponible'}
                    </button>
                  </td>
                  <td style={{ padding: '16px 8px' }}>
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                      <button
                        onClick={() => setViewingPlat(plat)}
                        style={{ background: '#e0f2fe', color: '#0369a1', border: '1px solid #0ea5e9', padding: '6px', borderRadius: 6, cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                        title="Voir les détails"
                      >
                        <MdVisibility />
                      </button>
                      <button
                        onClick={() => openForm(plat)}
                        style={{ background: '#fef3c7', color: '#92400e', border: '1px solid #f59e0b', padding: '6px', borderRadius: 6, cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                        title="Modifier"
                      >
                        <MdEdit />
                      </button>
                      <button
                        onClick={() => remove(plat.id)}
                        style={{ background: '#fee2e2', color: '#dc2626', border: '1px solid #ef4444', padding: '6px', borderRadius: 6, cursor: 'pointer', display: 'flex', alignItems: 'center' }}
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
          <div style={{ textAlign: 'center', padding: '48px 20px', color: '#666' }}>
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
  );
}
