<?php
require_once __DIR__ . '/../../lib/database.php';
require_once __DIR__ . '/../../lib/auth.php';  // Nouvelle version sans JWT
require_once __DIR__ . '/../../lib/Response.php';

// Démarrer la session (si pas déjà fait dans auth.php)
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

$db = new Database();
$pdo = $db->getConnection();

// Récupération de l'utilisateur connecté via session
$currentUser = Auth::getCurrentUser();  // Nouvelle méthode

// Vérification basique d'authentification
if (!$currentUser) {
    Response::json(401, ['message' => 'Non authentifié']);
    exit;
}

$clientId = $_GET['id'] ?? null;

if (!$clientId) {
    Response::json(400, ['message' => 'ID client requis']);
}

// Nouvelle vérification des permissions
if ($currentUser['id'] != $clientId && $currentUser['role'] !== 'admin') {
    Response::json(403, ['message' => 'Accès non autorisé']);
}

// La suite reste identique...
$stmt = $pdo->prepare("
    SELECT o.id, r.name as restaurant, o.status, o.total_price, o.created_at, o.qr_code
    FROM orders o
    JOIN restaurants r ON o.restaurant_id = r.id
    WHERE o.user_id = ?
    ORDER BY o.created_at DESC
");
$stmt->execute([$clientId]);
$commandes = $stmt->fetchAll(PDO::FETCH_ASSOC);

foreach ($commandes as &$commande) {
    $stmt = $pdo->prepare("
        SELECT mi.name, oi.quantity, oi.price
        FROM order_items oi
        JOIN menu_items mi ON oi.menu_item_id = mi.id
        WHERE oi.order_id = ?
    ");
    $stmt->execute([$commande['id']]);
    $commande['items'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
}
Response::json(200, $commandes);