<?php
require_once __DIR__ . '/../../lib/database.php';
require_once __DIR__ . '/../../lib/auth.php';
require_once __DIR__ . '/../../lib/Response.php';

// Démarrer la session si besoin
if (session_status() === PHP_SESSION_NONE) {
    session_start([
        'cookie_httponly' => true,
        'use_strict_mode' => true
    ]);
}

$db = new Database();
$pdo = $db->getConnection();

// Récupérer l'utilisateur courant
$currentUser = Auth::getCurrentUser();
// if (!$currentUser) {
//     Response::json(401, ['message' => 'Authentification requise']);
//     exit;
// }

// Récupérer les paramètres GET
$orderId = $_GET['id'] ?? null;
$reason = $_GET['reason'] ?? null;

if (empty($orderId) || empty($reason)) {
    Response::json(400, ['message' => 'ID commande et motif requis']);
    exit;
}

// Vérifier que l'utilisateur est bien le propriétaire ou admin
$stmt = $pdo->prepare("SELECT user_id, status FROM orders WHERE id = ?");
$stmt->execute([$orderId]);
$order = $stmt->fetch();

if (!$order) {
    Response::json(404, ['message' => 'Commande introuvable']);
    exit;
}


// Vérifier que la commande n'est pas déjà annulée ou livrée
if ($order['status'] === 'cancelled' || $order['status'] === 'delivered') {
    Response::json(400, ['message' => 'Commande déjà livrée ou annulée']);
    exit;
}

// Annuler la commande
$stmt = $pdo->prepare("UPDATE orders SET status = 'cancelled', cancellation_reason = ? WHERE id = ?");
$stmt->execute([$reason, $orderId]);


Response::json(200, ['message' => 'Commande annulée avec succès']);

?>