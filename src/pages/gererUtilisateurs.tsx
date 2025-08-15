import '../components/admin.css'
import { MdPersonAdd } from 'react-icons/md'

export default function GererUtilisateurs() {
  return (
    <div>
      <h1>Gestion des Utilisateurs</h1>
      <div className="card">
        <p>Liste des utilisateurs (clients, livreurs, admins)</p>
        <button className="btn" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <MdPersonAdd /> Ajouter un utilisateur
        </button>
      </div>
    </div>
  )
}
