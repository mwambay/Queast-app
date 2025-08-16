<?php
require_once __DIR__ . '/../../lib/database.php';
require_once __DIR__ . '/../../lib/auth.php';
require_once __DIR__ . '/../../lib/Response.php';

$db = new Database();
$pdo = $db->getConnection();

try {
    // Récupérer tous les plats avec les informations de restaurant
    $stmt = $pdo->query("
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
        ORDER BY r.name, mi.category, mi.name
    ");
    
    $menuItems = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Image par défaut si manquante
    array_walk($menuItems, function (&$item) {
        $item['image_url'] = $item['image_url'] ?: '/images/default-dish.jpg';
        $item['is_available'] = (bool)$item['is_available'];
    });
    
    Response::json(200, [
        'count' => count($menuItems),
        'menu_items' => $menuItems,
        'generated_at' => date('c')
    ]);
    
} catch (PDOException $e) {
    error_log("Erreur DB: " . $e->getMessage());
    Response::json(500, ['error' => 'Erreur serveur']);
}