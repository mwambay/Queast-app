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
        Response::json(404, ['error' => 'Restaurant non trouvé']);
        exit;
    }
    
    // Vérifier s'il y a des commandes associées à ce restaurant
    $checkOrdersStmt = $pdo->prepare("SELECT id FROM orders WHERE restaurant_id = ? LIMIT 1");
    $checkOrdersStmt->execute([$restaurantId]);
    
    if ($checkOrdersStmt->rowCount() > 0) {
        $pdo->rollBack();
        Response::json(409, [
            'error' => 'Impossible de supprimer le restaurant car il existe des commandes associées'
        ]);
        exit;
    }
    
    // Supprimer d'abord les plats du menu associés
    $deleteMenuStmt = $pdo->prepare("DELETE FROM menu_items WHERE restaurant_id = ?");
    $deleteMenuStmt->execute([$restaurantId]);
    
    // Supprimer le restaurant
    $deleteRestaurantStmt = $pdo->prepare("DELETE FROM restaurants WHERE id = ?");
    $success = $deleteRestaurantStmt->execute([$restaurantId]);
    
    if ($success) {
        $pdo->commit();
        Response::json(200, ['message' => 'Restaurant supprimé avec succès']);
    } else {
        $pdo->rollBack();
        Response::json(500, ['error' => 'Erreur lors de la suppression du restaurant']);
    }
    
} catch (PDOException $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    
    // Vérifier si c'est une erreur de contrainte de clé étrangère
    if ($e->getCode() === '23000') {
        Response::json(409, [
            'error' => 'Impossible de supprimer ce restaurant car il est référencé par d\'autres données'
        ]);
    } else {
        error_log("Erreur DB: " . $e->getMessage());
        Response::json(500, ['error' => 'Erreur serveur: ' . $e->getMessage()]);
    }
}