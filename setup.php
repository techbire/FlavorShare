<?php
require_once 'config/database.php';

// Create required directories
$dirs = [
    'uploads',
    'uploads/categories',
    'uploads/recipes'
];

foreach ($dirs as $dir) {
    if (!file_exists($dir)) {
        if (mkdir($dir, 0777, true)) {
            echo "Created directory: " . $dir . "<br>";
        } else {
            echo "Failed to create directory: " . $dir . "<br>";
        }
    }
}

// Function to initialize database tables
if (!function_exists('myInitTables')) {
    function myInitTables() {
        // Initialize database tables using the function from database.php
        if (function_exists('connectDB')) {
            $conn = connectDB();
            
            // Check if database.php has its own initTables function
            if (function_exists('initTables')) {
                // Call the built-in initTables function from database.php
                initTables();
                echo "Database and tables initialized successfully.<br>";
            } else {
                echo "Error: Required function initTables() not found.<br>";
            }
        } else {
            echo "Error: Database connection function not found.<br>";
        }
    }
}

// Run the initialization
myInitTables();

// Create placeholder images for categories if GD library is available
if (extension_loaded('gd')) {
    $categories = [
        'breakfast', 'lunch', 'dinner', 'dessert', 'vegetarian', 'vegan', 'quick'
    ];

    foreach ($categories as $category) {
        $filename = "uploads/categories/{$category}.jpg";
        
        if (!file_exists($filename)) {
            // Create a simple colored image
            $width = 400;
            $height = 250;
            $image = imagecreatetruecolor($width, $height);
            
            // Different background colors for different categories
            $colors = [
                'breakfast' => [255, 200, 100],  // Orange
                'lunch' => [100, 200, 100],      // Green
                'dinner' => [100, 100, 200],     // Blue
                'dessert' => [255, 150, 200],    // Pink
                'vegetarian' => [150, 255, 150], // Light Green
                'vegan' => [100, 255, 150],      // Teal
                'quick' => [255, 255, 150]       // Yellow
            ];
            
            // Use the color for this category or default to gray
            $rgb = isset($colors[$category]) ? $colors[$category] : [200, 200, 200];
            $color = imagecolorallocate($image, $rgb[0], $rgb[1], $rgb[2]);
            imagefill($image, 0, 0, $color);
            
            // Add text
            $text_color = imagecolorallocate($image, 50, 50, 50);
            $text = ucfirst($category);
            
            // Center the text
            $font = 5; // Built-in font
            $text_width = imagefontwidth($font) * strlen($text);
            $text_height = imagefontheight($font);
            $x = ($width - $text_width) / 2;
            $y = ($height - $text_height) / 2;
            
            imagestring($image, $font, $x, $y, $text, $text_color);
            
            // Save the image
            imagejpeg($image, $filename);
            imagedestroy($image);
            
            echo "Created placeholder image: " . $filename . "<br>";
        }
    }
} else {
    echo "Warning: GD library not available. Cannot generate category images.<br>";
    echo "Please manually create image files in the uploads/categories directory.<br>";
}

echo "Setup complete!";
?>