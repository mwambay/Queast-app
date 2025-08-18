<?php
require_once __DIR__ . '/../../lib/database.php';
require_once __DIR__ . '/../../lib/Response.php';

// Récupérer l'id de la commande en GET
$orderId = $_GET['id'] ?? null;
if (!$orderId) {
    http_response_code(400);
    echo json_encode(['message' => 'ID commande requis']);
    exit;
}

$db = new Database();
$pdo = $db->getConnection();

// Récupérer le nom du fichier QR code depuis la commande
$stmt = $pdo->prepare("SELECT qr_code FROM orders WHERE id = ?");
$stmt->execute([$orderId]);
$order = $stmt->fetch();

if (!$order || empty($order['qr_code'])) {
    http_response_code(404);
    echo json_encode(['message' => 'QR code non trouvé pour cette commande']);
    exit;
}

// Chemin absolu du fichier QR code
$qrCodeFile = __DIR__ . '/../../qr_codes/' . $order['qr_code'];

if (!file_exists($qrCodeFile)) {
    http_response_code(404);
    echo json_encode(['message' => 'Fichier QR code introuvable']);
    exit;
}

// Envoi de l'image PNG
header('Content-Type: image/png');
header('Content-Disposition: inline; filename="' . $order['qr_code'] . '"');
readfile($qrCodeFile);
exit;
?>