<?php
require_once __DIR__ . '/../../lib/database.php';
require_once __DIR__ . '/../../lib/auth.php'; // Version modifiée sans JWT
require_once __DIR__ . '/../../lib/Response.php';

// Initialisation session sécurisée
if (session_status() === PHP_SESSION_NONE) {
    session_start([
        'cookie_httponly' => true,    // Protection contre XSS
        'use_strict_mode' => true,    // Protection fixation session
        'cookie_samesite' => 'Strict' // Protection CSRF
    ]);
}

$db = new Database();
$pdo = $db->getConnection();

$data = json_decode(file_get_contents("php://input"), true);

// Validation des données
if (empty($data['email']) || empty($data['password'])) {
    Response::json(400, [
        'message' => 'Email et mot de passe requis',
        'error_code' => 'missing_credentials'
    ]);
}

// Récupération sécurisée de l'utilisateur
try {
    $stmt = $pdo->prepare("
        SELECT id, password, role 
        FROM users 
        WHERE email = ? 
        LIMIT 1
    ");
    $stmt->execute([$data['email']]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
} catch (PDOException $e) {
    error_log("Erreur login DB: " . $e->getMessage());
    Response::json(500, [
        'message' => 'Erreur serveur',
        'error_code' => 'database_error'
    ]);
}

// Vérification des identifiants
if (!$user || !password_verify($data['password'], $user['password'])) {
    // Journalisation des tentatives échouées (sécurité)
    error_log("Tentative de connexion échouée pour l'email: " . $data['email']);
    
    Response::json(401, [
        'message' => 'Identifiants incorrects',
        'error_code' => 'invalid_credentials'
    ]);
}

// Authentification par session
Auth::authenticate($user['id'], $user['role']);

// Journalisation de la connexion
error_log("Connexion réussie pour l'utilisateur ID: " . $user['id']);

Response::json(200, [
    'message' => 'Connexion réussie',
    'user' => [
        'id' => $user['id'],
        'role' => $user['role']
    ],
    'session' => [
        'id' => session_id(),
        'expires' => time() + (int)ini_get('session.gc_maxlifetime')
    ]
]);