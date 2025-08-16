<?php
require_once __DIR__ . '/lib/database.php';
require_once __DIR__ . '/lib/auth.php';
require_once __DIR__ . '/lib/Response.php';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    // Répondre aux requêtes préflight
    http_response_code(200);
    exit;
}
// Démarrer les sessions
session_start([
    'cookie_secure' => true,    // Activez seulement en HTTPS
    'cookie_httponly' => true,  // Protection contre XSS
    'use_strict_mode' => true   // Sécurité renforcée
]);

// Nouvelle fonction pour vérifier l'authentification
function checkAuth() {
    if (empty($_SESSION['user'])) {
        Response::json(401, ['error' => 'Non authentifié']);
        exit;
    }
    return $_SESSION['user'];
}

$requestUri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$requestMethod = $_SERVER['REQUEST_METHOD'];
// Enlever le préfixe du dossier si besoin
$basePath = '/quest-backend';
if (strpos($requestUri, $basePath) === 0) {
    $requestUri = substr($requestUri, strlen($basePath));
    if ($requestUri === '') $requestUri = '/';
}
// Routeur modifié
$routes = [
    'POST' => [
        '/auth/register' => 'api/auth/register.php',
        '/auth/login' => 'api/auth/login.php',
        '/commandes' => function() { checkAuth(); require 'api/commandes/index.php'; },
        '/livraison/valider' => function() { checkAuth(); require 'api/livraison/valider.php'; }
    ],
    'GET' => [
        '/restaurants' => 'api/restaurants/index.php',
        '/restaurants/plats' => 'api/restaurants/plats.php',
        '/commandes/client' => function() { checkAuth(); require 'api/commandes/client.php'; },
        '/commandes/livreur' => function() { checkAuth(); require 'api/commandes/livreur.php'; },
        '/commandes/historique' => function() { checkAuth(); require 'api/commandes/historique.php'; },
        '/users' => function() { require 'api/users/index.php'; }
          
    ],
    'PUT' => [
        '/commandes/status' => function() { checkAuth(); require 'api/commandes/status.php'; },
         '/users' => function() { require 'api/users/update.php'; } 
    ],
    'DELETE' => [
    '/users' => function() { require 'api/users/delete.php'; } // <-- Suppression sans auth pour les tests
    ]
];

// Gestion des routes
if (isset($routes[$requestMethod])) {
    foreach ($routes[$requestMethod] as $route => $handler) {
        if ($requestUri === $route) {
            is_callable($handler) ? $handler() : require __DIR__ . '/' . $handler;
            exit;
        }
    }
}

Response::json(404, ['message' => 'Endpoint non trouvé']);