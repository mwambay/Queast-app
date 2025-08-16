<?php
require_once __DIR__ . '/../../lib/database.php';
require_once __DIR__ . '/../../lib/auth.php';
require_once __DIR__ . '/../../lib/Response.php';

$db = new Database();
$pdo = $db->getConnection();

$restaurantId = $_GET['id'] ?? null;

if (!$restaurantId || !is_numeric($restaurantId)) {
    Response::json(400, ['message' => 'ID du restaurant requis ou invalide']);
}

// Vérifier que le restaurant existe et est actif
$stmt = $pdo->prepare("SELECT id, name FROM restaurants WHERE id = ? AND is_active = TRUE");
$stmt->execute([$restaurantId]);
$restaurant = $stmt->fetch();

if (!$restaurant) {
    Response::json(404, ['message' => 'Restaurant introuvable ou inactif']);
}

// Récupérer les plats disponibles du restaurant
$stmt = $pdo->prepare("
    SELECT 
        id, 
        name, 
        description, 
        price, 
        category,
        image_url,
        is_available
    FROM menu_items 
    WHERE restaurant_id = ? AND is_available = TRUE
    ORDER BY category, name
");
$stmt->execute([$restaurantId]);
$menuItems = $stmt->fetchAll(PDO::FETCH_ASSOC);

// Image par défaut si manquante
array_walk($menuItems, function (&$item) {
    $item['image_url'] = $item['image_url'] ?: '/images/default-dish.jpg';
});

Response::json(200, [
    'restaurant' => [
        'id' => $restaurant['id'],
        'name' => $restaurant['name']
    ],
    'count' => count($menuItems),
    'menu_items' => $menuItems,
    'generated_at' => date('c')
]);