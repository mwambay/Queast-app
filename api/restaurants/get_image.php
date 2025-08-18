<?php
require_once __DIR__ . '/../../lib/database.php';

// Récupérer l'id du restaurant en GET
$restaurantId = $_GET['id'] ?? null;
if (!$restaurantId) {
    http_response_code(400);
    echo json_encode(['message' => 'ID restaurant requis']);
    exit;
}

$db = new Database();
$pdo = $db->getConnection();

// Récupérer le nom du fichier image depuis la table restaurants
$stmt = $pdo->prepare("SELECT image_url FROM restaurants WHERE id = ?");
$stmt->execute([$restaurantId]);
$restaurant = $stmt->fetch();

if (!$restaurant || empty($restaurant['image_url'])) {
    http_response_code(404);
    echo json_encode(['message' => 'Image non trouvée pour ce restaurant']);
    exit;
}

// Chemin absolu du fichier image
$imageFile = __DIR__ . '/../../images/restaurants' . ltrim($restaurant['image_url'], '/');

if (!file_exists($imageFile)) {
    http_response_code(404);
    echo json_encode(['message' => 'Fichier image introuvable']);
    exit;
}

// Envoi de l'image (PNG ou JPEG selon l'extension)
$ext = strtolower(pathinfo($imageFile, PATHINFO_EXTENSION));
if ($ext === 'png') {
    header('Content-Type: image/png');
} else {
    header('Content-Type: image/jpeg');
}
header('Content-Disposition: inline; filename="' . basename($imageFile) . '"');
readfile($imageFile);
exit;

?>