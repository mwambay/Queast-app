import '../components/admin.css'

export default function SuiviCommandes() {
  return (
    <div>
      <h1>Suivi des Commandes</h1>
      <div className="card">
        <p>Statut des commandes en cours et historique</p>
        <button className="btn">Rafraîchir</button>
      </div>
    </div>
  )
}
