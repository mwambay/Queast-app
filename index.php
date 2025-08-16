<?php
require_once __DIR__ . '/lib/database.php';
require_once __DIR__ . '/lib/auth.php';
require_once __DIR__ . '/lib/Response.php';

header("Access-Control-Allow-Origin: http://localhost:5175");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    // Répondre aux requêtes préflight
    http_response_code(200);
    exit;
}
// Démarrer les sessions
session_start([
    'cookie_secure' => false,   // false en développement HTTP, true en production HTTPS
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
        '/livraison/valider' => function() { checkAuth(); require 'api/livraison/valider.php'; },
        '/users' => function() { require 'api/users/create.php'; }, // Ajout d'utilisateur sans auth pour les tests
        '/restaurants' => function() { require 'api/restaurants/create.php'; }, // Ajout de restaurant
        '/menu-items' => function() { require 'api/menu_items/create.php'; } // Ajout de plat
    ],
    'GET' => [
        '/restaurants' => 'api/restaurants/index.php',
        '/restaurants/plats' => 'api/restaurants/plats.php',
        '/restaurant' => function() { require 'api/restaurants/get_one.php'; }, // Récupération d'un restaurant spécifique
        '/menu-items' => function() { require 'api/menu_items/index.php'; }, // Tous les plats
        '/menu-item' => function() { require 'api/menu_items/get_one.php'; }, // Un plat spécifique
        '/commandes' => function() { require 'api/commandes/all.php'; }, // Toutes les commandes (admin)
        '/commandes/client' => function() { checkAuth(); require 'api/commandes/client.php'; },
        '/commandes/livreur' => function() { checkAuth(); require 'api/commandes/livreur.php'; },
        '/commandes/historique' => function() { checkAuth(); require 'api/commandes/historique.php'; },
        '/users' => function() { require 'api/users/index.php'; }
    ],
    'PUT' => [
        '/commandes/status' => function() { checkAuth(); require 'api/commandes/statut.php'; },
        '/users' => function() { require 'api/users/update.php'; },
        '/restaurant' => function() { require 'api/restaurants/update.php'; }, // Mise à jour d'un restaurant
        '/menu-item' => function() { require 'api/menu_items/update.php'; } // Mise à jour d'un plat
    ],
    'DELETE' => [
        '/users' => function() { require 'api/users/delete.php'; }, // <-- Suppression sans auth pour les tests
        '/restaurant' => function() { require 'api/restaurants/delete.php'; }, // Suppression d'un restaurant
        '/menu-item' => function() { require 'api/menu_items/delete.php'; } // Suppression d'un plat
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