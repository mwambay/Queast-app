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

$db = new Database();
$pdo = $db->getConnection();

try {
    // Démarrer une transaction
    $pdo->beginTransaction();
    
    // Vérifier si le restaurant existe
    $checkStmt = $pdo->prepare("SELECT id FROM restaurants WHERE id = ?");
    $checkStmt->execute([$restaurantId]);
    
    if ($checkStmt->rowCount() === 0) {
        $pdo->rollBack();
        Response::json(404, ['error' => 'Restaurant non trouvé']);
        exit;
    }
    
    // Récupérer toutes les commandes associées à ce restaurant
    $getOrdersStmt = $pdo->prepare("SELECT id FROM orders WHERE restaurant_id = ?");
    $getOrdersStmt->execute([$restaurantId]);
    $orders = $getOrdersStmt->fetchAll(PDO::FETCH_COLUMN);
    
    // Si il y a des commandes, les supprimer en cascade
    if (!empty($orders)) {
        $orderIds = implode(',', array_map('intval', $orders));
        
        // Supprimer les évaluations liées aux commandes
        $deleteRatingsStmt = $pdo->prepare("DELETE FROM ratings WHERE order_id IN ($orderIds)");
        $deleteRatingsStmt->execute();
        
        // Supprimer l'historique des statuts des commandes
        $deleteStatusHistoryStmt = $pdo->prepare("DELETE FROM order_status_history WHERE order_id IN ($orderIds)");
        $deleteStatusHistoryStmt->execute();
        
        // Supprimer les articles des commandes
        $deleteOrderItemsStmt = $pdo->prepare("DELETE FROM order_items WHERE order_id IN ($orderIds)");
        $deleteOrderItemsStmt->execute();
        
        // Supprimer les commandes
        $deleteOrdersStmt = $pdo->prepare("DELETE FROM orders WHERE restaurant_id = ?");
        $deleteOrdersStmt->execute([$restaurantId]);
    }
    
    // Supprimer les plats du menu associés
    $deleteMenuStmt = $pdo->prepare("DELETE FROM menu_items WHERE restaurant_id = ?");
    $deleteMenuStmt->execute([$restaurantId]);
    
    // Supprimer le restaurant
    $deleteRestaurantStmt = $pdo->prepare("DELETE FROM restaurants WHERE id = ?");
    $success = $deleteRestaurantStmt->execute([$restaurantId]);
    
    if ($success) {
        $pdo->commit();
        Response::json(200, ['message' => 'Restaurant et toutes ses données associées supprimés avec succès']);
    } else {
        $pdo->rollBack();
        Response::json(500, ['error' => 'Erreur lors de la suppression du restaurant']);
    }
    
} catch (PDOException $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    
    error_log("Erreur DB lors de la suppression du restaurant $restaurantId: " . $e->getMessage());
    Response::json(500, ['error' => 'Erreur serveur: ' . $e->getMessage()]);
}