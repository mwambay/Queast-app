<?php
header('Content-Type: application/json');

// Autoriser uniquement POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Méthode non autorisée']);
    exit;
}

// Vérifier le fichier
if (!isset($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) {
    http_response_code(400);
    echo json_encode(['error' => 'Aucun fichier ou erreur d’upload']);
    exit;
}

$file = $_FILES['image'];
$allowedTypes = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp'];
$mimeType = mime_content_type($file['tmp_name']);

if (!isset($allowedTypes[$mimeType])) {
    http_response_code(400);
    echo json_encode(['error' => 'Format d’image non supporté']);
    exit;
}

// Générer un nom de fichier unique
$ext = $allowedTypes[$mimeType];
$filename = 'resto_' . uniqid() . '.' . $ext;
$targetDir = __DIR__ . '/../../../images/restaurants/';
$targetPath = $targetDir . $filename;

// Créer le dossier si besoin
if (!is_dir($targetDir)) {
    mkdir($targetDir, 0775, true);
}

// Déplacer le fichier
if (!move_uploaded_file($file['tmp_name'], $targetPath)) {
    http_response_code(500);
    echo json_encode(['error' => 'Erreur lors de l’enregistrement du fichier']);
    exit;
}

// Construire l’URL accessible depuis le frontend
$imageUrl = '/images/restaurants/' . $filename;

echo json_encode(['url' => $imageUrl]);
exit;

?>