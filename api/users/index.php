<?php
require_once __DIR__ . '/../../lib/Response.php';

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        // Récupération des utilisateurs (version test sans BDD)
        $mockUsers = [
            ['id' => 1, 'name' => 'Admin Principal', 'email' => 'admin@queast.com', 'role' => 'admin', 'phone' => '+221 77 123 45 67', 'created_at' => '2025-08-16 10:00:00'],
            ['id' => 2, 'name' => 'Marie Diop', 'email' => 'marie.diop@email.com', 'role' => 'client', 'phone' => '+221 77 234 56 78', 'created_at' => '2025-08-16 10:05:00'],
            ['id' => 3, 'name' => 'Amadou Ba', 'email' => 'amadou.ba@email.com', 'role' => 'livreur', 'phone' => '+221 77 345 67 89', 'created_at' => '2025-08-16 10:10:00'],
            ['id' => 4, 'name' => 'Fatou Sall', 'email' => 'fatou.sall@email.com', 'role' => 'client', 'phone' => '+221 77 456 78 90', 'created_at' => '2025-08-16 10:15:00']
        ];
        Response::json(200, $mockUsers);
        break;
        
    case 'POST':
        try {
            $input = json_decode(file_get_contents('php://input'), true);
            
            if (!$input || !isset($input['name'], $input['email'], $input['password'], $input['role'], $input['phone'])) {
                Response::json(400, ['error' => 'Données manquantes']);
                return;
            }
            
            // Simuler la création d'un utilisateur (version test)
            $newUser = [
                'id' => rand(100, 999), // ID aléatoire pour le test
                'name' => $input['name'],
                'email' => $input['email'],
                'role' => $input['role'],
                'phone' => $input['phone'],
                'created_at' => date('Y-m-d H:i:s')
            ];
            
            Response::json(201, $newUser);
            
        } catch (Exception $e) {
            Response::json(500, ['error' => 'Erreur lors de la création de l\'utilisateur: ' . $e->getMessage()]);
        }
        break;
        
    default:
        Response::json(405, ['error' => 'Méthode non autorisée']);
        break;
}