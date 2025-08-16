<?php
require_once __DIR__ . '/../../lib/database.php';
require_once __DIR__ . '/../../lib/auth.php';
require_once __DIR__ . '/../../lib/Response.php';

$db = new Database();
$pdo = $db->getConnection();

// Récupérer l'ID du restaurant depuis les paramètres de la requête
$restaurantId = $_GET['id'] ?? null;

if (!$restaurantId || !is_numeric($restaurantId)) {
    Response::json(400, ['error' => 'ID du restaurant requis']);
    exit;
}

try {
    $stmt = $pdo->prepare("
        SELECT 
            id, 
            name, 
            description,
            address, 
            phone, 
            image_url,
            is_active,
            created_at
        FROM restaurants 
        WHERE id = ?
    ");
    
    $stmt->execute([$restaurantId]);
    $restaurant = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$restaurant) {
        Response::json(404, ['error' => 'Restaurant non trouvé']);
        exit;
    }
    
    // Image par défaut si manquante
    if (empty($restaurant['image_url'])) {
        $restaurant['image_url'] = '/images/default-restaurant.jpg';
    }
    
    Response::json(200, $restaurant);
    
} catch (PDOException $e) {
    error_log("Erreur DB: " . $e->getMessage());
    Response::json(500, ['error' => 'Erreur serveur']);
}