<?php
require_once __DIR__ . '/../../lib/Response.php';

try {
    $userId = $_GET['id'] ?? null;
    if (!$userId) {
        Response::json(400, ['error' => 'ID utilisateur manquant']);
        return;
    }
    
    // Test simple sans base de données pour le moment
    Response::json(200, ['message' => 'Utilisateur supprimé avec succès (test)', 'id' => $userId]);
    
} catch (Exception $e) {
    Response::json(500, ['error' => 'Erreur lors de la suppression de l\'utilisateur: ' . $e->getMessage()]);
}