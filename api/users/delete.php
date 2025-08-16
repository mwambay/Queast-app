<?php
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../lib/database.php';
require_once __DIR__ . '/../../lib/Response.php';

try {
    $userId = $_GET['id'] ?? null;
    if (!$userId) {
        Response::json(400, ['error' => 'ID utilisateur manquant']);
        return;
    }
    
    $db = new Database();
    $pdo = $db->getConnection();
    
    // Vérifier que l'utilisateur existe
    $stmt = $pdo->prepare("SELECT role FROM users WHERE id = ?");
    $stmt->execute([$userId]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$user) {
        Response::json(404, ['error' => 'Utilisateur non trouvé']);
        return;
    }
    
    // Empêcher la suppression du dernier admin
    if ($user['role'] === 'admin') {
        $stmt = $pdo->prepare("SELECT COUNT(*) as count FROM users WHERE role = 'admin'");
        $stmt->execute();
        $adminCount = $stmt->fetch(PDO::FETCH_ASSOC)['count'];
        
        if ($adminCount <= 1) {
            Response::json(403, ['error' => 'Impossible de supprimer le dernier administrateur']);
            return;
        }
    }
    
    // Supprimer les enregistrements associés puis l'utilisateur
    $pdo->beginTransaction();
    // Évaluations liées
    $pdo->prepare("DELETE FROM ratings WHERE user_id = ?")->execute([$userId]);
    // Supprimer les commandes passées par l'utilisateur (cascade sur order_items et order_status_history)
    $pdo->prepare("DELETE FROM orders WHERE user_id = ?")->execute([$userId]);
    // Mettre à NULL les commandes où il était livreur
    $pdo->prepare("UPDATE orders SET delivery_person_id = NULL WHERE delivery_person_id = ?")->execute([$userId]);
    // Historique des statuts où il figurait comme changed_by
    $pdo->prepare("DELETE FROM order_status_history WHERE changed_by = ?")->execute([$userId]);
    // Supprimer l'utilisateur
    $pdo->prepare("DELETE FROM users WHERE id = ?")->execute([$userId]);
    $pdo->commit();
    
    Response::json(200, ['message' => 'Utilisateur et dépendances supprimés avec succès']);
    
} catch (PDOException $e) {
    // Integrity constraint violation (e.g., existing related records)
    if ($e->getCode() === '23000') {
        Response::json(409, ['error' => 'Impossible de supprimer l\'utilisateur : des enregistrements associés existent']);
        return;
    }
    Response::json(500, ['error' => 'Erreur lors de la suppression de l\'utilisateur: ' . $e->getMessage()]);
} catch (Exception $e) {
    Response::json(500, ['error' => 'Erreur lors de la suppression de l\'utilisateur: ' . $e->getMessage()]);
}