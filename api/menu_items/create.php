<?php
require_once __DIR__ . '/../../lib/database.php';
require_once __DIR__ . '/../../lib/auth.php';
require_once __DIR__ . '/../../lib/Response.php';

// Récupérer les données du corps de la requête
$data = json_decode(file_get_contents('php://input'), true);

if (!$data || !isset($data['restaurant_id']) || !isset($data['name']) || !isset($data['price'])) {
    Response::json(400, ['error' => 'Données incomplètes. Veuillez fournir restaurant_id, name et price.']);
    exit;
}

$restaurant_id = $data['restaurant_id'];
$name = $data['name'];
$description = $data['description'] ?? '';
$price = $data['price'];
$category = $data['category'] ?? '';
$image_url = $data['image_url'] ?? null;
$is_available = isset($data['is_available']) ? (bool)$data['is_available'] : true;

// Validation des données
if (empty($name) || !is_numeric($restaurant_id) || !is_numeric($price) || $price <= 0) {
    Response::json(400, ['error' => 'Données invalides. Vérifiez le nom, l\'ID du restaurant et le prix.']);
    exit;
}

$db = new Database();
$pdo = $db->getConnection();

try {
    // Vérifier que le restaurant existe
    $checkRestaurantStmt = $pdo->prepare("SELECT id FROM restaurants WHERE id = ?");
    $checkRestaurantStmt->execute([$restaurant_id]);
    
    if ($checkRestaurantStmt->rowCount() === 0) {
        Response::json(404, ['error' => 'Restaurant non trouvé']);
        exit;
    }
    
    $stmt = $pdo->prepare("
        INSERT INTO menu_items (restaurant_id, name, description, price, category, image_url, is_available) 
        VALUES (:restaurant_id, :name, :description, :price, :category, :image_url, :is_available)
    ");
    
    $success = $stmt->execute([
        'restaurant_id' => $restaurant_id,
        'name' => $name,
        'description' => $description,
        'price' => $price,
        'category' => $category,
        'image_url' => $image_url,
        'is_available' => $is_available ? 1 : 0
    ]);
    
    if ($success) {
        $menuItemId = $pdo->lastInsertId();
        
        // Récupérer le plat créé avec les infos du restaurant
        $getStmt = $pdo->prepare("
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
            WHERE mi.id = :id
        ");
        
        $getStmt->execute(['id' => $menuItemId]);
        $menuItem = $getStmt->fetch(PDO::FETCH_ASSOC);
        
        // Conversion du boolean pour la cohérence
        $menuItem['is_available'] = (bool)$menuItem['is_available'];
        
        Response::json(201, $menuItem);
    } else {
        Response::json(500, ['error' => 'Erreur lors de la création du plat.']);
    }
    
} catch (PDOException $e) {
    error_log("Erreur DB: " . $e->getMessage());
    Response::json(500, ['error' => 'Erreur serveur: ' . $e->getMessage()]);
}