import '../components/admin.css'
import { MdPersonAdd, MdEdit, MdDelete, MdVisibility, MdPerson, MdEmail, MdBadge, MdAdminPanelSettings, MdDeliveryDining, MdPeople } from 'react-icons/md'
import { useState } from 'react'

interface User {
  id: number
  name: string
  email: string
  password_hash: string
  role: 'client' | 'livreur' | 'admin'
  created_at: string
}

// Données de test pour les utilisateurs
const mockUsers: User[] = [
  {
    id: 1,
    name: "Admin Principal",
    email: "admin@queast.com",
    password_hash: "$2b$10$...", // Hash fictif
    role: "admin",
    created_at: "2024-01-01T08:00:00Z"
  },
  {
    id: 2,
    name: "Marie Diop",
    email: "marie.diop@email.com",
    password_hash: "$2b$10$...",
    role: "client",
    created_at: "2024-02-15T10:30:00Z"
  },
  {
    id: 3,
    name: "Amadou Ba",
    email: "amadou.ba@email.com",
    password_hash: "$2b$10$...",
    role: "livreur",
    created_at: "2024-02-20T14:15:00Z"
  },
  {
    id: 4,
    name: "Fatou Sall",
    email: "fatou.sall@email.com",
    password_hash: "$2b$10$...",
    role: "client",
    created_at: "2024-03-01T16:45:00Z"
  },
  {
    id: 5,
    name: "Ousmane Ndiaye",
    email: "ousmane.ndiaye@email.com",
    password_hash: "$2b$10$...",
    role: "livreur",
    created_at: "2024-03-10T09:20:00Z"
  },
  {
    id: 6,
    name: "Aïssatou Sy",
    email: "aissatou.sy@email.com",
    password_hash: "$2b$10$...",
    role: "client",
    created_at: "2024-03-15T11:00:00Z"
  },
  {
    id: 7,
    name: "Modou Fall",
    email: "modou.fall@email.com",
    password_hash: "$2b$10$...",
    role: "livreur",
    created_at: "2024-03-20T13:30:00Z"
  },
  {
    id: 8,
    name: "Ndeye Thiam",
    email: "ndeye.thiam@email.com",
    password_hash: "$2b$10$...",
    role: "client",
    created_at: "2024-03-25T15:45:00Z"
  }
]

