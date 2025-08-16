<?php
require_once __DIR__ . '/../../lib/database.php';
require_once __DIR__ . '/../../lib/auth.php'; // Nouvelle version sans JWT
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

$data = json_decode(file_get_contents("php://input"), true);

// Validation renforcée
$requiredFields = ['email', 'password', 'role'];
foreach ($requiredFields as $field) {
    if (empty($data[$field])) {
        Response::json(400, [
            'message' => 'Tous les champs sont requis',
            'missing_field' => $field,
            'error_code' => 'missing_field'
        ]);
    }
}

// Validation du rôle
$validRoles = ['client', 'livreur', 'admin'];
if (!in_array($data['role'], $validRoles)) {
    Response::json(400, [
        'message' => 'Rôle invalide',
        'valid_roles' => $validRoles,
        'error_code' => 'invalid_role'
    ]);
}

// Vérification email unique
try {
    $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->execute([$data['email']]);
    
    if ($stmt->fetch()) {
        Response::json(409, [
            'message' => 'Email déjà utilisé',
            'error_code' => 'email_exists'
        ]);
    }
} catch (PDOException $e) {
    error_log("Erreur vérification email: " . $e->getMessage());
    Response::json(500, [
        'message' => 'Erreur serveur',
        'error_code' => 'database_error'
    ]);
}

// Création de l'utilisateur
try {
    $hashedPassword = password_hash($data['password'], PASSWORD_BCRYPT);
    
    $stmt = $pdo->prepare("
        INSERT INTO users 
        (email, password, role, name, phone, created_at) 
        VALUES (?, ?, ?, ?, ?, NOW())
    ");
    
    $stmt->execute([
        $data['email'],
        $hashedPassword,
        $data['role'],
        $data['name'] ?? null,
        $data['phone'] ?? null
    ]);
    
    $userId = $pdo->lastInsertId();
    
    // Authentification automatique
    Auth::authenticate($userId, $data['role']);
    
    // Journalisation
    error_log("Nouvel utilisateur créé: ID $userId, Rôle: {$data['role']}");
    
    Response::json(201, [
        'message' => 'Utilisateur créé avec succès',
        'user' => [
            'id' => $userId,
            'email' => $data['email'],
            'role' => $data['role']
        ],
        'session' => [
            'id' => session_id(),
            'expires' => time() + (int)ini_get('session.gc_maxlifetime')
        ]
    ]);

} catch (PDOException $e) {
    error_log("Erreur création utilisateur: " . $e->getMessage());
    Response::json(500, [
        'message' => 'Erreur lors de la création',
        'error' => $e->getMessage(),
        'error_code' => 'user_creation_failed'
    ]);
}