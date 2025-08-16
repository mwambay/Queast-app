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

// Récupérer les données du corps de la requête
$data = json_decode(file_get_contents('php://input'), true);

if (!$data || !isset($data['name']) || !isset($data['address']) || !isset($data['phone'])) {
    Response::json(400, ['error' => 'Données incomplètes. Veuillez fournir name, address et phone.']);
    exit;
}

$name = $data['name'];
$address = $data['address'];
$phone = $data['phone'];
$description = $data['description'] ?? '';
$image_url = $data['image_url'] ?? null;
$is_active = isset($data['is_active']) ? (bool)$data['is_active'] : true;

// Validation des données
if (empty($name) || empty($address) || empty($phone)) {
    Response::json(400, ['error' => 'Le nom, l\'adresse et le téléphone sont obligatoires.']);
    exit;
}

$db = new Database();
$pdo = $db->getConnection();

try {
    $stmt = $pdo->prepare("
        INSERT INTO restaurants (name, description, address, phone, image_url, is_active, created_at) 
        VALUES (:name, :description, :address, :phone, :image_url, :is_active, NOW())
    ");
    
    $success = $stmt->execute([
        'name' => $name,
        'description' => $description,
        'address' => $address,
        'phone' => $phone,
        'image_url' => $image_url,
        'is_active' => $is_active ? 1 : 0
    ]);
    
    if ($success) {
        $restaurantId = $pdo->lastInsertId();
        
        // Récupérer le restaurant créé
        $getStmt = $pdo->prepare("
            SELECT id, name, description, address, phone, image_url, is_active, created_at
            FROM restaurants
            WHERE id = :id
        ");
        
        $getStmt->execute(['id' => $restaurantId]);
        $restaurant = $getStmt->fetch(PDO::FETCH_ASSOC);
        
        Response::json(201, $restaurant);
    } else {
        Response::json(500, ['error' => 'Erreur lors de la création du restaurant.']);
    }
    
} catch (PDOException $e) {
    error_log("Erreur DB: " . $e->getMessage());
    Response::json(500, ['error' => 'Erreur serveur: ' . $e->getMessage()]);
}