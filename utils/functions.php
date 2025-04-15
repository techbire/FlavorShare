<?php
// utils/functions.php - Common utility functions
session_start();

// Check if user is logged in
function isLoggedIn() {
    return isset($_SESSION['user_id']);
}

// Get current user info
function getCurrentUser() {
    if (isLoggedIn()) {
        return [
            'id' => $_SESSION['user_id'],
            'name' => $_SESSION['user_name'],
            'email' => $_SESSION['user_email']
        ];
    }
    return null;
}

// Format date
function formatDate($date) {
    return date('F j, Y', strtotime($date));
}

// Truncate text
function truncateText($text, $length = 100) {
    if (strlen($text) <= $length) {
        return $text;
    }
    
    $text = substr($text, 0, $length);
    $text = substr($text, 0, strrpos($text, ' '));
    return $text . '...';
}

// Sanitize input
function sanitizeInput($data) {
    $data = trim($data);
    $data = stripslashes($data);
    $data = htmlspecialchars($data);
    return $data;
}

// Generate recipe card HTML
function generateRecipeCard($recipe, $showRating = true) {
    $ratingHtml = '';
    if ($showRating) {
        $stars = '';
        $rating = isset($recipe['rating']) ? $recipe['rating'] : 0;
        
        for ($i = 1; $i <= 5; $i++) {
            if ($i <= $rating) {
                $stars .= '<i class="fas fa-star"></i>';
            } else if ($i - 0.5 <= $rating) {
                $stars .= '<i class="fas fa-star-half-alt"></i>';
            } else {
                $stars .= '<i class="far fa-star"></i>';
            }
        }
        
        $ratingHtml = '
            <div class="flex items-center mt-2">
                <div class="star-rating flex">' . $stars . '</div>
                <span class="text-gray-600 text-sm ml-1">(' . $recipe['reviews'] . ' reviews)</span>
            </div>';
    }
    
    $imagePath = !empty($recipe['image']) ? $recipe['image'] : '/api/placeholder/400/250';
    
    return '
        <div class="recipe-card bg-white rounded-lg shadow-md overflow-hidden">
            <img src="' . $imagePath . '" alt="' . $recipe['title'] . '" class="w-full h-48 object-cover">
            <div class="p-4">
                <div class="flex justify-between items-start">
                    <h3 class="text-lg font-semibold text-gray-800">' . $recipe['title'] . '</h3>
                    <span class="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded">' . $recipe['category'] . '</span>
                </div>
                <p class="text-gray-600 text-sm mt-2">' . truncateText($recipe['description'], 100) . '</p>
                ' . $ratingHtml . '
                <div class="flex justify-between items-center mt-4">
                    <div class="flex items-center">
                        <img src="/api/placeholder/40/40" alt="User" class="w-6 h-6 rounded-full">
                        <span class="text-gray-700 text-sm ml-2">' . $recipe['author'] . '</span>
                    </div>
                    <a href="recipe.php?id=' . $recipe['id'] . '" class="text-green-600 hover:text-green-700 text-sm">View Recipe</a>
                </div>
            </div>
        </div>';
}

// Generate pagination links
function generatePagination($current_page, $total_pages, $base_url) {
    if ($total_pages <= 1) {
        return '';
    }
    
    $html = '<div class="flex justify-center mt-8">
                <nav class="inline-flex rounded-md shadow-sm">';
    
    // Previous button
    if ($current_page > 1) {
        $prev_url = $base_url . ($current_page - 1);
        $html .= '<a href="' . $prev_url . '" class="px-3 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                    Previous
                </a>';
    } else {
        $html .= '<span class="px-3 py-2 rounded-l-md border border-gray-300 bg-gray-100 text-sm font-medium text-gray-400 cursor-not-allowed">
                    Previous
                </span>';
    }
    
    // Page numbers
    $start = max(1, $current_page - 2);
    $end = min($total_pages, $current_page + 2);
    
    for ($i = $start; $i <= $end; $i++) {
        if ($i == $current_page) {
            $html .= '<span class="px-3 py-2 border border-gray-300 bg-green-500 text-sm font-medium text-white">
                        ' . $i . '
                    </span>';
        } else {
            $page_url = $base_url . $i;
            $html .= '<a href="' . $page_url . '" class="px-3 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                        ' . $i . '
                    </a>';
        }
    }
    
    // Next button
    if ($current_page < $total_pages) {
        $next_url = $base_url . ($current_page + 1);
        $html .= '<a href="' . $next_url . '" class="px-3 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                    Next
                </a>';
    } else {
        $html .= '<span class="px-3 py-2 rounded-r-md border border-gray-300 bg-gray-100 text-sm font-medium text-gray-400 cursor-not-allowed">
                    Next
                </span>';
    }
    
    $html .= '</nav></div>';
    
    return $html;
}
?>