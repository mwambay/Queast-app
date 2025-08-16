<?php
require_once __DIR__ . '/../../lib/database.php';
require_once __DIR__ . '/../../lib/auth.php';  // Version sans JWT
require_once __DIR__ . '/../../lib/Response.php';

// Initialisation session (pour consistance, même si endpoint public)
if (session_status() === PHP_SESSION_NONE) {
    session_start([
        'cookie_httponly' => true,
        'use_strict_mode' => true
    ]);
}

$db = new Database();
$pdo = $db->getConnection();

// Récupération utilisateur (optionnelle pour statistiques)
$currentUser = Auth::getCurrentUser(); // Retourne null si non connecté

// Journalisation de l'accès (optionnel)
if ($currentUser) {
    error_log("Accès à la liste des restaurants par utilisateur {$currentUser['id']} ({$currentUser['role']})");
}

// Requête sécurisée avec gestion d'erreurs
try {
    $stmt = $pdo->query("
        SELECT 
            id, 
            name, 
            address, 
            phone, 
            image_url,
            is_active
        FROM restaurants 
        WHERE is_active = TRUE
        ORDER BY name ASC
    ");

    $restaurants = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Formatage des données (image par défaut si manquante)
    array_walk($restaurants, function (&$restaurant) {
        $restaurant['image_url'] = $restaurant['image_url'] ?: '/images/default-restaurant.jpg';
    });

    // Cache control (performances)
    header('Cache-Control: public, max-age=3600'); // Cache 1h

    Response::json(200, [
        'count' => count($restaurants),
        'restaurants' => $restaurants,
        'meta' => [
            'user' => $currentUser ? [
                'id' => $currentUser['id'],
                'role' => $currentUser['role']
            ] : null,
            'generated_at' => date('c')
        ]
    ]);

} catch (PDOException $e) {
    error_log("Erreur DB: " . $e->getMessage());
    Response::json(500, [
        'message' => 'Erreur serveur',
        'error_code' => 'database_error'
    ]);
}