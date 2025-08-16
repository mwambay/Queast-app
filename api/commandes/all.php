<?php
require_once __DIR__ . '/../../lib/database.php';
require_once __DIR__ . '/../../lib/auth.php';
require_once __DIR__ . '/../../lib/Response.php';

// Démarrer la session si pas déjà fait
if (session_status() === PHP_SESSION_NONE) {
    session_start([
        'cookie_httponly' => true,
        'use_strict_mode' => true
    ]);
}

$db = new Database();
$pdo = $db->getConnection();

// Récupérer l'utilisateur actuel via session
$currentUser = Auth::getCurrentUser();

// Vérification d'authentification et de rôle admin
if (!$currentUser || $currentUser['role'] !== 'admin') {
    Response::json(403, ['message' => 'Accès réservé aux administrateurs']);
}

try {
    // Récupérer toutes les commandes avec les informations des utilisateurs et restaurants
    $stmt = $pdo->prepare("
        SELECT 
            o.id,
            o.user_id,
            o.restaurant_id,
            o.delivery_person_id,
            o.status,
            o.total_price,
            o.delivery_address,
            o.qr_code,
            o.cancellation_reason,
            o.created_at,
            o.updated_at,
            u.name as client_name,
            u.email as client_email,
            u.phone as client_phone,
            r.name as restaurant_name,
            r.address as restaurant_address,
            d.name as delivery_person_name,
            d.phone as delivery_person_phone
        FROM orders o
        LEFT JOIN users u ON o.user_id = u.id
        LEFT JOIN restaurants r ON o.restaurant_id = r.id
        LEFT JOIN users d ON o.delivery_person_id = d.id
        ORDER BY o.created_at DESC
    ");
    
    $stmt->execute();
    $commandes = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Pour chaque commande, récupérer les items
    foreach ($commandes as &$commande) {
        $stmt = $pdo->prepare("
            SELECT 
                oi.*,
                mi.name as menu_item_name,
                mi.description as menu_item_description,
                mi.category as menu_item_category
            FROM order_items oi
            LEFT JOIN menu_items mi ON oi.menu_item_id = mi.id
            WHERE oi.order_id = ?
        ");
        $stmt->execute([$commande['id']]);
        $commande['items'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    Response::json(200, [
        'success' => true,
        'data' => $commandes,
        'total' => count($commandes)
    ]);

} catch (Exception $e) {
    Response::json(500, ['message' => 'Erreur lors de la récupération des commandes: ' . $e->getMessage()]);
}