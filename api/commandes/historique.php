<?php
require_once DIR . '/../lib/database.php';
require_once DIR . '/../lib/auth.php'; // Pour gérer l'utilisateur via session
require_once DIR . '/../lib/Response.php';

// Démarrer la session si pas déjà fait
if (session_status() === PHP_SESSION_NONE) {
    session_start([
        'cookie_httponly' => true,
        'use_strict_mode' => true
    ]);
}

// Récupérer l'utilisateur actuel via la classe Auth
// $currentUser = Auth::getCurrentUser();

// Vérification de l'authentification
if (!$currentUser) {
    Response::json(403, ['error' => 'Utilisateur non authentifié.']);
    exit;
}

// Récupérer l'ID du livreur depuis la requête GET
$deliveryPersonId = $_GET['id'] ?? null;

// Vérifier que c'est bien un entier
if (!filter_var($deliveryPersonId, FILTER_VALIDATE_INT)) {
    Response::json(400, ['error' => 'ID du livreur invalide.']);
    exit;
}

// Connexion à la base de données
$db = new Database();
$conn = $db->getConnection();

try {
    // Récupérer les commandes assignées au livreur
    $stmt = $conn->prepare("SELECT * FROM orders WHERE delivery_person_id = :delivery_person_id");
    $stmt->bindParam(':delivery_person_id', $deliveryPersonId, PDO::PARAM_INT);
    $stmt->execute();

    $orders = $stmt->fetchAll(PDO::FETCH_ASSOC);

    if ($orders) {
        Response::json(200, $orders);
    } else {
        Response::json(404, ['message' => 'Aucune commande trouvée pour ce livreur']);
    }
} catch (PDOException $e) {
    Response::json(500, ['error' => 'Erreur lors de la récupération des commandes: ' . $e->getMessage()]);
}