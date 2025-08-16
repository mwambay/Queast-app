<?php
require_once __DIR__ . '/../config/database.php';
class Auth {
    public static function authenticate($userId, $role) {
        // Démarrer la session si pas déjà fait
        if (session_status() === PHP_SESSION_NONE) {
            session_start([
                'cookie_httponly' => true,
                'use_strict_mode' => true
            ]);
        }

        $_SESSION['user'] = [
            'id' => $userId,
            'role' => $role,
            'ip' => $_SERVER['REMOTE_ADDR'],
            'last_active' => time()
        ];

        // Protection contre la fixation de session
        session_regenerate_id(true);
    }

    public static function getCurrentUser() {
        if (empty($_SESSION['user'])) {
            return null;
        }
        
        $user = $_SESSION['user'];
        
        // Double vérification de sécurité
        $ipMatch = $user['ip'] === $_SERVER['REMOTE_ADDR'];
        $active = (time() - $user['last_active']) < 3600; // 1h d'inactivité max
        
        if (!$ipMatch || !$active) {
            self::logout();
            return null;
        }

        // Mise à jour du timestamp
        $_SESSION['user']['last_active'] = time();
        return $user;
    }

    public static function logout() {
        session_destroy();
    }
}