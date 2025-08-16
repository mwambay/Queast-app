-- Utilisateurs
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('client', 'livreur', 'admin') NOT NULL,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Restaurants
CREATE TABLE restaurants (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    address TEXT NOT NULL,
    phone VARCHAR(20) NOT NULL,
    image_url VARCHAR(255),
    opening_hours JSON,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Plats/Menu
CREATE TABLE menu_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    restaurant_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    category VARCHAR(100),
    image_url VARCHAR(255),
    is_available BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE
) ENGINE=InnoDB;


-- Commandes
CREATE TABLE orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    restaurant_id INT NOT NULL,
    delivery_person_id INT,
    status ENUM(
        'pending',       -- En attente
        'preparing',     -- En préparation
        'ready',         -- Prête à être livrée
        'in_delivery',   -- En cours de livraison
        'delivered',     -- Livrée
        'cancelled'      -- Annulée
    ) DEFAULT 'pending',
    total_price DECIMAL(10,2) NOT NULL,
    delivery_address TEXT NOT NULL,
    qr_code VARCHAR(255),
    cancellation_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id),
    FOREIGN KEY (delivery_person_id) REFERENCES users(id)
) ENGINE=InnoDB;

-- Articles commandés
CREATE TABLE order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    menu_item_id INT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    special_requests TEXT,
    price DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (menu_item_id) REFERENCES menu_items(id)
) ENGINE=InnoDB;


-- Historique des statuts de commande
CREATE TABLE order_status_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    status ENUM('pending','preparing','ready','in_delivery','delivered','cancelled') NOT NULL,
    changed_by INT COMMENT 'ID utilisateur (admin/livreur) ou système',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Évaluations
CREATE TABLE ratings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    user_id INT NOT NULL,
    restaurant_rating TINYINT CHECK (restaurant_rating BETWEEN 1 AND 5),
    delivery_rating TINYINT CHECK (delivery_rating BETWEEN 1 AND 5),
    comments TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB;

-- ================================================================
-- DONNÉES DE TEST
-- ================================================================

