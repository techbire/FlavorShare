<?php
// config/database.php - Database configuration
define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_NAME', 'flavorshare');

// Create a database connection
function connectDB() {
    $conn = new mysqli(DB_HOST, DB_USER, DB_PASS);
    
    // Check connection
    if ($conn->connect_error) {
        die("Connection failed: " . $conn->connect_error);
    }
    
    // Create database if it doesn't exist
    $sql = "CREATE DATABASE IF NOT EXISTS " . DB_NAME;
    if ($conn->query($sql) !== TRUE) {
        die("Error creating database: " . $conn->error);
    }
    
    // Select the database
    $conn->select_db(DB_NAME);
    
    return $conn;
}

// Initialize database tables
function initTables() {
    $conn = connectDB();
    
    // Users table
    $sql = "CREATE TABLE IF NOT EXISTS users (
        id INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )";
    
    if ($conn->query($sql) !== TRUE) {
        die("Error creating users table: " . $conn->error);
    }
    
    // Categories table
    $sql = "CREATE TABLE IF NOT EXISTS categories (
        id INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(50) NOT NULL,
        image VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )";
    
    if ($conn->query($sql) !== TRUE) {
        die("Error creating categories table: " . $conn->error);
    }
    
    // Recipes table
    $sql = "CREATE TABLE IF NOT EXISTS recipes (
        id INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(100) NOT NULL,
        description TEXT,
        ingredients TEXT NOT NULL,
        steps TEXT NOT NULL,
        image VARCHAR(255),
        user_id INT(11) NOT NULL,
        category_id INT(11) NOT NULL,
        featured TINYINT(1) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (category_id) REFERENCES categories(id)
    )";
    
    if ($conn->query($sql) !== TRUE) {
        die("Error creating recipes table: " . $conn->error);
    }
    
    // Reviews table
    $sql = "CREATE TABLE IF NOT EXISTS reviews (
        id INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
        recipe_id INT(11) NOT NULL,
        user_id INT(11) NOT NULL,
        rating INT(1) NOT NULL,
        comment TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (recipe_id) REFERENCES recipes(id),
        FOREIGN KEY (user_id) REFERENCES users(id)
    )";
    
    if ($conn->query($sql) !== TRUE) {
        die("Error creating reviews table: " . $conn->error);
    }
    
    // Newsletter subscriptions table
    $sql = "CREATE TABLE IF NOT EXISTS newsletter (
        id INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(100) NOT NULL UNIQUE,
        subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )";
    
    if ($conn->query($sql) !== TRUE) {
        die("Error creating newsletter table: " . $conn->error);
    }
    
    // Insert default categories
    $categories = [
        ['name' => 'Breakfast', 'image' => 'uploads/categories/breakfast.jpg'],
        ['name' => 'Lunch', 'image' => 'uploads/categories/lunch.jpg'],
        ['name' => 'Dinner', 'image' => 'uploads/categories/dinner.jpg'],
        ['name' => 'Dessert', 'image' => 'uploads/categories/dessert.jpg'],
        ['name' => 'Vegetarian', 'image' => 'uploads/categories/vegetarian.jpg'],
        ['name' => 'Vegan', 'image' => 'uploads/categories/vegan.jpg'],
        ['name' => 'Quick & Easy', 'image' => 'uploads/categories/quick.jpg']
    ];
    
    foreach ($categories as $category) {
        $stmt = $conn->prepare("INSERT IGNORE INTO categories (name, image) VALUES (?, ?)");
        $stmt->bind_param("ss", $category['name'], $category['image']);
        $stmt->execute();
    }
    
    $conn->close();
}
?>