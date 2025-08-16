<?php
require_once __DIR__ . '/../../lib/database.php';
require_once __DIR__ . '/../../lib/auth.php'; // Version sans JWT
require_once __DIR__ . '/../../lib/Response.php';

// Initialisation session
if (session_status() === PHP_SESSION_NONE) {
    session_start([
        'cookie_httponly' => true,
        'use_strict_mode' => true
    ]);
}

$db = new Database();
$pdo = $db->getConnection();

// Récupération utilisateur via session
$currentUser = Auth::getCurrentUser();

// Vérification authentification de base
if (!$currentUser) {
    Response::json(401, ['message' => 'Authentification requise']);
}

$orderId = $_GET['id'] ?? null;
$data = json_decode(file_get_contents("php://input"), true);

// Validation des entrées
if (!$orderId || empty($data['status'])) {
    Response::json(400, ['message' => 'ID commande et nouveau statut requis']);
}

// Définition des permissions par rôle
$permissions = [
    'admin' => ['pending', 'preparing', 'ready', 'in_delivery', 'delivered', 'cancelled'],
    'livreur' => ['in_delivery', 'delivered'],
    'client' => ['cancelled']
];

// Vérification des droits
if (!isset($permissions[$currentUser['role']])) {
    Response::json(403, ['message' => 'Rôle non reconnu']);
}

$allowedStatuses = $permissions[$currentUser['role']];
if (!in_array($data['status'], $allowedStatuses)) {
    Response::json(403, [
        'message' => 'Action non autorisée',
        'allowed_statuses' => $allowedStatuses
    ]);
}

// Vérification supplémentaire pour les clients
if ($currentUser['role'] === 'client') {
    $stmt = $pdo->prepare("SELECT user_id FROM orders WHERE id = ?");
    $stmt->execute([$orderId]);
    $order = $stmt->fetch();

    if (!$order || $order['user_id'] != $currentUser['id']) {
        Response::json(403, ['message' => 'Vous ne possédez pas cette commande']);
    }
}

// Mise à jour du statut
$stmt = $pdo->prepare("UPDATE orders SET status = ? WHERE id = ?");
$stmt->execute([$data['status'], $orderId]);

if ($stmt->rowCount() > 0) {
    // Enregistrement dans l'historique
    $insertHistory = $pdo->prepare("
        INSERT INTO order_status_history (order_id, status, changed_by, notes)
        VALUES (?, ?, ?, ?)
    ");
    $insertHistory->execute([
        $orderId,
        $data['status'],
        $currentUser['id'],
        $data['notes'] ?? null
    ]);

    // Journalisation recommandée
    error_log("Statut commande $orderId changé à {$data['status']} par {$currentUser['id']}");

    Response::json(200, [
        'message' => 'Statut mis à jour',
        'new_status' => $data['status']
    ]);
} else {
    Response::json(404, ['message' => 'Commande non trouvée ou statut identique']);
}