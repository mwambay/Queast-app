import '../components/admin.css'

export default function GererUtilisateurs() {
  return (
    <div>
      <h1>Gestion des Utilisateurs</h1>
      <div className="card">
        <p>Liste des utilisateurs (clients, livreurs, admins)</p>
        <button className="btn">Ajouter un utilisateur</button>
      </div>
    </div>
  )
}
