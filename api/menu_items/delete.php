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
    // Démarrer une transaction
    $pdo->beginTransaction();
    
    // Vérifier si le plat existe
    $checkStmt = $pdo->prepare("SELECT id FROM menu_items WHERE id = ?");
    $checkStmt->execute([$menuItemId]);
    
    if ($checkStmt->rowCount() === 0) {
        $pdo->rollBack();
        Response::json(404, ['error' => 'Plat non trouvé']);
        exit;
    }
    
    // Vérifier s'il y a des articles de commande associés à ce plat
    $checkOrderItemsStmt = $pdo->prepare("SELECT id FROM order_items WHERE menu_item_id = ? LIMIT 1");
    $checkOrderItemsStmt->execute([$menuItemId]);
    
    if ($checkOrderItemsStmt->rowCount() > 0) {
        // Au lieu de bloquer la suppression, on peut juste désactiver le plat
        $disableStmt = $pdo->prepare("UPDATE menu_items SET is_available = 0 WHERE id = ?");
        $success = $disableStmt->execute([$menuItemId]);
        
        if ($success) {
            $pdo->commit();
            Response::json(200, [
                'message' => 'Le plat a été désactivé car il est référencé dans des commandes existantes',
                'action' => 'disabled'
            ]);
        } else {
            $pdo->rollBack();
            Response::json(500, ['error' => 'Erreur lors de la désactivation du plat']);
        }
        exit;
    }
    
    // Supprimer le plat (pas de références dans les commandes)
    $deleteStmt = $pdo->prepare("DELETE FROM menu_items WHERE id = ?");
    $success = $deleteStmt->execute([$menuItemId]);
    
    if ($success) {
        $pdo->commit();
        Response::json(200, [
            'message' => 'Plat supprimé avec succès',
            'action' => 'deleted'
        ]);
    } else {
        $pdo->rollBack();
        Response::json(500, ['error' => 'Erreur lors de la suppression du plat']);
    }
    
} catch (PDOException $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    
    error_log("Erreur DB lors de la suppression du plat $menuItemId: " . $e->getMessage());
    Response::json(500, ['error' => 'Erreur serveur: ' . $e->getMessage()]);
}