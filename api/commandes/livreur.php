<?php
require_once __DIR__ . '/../../lib/database.php';
require_once __DIR__ . '/../../lib/auth.php';  // Nouvelle version sans JWT
require_once __DIR__ . '/../../lib/Response.php';

// Démarrer la session si pas déjà fait
if (session_status() === PHP_SESSION_NONE) {
    session_start([
        'cookie_httponly' => true,    // Protection contre les attaques XSS
        'use_strict_mode' => true     // Protection contre la fixation de session
    ]);
}

$db = new Database();
$pdo = $db->getConnection();

// Récupérer l'utilisateur actuel via session
$currentUser = Auth::getCurrentUser();

// Vérification du rôle admin
if (!$currentUser || $currentUser['role'] !== 'admin') {
    Response::json(403, ['message' => 'Accès réservé aux administrateurs']);
}

$data = json_decode(file_get_contents("php://input"), true);

if (empty($data['order_id']) || empty($data['delivery_person_id'])) {
    Response::json(400, ['message' => 'ID commande et ID livreur requis']);
}

// Vérifier que le livreur existe et a le bon rôle
$checkLivreur = $pdo->prepare("SELECT id FROM users WHERE id = ? AND role = 'livreur'");
$checkLivreur->execute([$data['delivery_person_id']]);
if (!$checkLivreur->fetch()) {
    Response::json(404, ['message' => 'Livreur introuvable ou rôle invalide']);
}

// Assigner un livreur à une commande
$stmt = $pdo->prepare("
    UPDATE orders 
    SET delivery_person_id = ?, status = 'in_delivery' 
    WHERE id = ? AND status = 'ready'
");
$stmt->execute([$data['delivery_person_id'], $data['order_id']]);

if ($stmt->rowCount() > 0) {
    // Historiser le changement de statut
    $history = $pdo->prepare("
        INSERT INTO order_status_history (order_id, status, changed_by, notes)
        VALUES (?, 'in_delivery', ?, ?)
    ");
    $history->execute([
        $data['order_id'],
        $currentUser['id'],
        $data['notes'] ?? 'Assignation du livreur'
    ]);

    Response::json(200, ['message' => 'Livreur assigné avec succès']);
} else {
    $errorInfo = $stmt->errorInfo();  // Récupération des infos d'erreur SQL
    Response::json(400, [
        'message' => 'Impossible d\'assigner le livreur',
        'error' => $errorInfo[2] ?? 'Raison inconnue'
    ]);
}