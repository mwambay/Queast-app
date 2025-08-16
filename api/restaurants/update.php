<?php
require_once __DIR__ . '/../../lib/database.php';
require_once __DIR__ . '/../../lib/auth.php';
require_once __DIR__ . '/../../lib/Response.php';

// Vérifier l'authentification (admin uniquement)
// TODO: Réactiver la vérification d'authentification pour la production
// $currentUser = checkAuth();
// if ($currentUser['role'] !== 'admin') {
//     Response::json(403, ['error' => 'Accès non autorisé']);
//     exit;
// }

// Récupérer l'ID du restaurant
$restaurantId = $_GET['id'] ?? null;

if (!$restaurantId || !is_numeric($restaurantId)) {
    Response::json(400, ['error' => 'ID du restaurant requis']);
    exit;
}

// Récupérer les données à mettre à jour
$data = json_decode(file_get_contents('php://input'), true);

if (!$data || empty($data)) {
    Response::json(400, ['error' => 'Aucune donnée fournie pour la mise à jour']);
    exit;
}

// Préparer les champs à mettre à jour
$updateFields = [];
$params = [];

// Vérifier chaque champ possible
if (isset($data['name'])) {
    $updateFields[] = "name = :name";
    $params['name'] = $data['name'];
}

if (isset($data['description'])) {
    $updateFields[] = "description = :description";
    $params['description'] = $data['description'];
}

if (isset($data['address'])) {
    $updateFields[] = "address = :address";
    $params['address'] = $data['address'];
}

if (isset($data['phone'])) {
    $updateFields[] = "phone = :phone";
    $params['phone'] = $data['phone'];
}

if (isset($data['image_url'])) {
    $updateFields[] = "image_url = :image_url";
    $params['image_url'] = $data['image_url'];
}

if (isset($data['is_active'])) {
    $updateFields[] = "is_active = :is_active";
    $params['is_active'] = (bool)$data['is_active'] ? 1 : 0;
}

// Si aucun champ n'est à mettre à jour
if (empty($updateFields)) {
    Response::json(400, ['error' => 'Aucun champ valide à mettre à jour']);
    exit;
}

$db = new Database();
$pdo = $db->getConnection();

try {
    // Vérifier si le restaurant existe
    $checkStmt = $pdo->prepare("SELECT id FROM restaurants WHERE id = :id");
    $checkStmt->execute(['id' => $restaurantId]);
    
    if ($checkStmt->rowCount() === 0) {
        Response::json(404, ['error' => 'Restaurant non trouvé']);
        exit;
    }
    
    // Ajouter l'ID dans les paramètres
    $params['id'] = $restaurantId;
    
    // Construire et exécuter la requête de mise à jour
    $updateQuery = "UPDATE restaurants SET " . implode(', ', $updateFields) . " WHERE id = :id";
    $updateStmt = $pdo->prepare($updateQuery);
    $success = $updateStmt->execute($params);
    
    if ($success) {
        // Récupérer le restaurant mis à jour
        $getStmt = $pdo->prepare("
            SELECT id, name, description, address, phone, image_url, is_active, created_at
            FROM restaurants
            WHERE id = :id
        ");
        
        $getStmt->execute(['id' => $restaurantId]);
        $restaurant = $getStmt->fetch(PDO::FETCH_ASSOC);
        
        Response::json(200, $restaurant);
    } else {
        Response::json(500, ['error' => 'Erreur lors de la mise à jour du restaurant']);
    }
    
} catch (PDOException $e) {
    error_log("Erreur DB: " . $e->getMessage());
    Response::json(500, ['error' => 'Erreur serveur: ' . $e->getMessage()]);
}