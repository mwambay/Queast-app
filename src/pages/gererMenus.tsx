import '../components/admin.css'
import { MdAdd } from 'react-icons/md'

export default function GererMenus() {
  return (
    <div>
      <h1>Gestion des Plats</h1>
      <div className="card">
        <p>Liste des plats par restaurant</p>
        <button className="btn" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <MdAdd /> Ajouter un plat
        </button>
      </div>
    </div>
  )
}