export default function GererUtilisateurs() {
  const [users, setUsers] = useState<User[]>(mockUsers)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [viewingUser, setViewingUser] = useState<User | null>(null)
  const [selectedRole, setSelectedRole] = useState<'all' | 'client' | 'livreur' | 'admin'>('all')
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'client' as 'client' | 'livreur' | 'admin'
  })

  const filteredUsers = selectedRole === 'all' 
    ? users 
    : users.filter(u => u.role === selectedRole)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getRoleIcon = (role: string) => {
    switch(role) {
      case 'admin': return <MdAdminPanelSettings />
      case 'livreur': return <MdDeliveryDining />
      case 'client': return <MdPerson />
      default: return <MdPerson />
    }
  }

  const getRoleColor = (role: string) => {
    switch(role) {
      case 'admin': return { bg: '#fef3c7', color: '#92400e', border: '#f59e0b' }
      case 'livreur': return { bg: '#dbeafe', color: '#1e40af', border: '#3b82f6' }
      case 'client': return { bg: '#dcfce7', color: '#166534', border: '#16a34a' }
      default: return { bg: '#f3f4f6', color: '#374151', border: '#9ca3af' }
    }
  }

  const getRoleLabel = (role: string) => {
    switch(role) {
      case 'admin': return 'Administrateur'
      case 'livreur': return 'Livreur'
      case 'client': return 'Client'
      default: return role
    }
  }

  const handleAddUser = () => {
    if (newUser.name && newUser.email && newUser.password) {
      const user: User = {
        id: Math.max(...users.map(u => u.id)) + 1,
        name: newUser.name,
        email: newUser.email,
        password_hash: `$2b$10$...${newUser.password.slice(-8)}`, // Simulation d'un hash
        role: newUser.role,
        created_at: new Date().toISOString()
      }
      setUsers([...users, user])
      setNewUser({ name: '', email: '', password: '', role: 'client' })
      setShowAddForm(false)
    }
  }

  const handleEditUser = (user: User) => {
    setEditingUser(user)
    setNewUser({
      name: user.name,
      email: user.email,
      password: '', // Ne pas pré-remplir le mot de passe
      role: user.role
    })
    setShowAddForm(true)
  }

  const handleSaveEdit = () => {
    if (editingUser && newUser.name && newUser.email) {
      const updatedUsers = users.map(u => 
        u.id === editingUser.id 
          ? { 
              ...u, 
              name: newUser.name,
              email: newUser.email,
              role: newUser.role,
              // Mettre à jour le mot de passe seulement s'il est fourni
              ...(newUser.password && { password_hash: `$2b$10$...${newUser.password.slice(-8)}` })
            }
          : u
      )
      setUsers(updatedUsers)
      setEditingUser(null)
      setNewUser({ name: '', email: '', password: '', role: 'client' })
      setShowAddForm(false)
    }
  }

  const handleDeleteUser = (id: number) => {
    const userToDelete = users.find(u => u.id === id)
    if (userToDelete?.role === 'admin' && users.filter(u => u.role === 'admin').length === 1) {
      alert('Impossible de supprimer le dernier administrateur !')
      return
    }
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      setUsers(users.filter(u => u.id !== id))
    }
  }

  const getUserStats = () => {
    return {
      total: users.length,
      clients: users.filter(u => u.role === 'client').length,
      livreurs: users.filter(u => u.role === 'livreur').length,
      admins: users.filter(u => u.role === 'admin').length
    }
  }

  const stats = getUserStats()

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0 }}>Gestion des Utilisateurs</h1>
          <p style={{ color: '#666', margin: '4px 0 0 0' }}>
            {filteredUsers.length} utilisateurs • {stats.clients} clients • {stats.livreurs} livreurs • {stats.admins} admins
          </p>
        </div>
        <button 
          className="btn" 
          onClick={() => setShowAddForm(true)}
          style={{ display: 'flex', alignItems: 'center', gap: 8 }}
        >
          <MdPersonAdd /> Ajouter un utilisateur
        </button>
      </div>

      {/* Filtre par rôle */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <label style={{ fontWeight: 500 }}>Filtrer par rôle :</label>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button
              onClick={() => setSelectedRole('all')}
              style={{
                background: selectedRole === 'all' ? '#3ba0ff' : '#f3f4f6',
                color: selectedRole === 'all' ? 'white' : '#374151',
                border: '1px solid ' + (selectedRole === 'all' ? '#2f8fe8' : '#d1d5db'),
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
              <MdPeople /> Tous ({stats.total})
            </button>
            <button
              onClick={() => setSelectedRole('client')}
              style={{
                background: selectedRole === 'client' ? '#dcfce7' : '#f3f4f6',
                color: selectedRole === 'client' ? '#166534' : '#374151',
                border: '1px solid ' + (selectedRole === 'client' ? '#16a34a' : '#d1d5db'),
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
              <MdPerson /> Clients ({stats.clients})
            </button>
            <button
              onClick={() => setSelectedRole('livreur')}
              style={{
                background: selectedRole === 'livreur' ? '#dbeafe' : '#f3f4f6',
                color: selectedRole === 'livreur' ? '#1e40af' : '#374151',
                border: '1px solid ' + (selectedRole === 'livreur' ? '#3b82f6' : '#d1d5db'),
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
              <MdDeliveryDining /> Livreurs ({stats.livreurs})
            </button>
            <button
              onClick={() => setSelectedRole('admin')}
              style={{
                background: selectedRole === 'admin' ? '#fef3c7' : '#f3f4f6',
                color: selectedRole === 'admin' ? '#92400e' : '#374151',
                border: '1px solid ' + (selectedRole === 'admin' ? '#f59e0b' : '#d1d5db'),
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
              <MdAdminPanelSettings /> Admins ({stats.admins})
            </button>
          </div>
        </div>
      </div>

      {/* Modal pour le formulaire d'ajout/édition */}
      {showAddForm && (
        <div className="modal-overlay" onClick={(e) => {
          if (e.target === e.currentTarget) {
            setShowAddForm(false)
            setEditingUser(null)
            setNewUser({ name: '', email: '', password: '', role: 'client' })
          }
        }}>
          <div className="modal-content">
            <div className="modal-header">
              <h3>
                {editingUser ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur'}
              </h3>
              <button 
                className="modal-close"
                onClick={() => {
                  setShowAddForm(false)
                  setEditingUser(null)
                  setNewUser({ name: '', email: '', password: '', role: 'client' })
                }}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'grid', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', marginBottom: 6, fontWeight: 500 }}>
                    Nom complet *
                  </label>
                  <input
                    className="input"
                    type="text"
                    value={newUser.name}
                    onChange={e => setNewUser({...newUser, name: e.target.value})}
                    placeholder="Ex: Marie Diop"
                    style={{ width: '100%' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: 6, fontWeight: 500 }}>
                    Email *
                  </label>
                  <input
                    className="input"
                    type="email"
                    value={newUser.email}
                    onChange={e => setNewUser({...newUser, email: e.target.value})}
                    placeholder="marie.diop@email.com"
                    style={{ width: '100%' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: 6, fontWeight: 500 }}>
                    {editingUser ? 'Nouveau mot de passe (laisser vide pour ne pas changer)' : 'Mot de passe *'}
                  </label>
                  <input
                    className="input"
                    type="password"
                    value={newUser.password}
                    onChange={e => setNewUser({...newUser, password: e.target.value})}
                    placeholder={editingUser ? 'Nouveau mot de passe...' : 'Mot de passe...'}
                    style={{ width: '100%' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: 6, fontWeight: 500 }}>
                    Rôle *
                  </label>
                  <select
                    className="input"
                    value={newUser.role}
                    onChange={e => setNewUser({...newUser, role: e.target.value as 'client' | 'livreur' | 'admin'})}
                    style={{ width: '100%' }}
                  >
                    <option value="client">Client</option>
                    <option value="livreur">Livreur</option>
                    <option value="admin">Administrateur</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="btn-secondary"
                onClick={() => {
                  setShowAddForm(false)
                  setEditingUser(null)
                  setNewUser({ name: '', email: '', password: '', role: 'client' })
                }}
              >
                Annuler
              </button>
              <button 
                className="btn"
                onClick={editingUser ? handleSaveEdit : handleAddUser}
                disabled={!newUser.name || !newUser.email || (!editingUser && !newUser.password)}
              >
                {editingUser ? 'Sauvegarder' : 'Ajouter'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal d'aperçu de l'utilisateur */}
      {viewingUser && (
        <div className="modal-overlay" onClick={(e) => {
          if (e.target === e.currentTarget) {
            setViewingUser(null)
          }
        }}>
          <div className="modal-content">
            <div className="modal-header">
              <h3>Détails de l'utilisateur</h3>
              <button 
                className="modal-close"
                onClick={() => setViewingUser(null)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'grid', gap: 20 }}>
                {/* Avatar et infos principales */}
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px auto',
                    color: 'white',
                    fontSize: '2em',
                    fontWeight: 600
                  }}>
                    {viewingUser.name.charAt(0).toUpperCase()}
                  </div>
                  <h4 style={{ margin: '0 0 8px 0', fontSize: '1.4em', color: '#1f2937' }}>
                    {viewingUser.name}
                  </h4>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, color: '#666', marginBottom: 16 }}>
                    <MdEmail style={{ fontSize: '1.1em' }} />
                    <span>{viewingUser.email}</span>
                  </div>
                </div>

                {/* Rôle */}
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    ...getRoleColor(viewingUser.role),
                    background: getRoleColor(viewingUser.role).bg,
                    color: getRoleColor(viewingUser.role).color,
                    border: `1px solid ${getRoleColor(viewingUser.role).border}`,
                    padding: '8px 16px',
                    borderRadius: 20,
                    fontSize: '0.9em',
                    fontWeight: 600,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6
                  }}>
                    {getRoleIcon(viewingUser.role)}
                    {getRoleLabel(viewingUser.role)}
                  </div>
                </div>

                {/* Informations détaillées */}
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
                    <h6 style={{ margin: '0 0 4px 0', color: '#64748b', fontSize: '0.85em', textTransform: 'uppercase', letterSpacing: '0.05em' }}>ID Utilisateur</h6>
                    <span style={{ fontWeight: 600, color: '#1e293b' }}>#{viewingUser.id}</span>
                  </div>
                  <div>
                    <h6 style={{ margin: '0 0 4px 0', color: '#64748b', fontSize: '0.85em', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Date d'inscription</h6>
                    <span style={{ fontWeight: 600, color: '#1e293b' }}>{formatDate(viewingUser.created_at)}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="btn-secondary"
                onClick={() => setViewingUser(null)}
              >
                Fermer
              </button>
              <button 
                className="btn"
                onClick={() => {
                  setViewingUser(null)
                  handleEditUser(viewingUser)
                }}
                style={{ display: 'flex', alignItems: 'center', gap: 6 }}
              >
                <MdEdit /> Modifier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Liste des utilisateurs */}
      <div className="card">
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                <th style={{ textAlign: 'left', padding: '12px 8px', fontWeight: 600 }}>Utilisateur</th>
                <th style={{ textAlign: 'left', padding: '12px 8px', fontWeight: 600 }}>Email</th>
                <th style={{ textAlign: 'center', padding: '12px 8px', fontWeight: 600 }}>Rôle</th>
                <th style={{ textAlign: 'center', padding: '12px 8px', fontWeight: 600 }}>Inscription</th>
                <th style={{ textAlign: 'center', padding: '12px 8px', fontWeight: 600 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(user => (
                <tr key={user.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '16px 8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '1.1em',
                        fontWeight: 600
                      }}>
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, marginBottom: 2 }}>{user.name}</div>
                        <div style={{ fontSize: '0.85em', color: '#666' }}>ID: #{user.id}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '16px 8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <MdEmail style={{ color: '#666', fontSize: '1.1em' }} />
                      <span style={{ fontSize: '0.9em', color: '#666' }}>{user.email}</span>
                    </div>
                  </td>
                  <td style={{ padding: '16px 8px', textAlign: 'center' }}>
                    <div style={{
                      ...getRoleColor(user.role),
                      background: getRoleColor(user.role).bg,
                      color: getRoleColor(user.role).color,
                      border: `1px solid ${getRoleColor(user.role).border}`,
                      padding: '4px 12px',
                      borderRadius: 16,
                      fontSize: '0.8em',
                      fontWeight: 600,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4
                    }}>
                      {getRoleIcon(user.role)}
                      {getRoleLabel(user.role)}
                    </div>
                  </td>
                  <td style={{ padding: '16px 8px', textAlign: 'center', fontSize: '0.9em', color: '#666' }}>
                    {formatDate(user.created_at)}
                  </td>
                  <td style={{ padding: '16px 8px' }}>
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                      <button
                        onClick={() => setViewingUser(user)}
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
                        onClick={() => handleEditUser(user)}
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
                        onClick={() => handleDeleteUser(user.id)}
                        disabled={user.role === 'admin' && stats.admins === 1}
                        style={{
                          background: user.role === 'admin' && stats.admins === 1 ? '#f9fafb' : '#fee2e2',
                          color: user.role === 'admin' && stats.admins === 1 ? '#9ca3af' : '#dc2626',
                          border: `1px solid ${user.role === 'admin' && stats.admins === 1 ? '#d1d5db' : '#ef4444'}`,
                          padding: '6px',
                          borderRadius: 6,
                          cursor: user.role === 'admin' && stats.admins === 1 ? 'not-allowed' : 'pointer',
                          display: 'flex',
                          alignItems: 'center'
                        }}
                        title={user.role === 'admin' && stats.admins === 1 ? 'Impossible de supprimer le dernier admin' : 'Supprimer'}
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

        {filteredUsers.length === 0 && (
          <div style={{ 
            textAlign: 'center', 
            padding: '48px 20px', 
            color: '#666' 
          }}>
            <MdPeople style={{ fontSize: '3em', marginBottom: 16, opacity: 0.5 }} />
            <h3>Aucun utilisateur trouvé</h3>
            <p>
              {selectedRole === 'all' 
                ? 'Commencez par ajouter votre premier utilisateur.' 
                : `Aucun utilisateur avec le rôle "${getRoleLabel(selectedRole)}" trouvé.`}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
