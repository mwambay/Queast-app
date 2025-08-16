<?php
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../lib/database.php';
require_once __DIR__ . '/../../lib/Response.php';

try {
    $userId = $_GET['id'] ?? null;
    if (!$userId) {
        Response::json(400, ['error' => 'ID utilisateur manquant']);
        return;
    }
    
    $input = json_decode(file_get_contents('php://input'), true);
    if (!$input) {
        Response::json(400, ['error' => 'Données manquantes']);
        return;
    }
    
    $db = new Database();
    $pdo = $db->getConnection();
    
    // Vérifier que l'utilisateur existe
    $stmt = $pdo->prepare("SELECT id FROM users WHERE id = ?");
    $stmt->execute([$userId]);
    if (!$stmt->fetch()) {
        Response::json(404, ['error' => 'Utilisateur non trouvé']);
        return;
    }
    
    // Construire la requête de mise à jour
    $updateFields = [];
    $params = [];
    
    if (isset($input['name'])) {
        $updateFields[] = "name = ?";
        $params[] = $input['name'];
    }
    
    if (isset($input['email'])) {
        // Vérifier si l'email existe déjà pour un autre utilisateur
        $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ? AND id != ?");
        $stmt->execute([$input['email'], $userId]);
        if ($stmt->fetch()) {
            Response::json(409, ['error' => 'Cet email est déjà utilisé']);
            return;
        }
        $updateFields[] = "email = ?";
        $params[] = $input['email'];
    }
    
    if (isset($input['role'])) {
        $updateFields[] = "role = ?";
        $params[] = $input['role'];
    }
    
    if (isset($input['phone'])) {
        $updateFields[] = "phone = ?";
        $params[] = $input['phone'];
    }
    
    if (isset($input['password']) && !empty($input['password'])) {
        $updateFields[] = "password = ?";
        $params[] = password_hash($input['password'], PASSWORD_DEFAULT);
    }
    
    if (empty($updateFields)) {
        Response::json(400, ['error' => 'Aucune donnée à mettre à jour']);
        return;
    }
    
    $updateFields[] = "updated_at = NOW()";
    $params[] = $userId;
    
    $sql = "UPDATE users SET " . implode(', ', $updateFields) . " WHERE id = ?";
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    
    // Récupérer l'utilisateur mis à jour
    $stmt = $pdo->prepare("SELECT id, name, email, role, phone, created_at FROM users WHERE id = ?");
    $stmt->execute([$userId]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    Response::json(200, $user);
    
} catch (Exception $e) {
    Response::json(500, ['error' => 'Erreur lors de la mise à jour de l\'utilisateur: ' . $e->getMessage()]);
}