-- Insertion des utilisateurs de test
INSERT INTO users (email, password, role, name, phone) VALUES
('admin@queast.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', 'Admin Principal', '+221 77 123 45 67'),
('marie.diop@email.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'client', 'Marie Diop', '+221 77 234 56 78'),
('amadou.ba@email.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'livreur', 'Amadou Ba', '+221 77 345 67 89'),
('fatou.sall@email.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'client', 'Fatou Sall', '+221 77 456 78 90'),
('ousmane.ndiaye@email.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'livreur', 'Ousmane Ndiaye', '+221 77 567 89 01'),
('aissatou.sy@email.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'client', 'Aïssatou Sy', '+221 77 678 90 12'),
('modou.fall@email.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'livreur', 'Modou Fall', '+221 77 789 01 23'),
('ndeye.thiam@email.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'client', 'Ndeye Thiam', '+221 77 890 12 34'),
('cheikh.diallo@email.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'livreur', 'Cheikh Diallo', '+221 77 901 23 45'),
('khadija.kane@email.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'client', 'Khadija Kane', '+221 77 012 34 56');

-- Insertion des restaurants de test
INSERT INTO restaurants (name, description, address, phone, image_url, opening_hours, is_active) VALUES
('Pizza Palace', 'La meilleure pizzeria de Dakar avec des pizzas artisanales cuites au feu de bois', 'Rue 12, Plateau, Dakar', '+221 33 123 45 67', '/images/restaurants/pizza-palace.jpg', '{"lundi": "11:00-23:00", "mardi": "11:00-23:00", "mercredi": "11:00-23:00", "jeudi": "11:00-23:00", "vendredi": "11:00-00:00", "samedi": "11:00-00:00", "dimanche": "12:00-22:00"}', TRUE),
('Burger House', 'Des burgers gourmets avec des ingrédients frais et locaux', 'Avenue Cheikh Anta Diop, Dakar', '+221 33 234 56 78', '/images/restaurants/burger-house.jpg', '{"lundi": "10:00-22:00", "mardi": "10:00-22:00", "mercredi": "10:00-22:00", "jeudi": "10:00-22:00", "vendredi": "10:00-23:00", "samedi": "10:00-23:00", "dimanche": "11:00-21:00"}', TRUE),
('Sushi Time', 'Restaurant japonais authentique avec des sushis frais du jour', 'Boulevard de la République, Dakar', '+221 33 345 67 89', '/images/restaurants/sushi-time.jpg', '{"lundi": "12:00-22:00", "mardi": "12:00-22:00", "mercredi": "12:00-22:00", "jeudi": "12:00-22:00", "vendredi": "12:00-23:00", "samedi": "12:00-23:00", "dimanche": "fermé"}', TRUE),
('Café Central', 'Café-restaurant convivial avec spécialités sénégalaises et internationales', 'Place de l''Indépendance, Dakar', '+221 33 456 78 90', '/images/restaurants/cafe-central.jpg', '{"lundi": "07:00-20:00", "mardi": "07:00-20:00", "mercredi": "07:00-20:00", "jeudi": "07:00-20:00", "vendredi": "07:00-21:00", "samedi": "08:00-21:00", "dimanche": "08:00-19:00"}', TRUE),
('Taco Libre', 'Cuisine mexicaine épicée avec des tacos authentiques', 'Rue Félix Faure, Dakar', '+221 33 567 89 01', '/images/restaurants/taco-libre.jpg', '{"lundi": "11:30-22:00", "mardi": "11:30-22:00", "mercredi": "11:30-22:00", "jeudi": "11:30-22:00", "vendredi": "11:30-23:00", "samedi": "11:30-23:00", "dimanche": "12:00-21:00"}', TRUE),
('Le Gourmet', 'Restaurant gastronomique avec une cuisine française raffinée', 'Corniche Ouest, Dakar', '+221 33 678 90 12', '/images/restaurants/le-gourmet.jpg', '{"lundi": "fermé", "mardi": "19:00-23:00", "mercredi": "19:00-23:00", "jeudi": "19:00-23:00", "vendredi": "19:00-00:00", "samedi": "19:00-00:00", "dimanche": "12:00-15:00"}', TRUE);

-- Insertion des plats/menu
INSERT INTO menu_items (restaurant_id, name, description, price, category, image_url, is_available) VALUES
-- Pizza Palace (restaurant_id = 1)
(1, 'Pizza Margherita', 'Tomate, mozzarella, basilic frais', 8500.00, 'Pizza', '/images/menu/pizza-margherita.jpg', TRUE),
(1, 'Pizza Pepperoni', 'Tomate, mozzarella, pepperoni épicé', 9500.00, 'Pizza', '/images/menu/pizza-pepperoni.jpg', TRUE),
(1, 'Pizza Quattro Stagioni', 'Tomate, mozzarella, jambon, champignons, olives, artichauts', 11000.00, 'Pizza', '/images/menu/pizza-quattro.jpg', TRUE),
(1, 'Calzone Classique', 'Pizza fermée avec jambon, mozzarella et tomate', 10000.00, 'Pizza', '/images/menu/calzone.jpg', TRUE),

-- Burger House (restaurant_id = 2)
(2, 'Burger Classic', 'Bœuf, salade, tomate, oignon, sauce maison', 7500.00, 'Burger', '/images/menu/burger-classic.jpg', TRUE),
(2, 'Cheese Burger', 'Bœuf, fromage cheddar, salade, tomate, cornichons', 8000.00, 'Burger', '/images/menu/cheeseburger.jpg', TRUE),
(2, 'Burger Bacon', 'Bœuf, bacon croustillant, fromage, salade, sauce BBQ', 9000.00, 'Burger', '/images/menu/burger-bacon.jpg', TRUE),
(2, 'Frites Maison', 'Pommes de terre fraîches coupées à la main', 3000.00, 'Accompagnement', '/images/menu/frites.jpg', TRUE),

-- Sushi Time (restaurant_id = 3)
(3, 'Sushi Saumon', '6 pièces de sushi au saumon frais', 12000.00, 'Sushi', '/images/menu/sushi-saumon.jpg', TRUE),
(3, 'Sushi Thon', '6 pièces de sushi au thon rouge', 13000.00, 'Sushi', '/images/menu/sushi-thon.jpg', TRUE),
(3, 'California Roll', '8 pièces avec avocat, concombre, surimi', 9500.00, 'Maki', '/images/menu/california-roll.jpg', TRUE),
(3, 'Plateau Mixte', 'Assortiment de 12 pièces variées', 18000.00, 'Plateau', '/images/menu/plateau-mixte.jpg', TRUE),

-- Café Central (restaurant_id = 4)
(4, 'Thieboudienne', 'Riz au poisson, légumes, sauce tomate sénégalaise', 6500.00, 'Plat Principal', '/images/menu/thieboudienne.jpg', TRUE),
(4, 'Yassa Poulet', 'Poulet mariné aux oignons et citron', 5500.00, 'Plat Principal', '/images/menu/yassa-poulet.jpg', TRUE),
(4, 'Café Touba', 'Café sénégalais traditionnel aux épices', 1500.00, 'Boisson', '/images/menu/cafe-touba.jpg', TRUE),
(4, 'Bissap', 'Jus d''hibiscus rafraîchissant', 2000.00, 'Boisson', '/images/menu/bissap.jpg', TRUE),

-- Taco Libre (restaurant_id = 5)
(5, 'Tacos Bœuf', '3 tacos au bœuf épicé, salsa, guacamole', 8500.00, 'Tacos', '/images/menu/tacos-boeuf.jpg', TRUE),
(5, 'Tacos Poulet', '3 tacos au poulet grillé, sauce piquante', 7500.00, 'Tacos', '/images/menu/tacos-poulet.jpg', TRUE),
(5, 'Quesadilla', 'Tortilla garnie de fromage et légumes', 6500.00, 'Quesadilla', '/images/menu/quesadilla.jpg', TRUE),
(5, 'Nachos Supreme', 'Chips de maïs, fromage fondu, jalapeños', 5500.00, 'Entrée', '/images/menu/nachos.jpg', TRUE),

-- Le Gourmet (restaurant_id = 6)
(6, 'Filet de Bœuf Wellington', 'Filet de bœuf en croûte, sauce aux champignons', 25000.00, 'Plat Principal', '/images/menu/beef-wellington.jpg', TRUE),
(6, 'Saumon Grillé', 'Pavé de saumon, légumes de saison, beurre blanc', 18000.00, 'Plat Principal', '/images/menu/saumon-grille.jpg', TRUE),
(6, 'Foie Gras Poêlé', 'Entrée raffinée avec compotée de figues', 15000.00, 'Entrée', '/images/menu/foie-gras.jpg', TRUE),
(6, 'Tarte Tatin', 'Dessert traditionnel français aux pommes', 8000.00, 'Dessert', '/images/menu/tarte-tatin.jpg', TRUE);

-- Insertion des commandes de test
INSERT INTO orders (user_id, restaurant_id, delivery_person_id, status, total_price, delivery_address, qr_code) VALUES
(2, 1, NULL, 'pending', 19000.00, 'Sicap Liberté, Villa 123, Dakar', 'QR001234567890'),
(4, 2, 3, 'in_delivery', 15500.00, 'Mermoz, Immeuble ABC, Appt 5, Dakar', 'QR001234567891'),
(6, 3, 5, 'delivered', 30000.00, 'Almadies, Résidence XYZ, Villa 7, Dakar', 'QR001234567892'),
(8, 4, NULL, 'pending', 12000.00, 'Medina, Rue 15, Maison 45, Dakar', 'QR001234567893'),
(2, 5, 7, 'preparing', 22000.00, 'Point E, Immeuble DEF, Appt 12, Dakar', 'QR001234567894'),
(10, 6, NULL, 'cancelled', 43000.00, 'Ngor, Villa Seaside, Dakar', 'QR001234567895');

-- Insertion des articles commandés
INSERT INTO order_items (order_id, menu_item_id, quantity, price) VALUES
-- Commande 1 (Pizza Palace)
(1, 1, 2, 8500.00), -- 2 Pizza Margherita
(1, 4, 1, 10000.00), -- 1 Calzone

-- Commande 2 (Burger House)
(2, 5, 1, 7500.00), -- 1 Burger Classic
(2, 6, 1, 8000.00), -- 1 Cheese Burger

-- Commande 3 (Sushi Time)
(3, 12, 1, 18000.00), -- 1 Plateau Mixte
(3, 9, 1, 12000.00), -- 1 Sushi Saumon

-- Commande 4 (Café Central)
(4, 13, 1, 6500.00), -- 1 Thieboudienne
(4, 14, 1, 5500.00), -- 1 Yassa Poulet

-- Commande 5 (Taco Libre)
(5, 17, 2, 8500.00), -- 2 Tacos Bœuf
(5, 19, 1, 5500.00), -- 1 Nachos Supreme

-- Commande 6 (Le Gourmet)
(6, 21, 1, 25000.00), -- 1 Filet de Bœuf Wellington
(6, 23, 1, 18000.00); -- 1 Saumon Grillé

-- Insertion de l'historique des statuts
INSERT INTO order_status_history (order_id, status, changed_by, notes) VALUES
(1, 'pending', NULL, 'Commande créée automatiquement'),
(2, 'pending', NULL, 'Commande créée automatiquement'),
(2, 'preparing', 1, 'Commande prise en charge par le restaurant'),
(2, 'ready', 1, 'Commande prête pour livraison'),
(2, 'in_delivery', 3, 'Prise en charge par le livreur Amadou Ba'),
(3, 'pending', NULL, 'Commande créée automatiquement'),
(3, 'preparing', 1, 'Commande en préparation'),
(3, 'ready', 1, 'Commande prête'),
(3, 'in_delivery', 5, 'En cours de livraison'),
(3, 'delivered', 5, 'Livraison terminée avec succès'),
(4, 'pending', NULL, 'Commande créée automatiquement'),
(5, 'pending', NULL, 'Commande créée automatiquement'),
(5, 'preparing', 1, 'Commande en cours de préparation'),
(6, 'pending', NULL, 'Commande créée automatiquement'),
(6, 'cancelled', 10, 'Annulée par le client');

-- Insertion des évaluations
INSERT INTO ratings (order_id, user_id, restaurant_rating, delivery_rating, comments) VALUES
(3, 6, 5, 4, 'Excellente qualité des sushis, livraison rapide. Je recommande !'),
(3, 6, 4, 5, 'Très bon restaurant, livreur très professionnel et ponctuel.');

-- ================================================================
-- INFORMATIONS UTILES
-- ================================================================
-- Mot de passe par défaut pour tous les comptes de test : "password"
-- Hash utilisé : $2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi
-- 
-- Comptes disponibles :
-- Admin : admin@queast.com / password
-- Clients : marie.diop@email.com, fatou.sall@email.com, aissatou.sy@email.com, ndeye.thiam@email.com, khadija.kane@email.com
-- Livreurs : amadou.ba@email.com, ousmane.ndiaye@email.com, modou.fall@email.com, cheikh.diallo@email.com