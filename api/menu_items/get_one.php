<?php
require_once __DIR__ . '/../../lib/database.php';
require_once __DIR__ . '/../../lib/auth.php';
require_once __DIR__ . '/../../lib/Response.php';

// Récupérer l'ID du plat
$menuItemId = $_GET['id'] ?? null;

if (!$menuItemId || !is_numeric($menuItemId)) {
    Response::json(400, ['error' => 'ID du plat requis']);
    exit;
}

$db = new Database();
$pdo = $db->getConnection();

try {
    $stmt = $pdo->prepare("
        SELECT 
            mi.id,
            mi.restaurant_id,
            mi.name,
            mi.description,
            mi.price,
            mi.category,
            mi.image_url,
            mi.is_available,
            r.name as restaurant_name
        FROM menu_items mi
        LEFT JOIN restaurants r ON mi.restaurant_id = r.id
        WHERE mi.id = ?
    ");
    
    $stmt->execute([$menuItemId]);
    $menuItem = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$menuItem) {
        Response::json(404, ['error' => 'Plat non trouvé']);
        exit;
    }
    
    // Image par défaut si manquante et conversion boolean
    if (empty($menuItem['image_url'])) {
        $menuItem['image_url'] = '/images/default-dish.jpg';
    }
    $menuItem['is_available'] = (bool)$menuItem['is_available'];
    
    Response::json(200, $menuItem);
    
} catch (PDOException $e) {
    error_log("Erreur DB: " . $e->getMessage());
    Response::json(500, ['error' => 'Erreur serveur']);
}