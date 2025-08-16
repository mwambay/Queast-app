<?php
require_once __DIR__ . '/../../lib/database.php';
require_once __DIR__ . '/../../lib/Response.php';

$db = new Database();
$pdo = $db->getConnection();

$data = json_decode(file_get_contents("php://input"), true);
if (empty($data['id'])) {
    Response::json(400, ['message' => 'ID utilisateur requis']);
}

$fields = [];
$params = [];
if (!empty($data['email'])) { $fields[] = 'email = ?'; $params[] = $data['email']; }
if (!empty($data['name'])) { $fields[] = 'name = ?'; $params[] = $data['name']; }
if (!empty($data['role'])) { $fields[] = 'role = ?'; $params[] = $data['role']; }
if (!empty($data['phone'])) { $fields[] = 'phone = ?'; $params[] = $data['phone']; }

if (empty($fields)) {
    Response::json(400, ['message' => 'Aucune donnée à modifier']);
}

$params[] = $data['id'];
$sql = "UPDATE users SET " . implode(', ', $fields) . " WHERE id = ?";
$stmt = $pdo->prepare($sql);
$stmt->execute($params);

Response::json(200, ['message' => 'Utilisateur modifié']);