<?php
// test_db.php
require __DIR__.'/vendor/autoload.php';

try {
    $db = new PDO(
        'mysql:host=localhost;dbname=queast_db',
        'root',
        ''  // Mot de passe vide par défaut dans Laragon
    );
    
    echo "✅ Connexion DB réussie!\n";
    
    // Test requête simple
    $stmt = $db->query("SELECT 1");
    $result = $stmt->fetch();
    print_r($result);
    
    // Voir les tables existantes
    $tables = $db->query("SHOW TABLES")->fetchAll(PDO::FETCH_COLUMN);
    echo "\n\nTables disponibles:\n";
    print_r($tables);

} catch (PDOException $e) {
    die("❌ ERREUR DB: " . $e->getMessage());
}