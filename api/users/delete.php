<?php
require_once __DIR__ . '/../../lib/database.php';
require_once __DIR__ . '/../../lib/Response.php';

$db = new Database();
$pdo = $db->getConnection();

parse_str(file_get_contents("php://input"), $data);
if (empty($data['id'])) {
    Response::json(400, ['message' => 'ID utilisateur requis']);
}

$stmt = $pdo->prepare("DELETE FROM users WHERE id = ?");
$stmt->execute([$data['id']]);

Response::json(200, ['message' => 'Utilisateur supprimé']);