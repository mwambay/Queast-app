<?php
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../lib/auth.php';
require_once __DIR__ . '/../../lib/database.php';
require_once __DIR__ . '/../../lib/Response.php';

$db = new Database();
$pdo = $db->getConnection();

$stmt = $pdo->query("SELECT id, email, name, role, phone, created_at FROM users");
$users = $stmt->fetchAll(PDO::FETCH_ASSOC);

Response::json(200, $users);