<?php
require_once __DIR__ . '/../../lib/database.php';
require_once __DIR__ . '/../../lib/auth.php';
require_once __DIR__ . '/../../lib/Response.php';

// Initialisation session sécurisée
if (session_status() === PHP_SESSION_NONE) {
    session_start([
        'cookie_httponly' => true,
        'use_strict_mode' => true,
        'cookie_samesite' => 'Strict'
    ]);
}

$db = new Database();
$pdo = $db->getConnection();

// // Authentification via session
// $currentUser = Auth::getCurrentUser();

// // Vérification rôle livreur
// if (!$currentUser || $currentUser['role'] !== 'livreur') {
//     Response::json(403, [
//         'message' => 'Accès réservé aux livreurs',
//         'error_code' => 'delivery_unauthorized'
//     ]);
// }

// // Récupération des données
$orderId = $_GET['id'] ?? null;
// $data = json_decode(file_get_contents("php://input"), true);

// // Validation des entrées
// if (!$orderId || empty($data['qr_code'])) {
//     Response::json(400, [
//         'message' => 'ID commande et QR code requis',
//         'error_code' => 'missing_parameters'
//     ]);
// }

// // Vérification de la commande
// $stmt = $pdo->prepare("
//     SELECT id, user_id, qr_code
//     FROM orders
//     WHERE id = ?
//     AND delivery_person_id = ?
//     AND status = 'in_delivery'
//     FOR UPDATE
// ");
// $stmt->execute([$orderId, $currentUser['id']]);
// $order = $stmt->fetch();

// if (!$order) {
//     Response::json(404, [
//         'message' => 'Commande non trouvée ou non assignée',
//         'error_code' => 'order_not_available'
//     ]);
// }

// // Vérification avancée du QR code
// $validQRPrefix = "queast_commande:$orderId:client:{$order['user_id']}:";
// if (strpos($data['qr_code'], $validQRPrefix) !== 0 || $data['qr_code'] !== $order['qr_code']) {
//     Response::json(400, [
//         'message' => 'QR code invalide ou expiré',
//         'error_code' => 'invalid_qrcode'
//     ]);
// }

// Validation de la livraison (avec transaction)
try {
    $pdo->beginTransaction();

    // 1. Mettre à jour le statut
    $stmt = $pdo->prepare("
        UPDATE orders
        SET status = 'delivered',
            updated_at = NOW()
        WHERE id = ?
    ");
    $stmt->execute([$orderId]);


    Response::json(200, [
        'message' => 'Livraison validée avec succès',
        'delivery_time' => date('c') // ISO 8601
    ]);

} catch (Exception $e) {
    $pdo->rollBack();
    Response::json(500, [
        'message' => 'Erreur lors de la validation',
        'error' => $e->getMessage(),
        'error_code' => 'validation_failed'
    ]);
}