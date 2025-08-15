import '../components/admin.css'
import { MdRefresh } from 'react-icons/md'

export default function SuiviCommandes() {
  return (
    <div>
      <h1>Suivi des Commandes</h1>
      <div className="card">
        <p>Statut des commandes en cours et historique</p>
        <button className="btn" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <MdRefresh /> Rafraîchir
        </button>
      </div>
    </div>
  )
}
