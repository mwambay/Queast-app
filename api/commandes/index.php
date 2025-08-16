<?php
require_once __DIR__ . '/../../lib/database.php';
require_once __DIR__ . '/../../lib/auth.php'; // Version modifiée sans JWT
require_once __DIR__ . '/../../lib/Response.php';
require_once __DIR__ . '/../../lib/QRCode.php';

// Démarrer la session si pas déjà fait
if (session_status() === PHP_SESSION_NONE) {
    session_start([
        'cookie_httponly' => true,
        'use_strict_mode' => true
    ]);
}

$db = new Database();
$pdo = $db->getConnection();

// Récupérer l'utilisateur actuel via session
$currentUser = Auth::getCurrentUser();

// Vérification d'authentification et de rôle
if (!$currentUser || $currentUser['role'] !== 'client') {
    Response::json(403, ['message' => 'Accès réservé aux clients']);
}

$data = json_decode(file_get_contents("php://input"), true);

// Validation des données (inchangé)
if (empty($data['restaurant_id']) || empty($data['items'])) {
    Response::json(400, ['message' => 'Restaurant ID et items sont requis']);
}

// Démarrer une transaction
$pdo->beginTransaction();

try {
    // Calcul du prix total (inchangé)
    $totalPrice = array_reduce($data['items'], function($sum, $item) {
        return $sum + ($item['price'] * $item['quantity']);
    }, 0);

    // Création de la commande (modifié pour utiliser $currentUser)
    $stmt = $pdo->prepare("INSERT INTO orders (user_id, restaurant_id, status, total_price, delivery_address) VALUES (?, ?, 'pending', ?, ?)");
    $stmt->execute([$currentUser['id'], $data['restaurant_id'], $totalPrice, $data['delivery_address']]);
    $commandeId = $pdo->lastInsertId();

    if (empty($data['restaurant_id']) || empty($data['items']) || empty($data['delivery_address'])) {
        Response::json(400, ['message' => 'Restaurant ID, items et delivery_address sont requis']);
    }
    // Ajout des items (inchangé)
    $stmt = $pdo->prepare("INSERT INTO order_items (order_id, menu_item_id, quantity, price) VALUES (?, ?, ?, ?)");
    foreach ($data['items'] as $item) {
        $stmt->execute([$commandeId, $item['id'], $item['quantity'], $item['price']]);
    }

    // Génération QR code (adapté)
    $qrCode = QRCodeGenerator::generateOrderQRCode($commandeId, $currentUser['id']);

    $pdo->commit();

    Response::json(201, [
        'message' => 'Commande créée avec succès',
        'commande_id' => $commandeId,
        'qr_code' => $qrCode
    ]);
} catch (Exception $e) {
    $pdo->rollBack();
    Response::json(500, ['message' => 'Erreur lors de la création de la commande: ' . $e->getMessage()]);
}