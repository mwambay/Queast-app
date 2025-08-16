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

$data = json_decode(file_get_contents("php://input"), true);

// Validation des entrées
if (empty($data['order_id']) || empty($data['status'])) {
    Response::json(400, ['message' => 'ID commande et nouveau statut requis']);
}

$orderId = $data['order_id'];

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
$updateQuery = "UPDATE orders SET status = ?";
$updateParams = [$data['status']];

// Si on assigne un livreur (statut in_delivery avec delivery_person_id)
if (isset($data['delivery_person_id']) && !empty($data['delivery_person_id'])) {
    $updateQuery .= ", delivery_person_id = ?";
    $updateParams[] = $data['delivery_person_id'];
}

$updateQuery .= " WHERE id = ?";
$updateParams[] = $orderId;

$stmt = $pdo->prepare($updateQuery);
$stmt->execute($updateParams);

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
        $data['reason'] ?? null
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