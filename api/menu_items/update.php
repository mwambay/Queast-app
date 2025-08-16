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

if (isset($data['price'])) {
    if (!is_numeric($data['price']) || $data['price'] <= 0) {
        Response::json(400, ['error' => 'Le prix doit être un nombre positif']);
        exit;
    }
    $updateFields[] = "price = :price";
    $params['price'] = $data['price'];
}

if (isset($data['category'])) {
    $updateFields[] = "category = :category";
    $params['category'] = $data['category'];
}

if (isset($data['image_url'])) {
    $updateFields[] = "image_url = :image_url";
    $params['image_url'] = $data['image_url'];
}

if (isset($data['is_available'])) {
    $updateFields[] = "is_available = :is_available";
    $params['is_available'] = (bool)$data['is_available'] ? 1 : 0;
}

if (isset($data['restaurant_id'])) {
    if (!is_numeric($data['restaurant_id'])) {
        Response::json(400, ['error' => 'ID du restaurant invalide']);
        exit;
    }
    $updateFields[] = "restaurant_id = :restaurant_id";
    $params['restaurant_id'] = $data['restaurant_id'];
}

// Si aucun champ n'est à mettre à jour
if (empty($updateFields)) {
    Response::json(400, ['error' => 'Aucun champ valide à mettre à jour']);
    exit;
}

$db = new Database();
$pdo = $db->getConnection();

try {
    // Vérifier si le plat existe
    $checkStmt = $pdo->prepare("SELECT id FROM menu_items WHERE id = :id");
    $checkStmt->execute(['id' => $menuItemId]);
    
    if ($checkStmt->rowCount() === 0) {
        Response::json(404, ['error' => 'Plat non trouvé']);
        exit;
    }
    
    // Si on change le restaurant, vérifier qu'il existe
    if (isset($params['restaurant_id'])) {
        $checkRestaurantStmt = $pdo->prepare("SELECT id FROM restaurants WHERE id = ?");
        $checkRestaurantStmt->execute([$params['restaurant_id']]);
        
        if ($checkRestaurantStmt->rowCount() === 0) {
            Response::json(404, ['error' => 'Restaurant non trouvé']);
            exit;
        }
    }
    
    // Ajouter l'ID dans les paramètres
    $params['id'] = $menuItemId;
    
    // Construire et exécuter la requête de mise à jour
    $updateQuery = "UPDATE menu_items SET " . implode(', ', $updateFields) . " WHERE id = :id";
    $updateStmt = $pdo->prepare($updateQuery);
    $success = $updateStmt->execute($params);
    
    if ($success) {
        // Récupérer le plat mis à jour avec les infos du restaurant
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
        
        Response::json(200, $menuItem);
    } else {
        Response::json(500, ['error' => 'Erreur lors de la mise à jour du plat']);
    }
    
} catch (PDOException $e) {
    error_log("Erreur DB: " . $e->getMessage());
    Response::json(500, ['error' => 'Erreur serveur: ' . $e->getMessage()]);
}