<?php
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../lib/auth.php';
require_once __DIR__ . '/../../lib/database.php';
require_once __DIR__ . '/../../lib/Response.php';

// Récupérer le corps de la requête JSON
$data = json_decode(file_get_contents('php://input'), true);

// Vérifier si les données requises sont présentes
if (!isset($data['name']) || !isset($data['email']) || !isset($data['password']) || !isset($data['role']) || !isset($data['phone'])) {
    Response::json(400, ['error' => 'Données incomplètes. Veuillez fournir name, email, password, role et phone.']);
    exit;
}

$name = $data['name'];
$email = $data['email'];
$password = $data['password'];
$role = $data['role'];
$phone = $data['phone'];

// Validation des données
if (empty($name) || empty($email) || empty($password) || empty($role) || empty($phone)) {
    Response::json(400, ['error' => 'Tous les champs sont obligatoires.']);
    exit;
}

// Validation du rôle
if (!in_array($role, ['client', 'livreur', 'admin'])) {
    Response::json(400, ['error' => 'Rôle invalide. Les rôles valides sont : client, livreur, admin.']);
    exit;
}

// Validation de l'email
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    Response::json(400, ['error' => 'Format d\'email invalide.']);
    exit;
}

// Vérification si l'email existe déjà
$db = new Database();
$pdo = $db->getConnection();

$checkEmailStmt = $pdo->prepare("SELECT id FROM users WHERE email = :email");
$checkEmailStmt->execute(['email' => $email]);

if ($checkEmailStmt->rowCount() > 0) {
    Response::json(409, ['error' => 'Cet email est déjà utilisé par un autre utilisateur.']);
    exit;
}

// Hachage du mot de passe
$password_hash = password_hash($password, PASSWORD_DEFAULT);

try {
    // Insertion de l'utilisateur
    $stmt = $pdo->prepare("
        INSERT INTO users (name, email, password, role, phone, created_at) 
        VALUES (:name, :email, :password, :role, :phone, NOW())
    ");
    
    $success = $stmt->execute([
        'name' => $name,
        'email' => $email,
        'password' => $password_hash,
        'role' => $role,
        'phone' => $phone
    ]);
    
    if ($success) {
        $userId = $pdo->lastInsertId();
        
        // Récupération de l'utilisateur créé
        $getUserStmt = $pdo->prepare("
            SELECT id, name, email, role, phone, created_at
            FROM users
            WHERE id = :id
        ");
        
        $getUserStmt->execute(['id' => $userId]);
        $user = $getUserStmt->fetch(PDO::FETCH_ASSOC);
        
        Response::json(201, $user);
    } else {
        Response::json(500, ['error' => 'Erreur lors de la création de l\'utilisateur.']);
    }
} catch (PDOException $e) {
    Response::json(500, ['error' => 'Erreur de base de données: ' . $e->getMessage()]);
}
