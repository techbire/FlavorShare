<?php
// api/recipes.php - Recipe management API
require_once '../config/database.php';
require_once '../utils/functions.php';

// Handle different request methods
$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        getRecipes();
        break;
    case 'POST':
        if (isLoggedIn()) {
            addRecipe();
        } else {
            echo json_encode(['success' => false, 'message' => 'Please login to submit a recipe']);
        }
        break;
    default:
        echo json_encode(['success' => false, 'message' => 'Method not allowed']);
}

// Get recipes function
function getRecipes() {
    $conn = connectDB();
    
    // Check parameters
    $featured = isset($_GET['featured']) ? (int)$_GET['featured'] : 0;
    $popular = isset($_GET['popular']) ? (int)$_GET['popular'] : 0;
    $category_id = isset($_GET['category']) ? (int)$_GET['category'] : 0;
    $search = isset($_GET['q']) ? $_GET['q'] : '';
    $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 12;
    $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
    $offset = ($page - 1) * $limit;
    
    // Base query
    $query = "SELECT r.id, r.title, r.description, r.image, r.created_at, 
              c.name as category, u.name as author, 
              (SELECT COUNT(*) FROM reviews WHERE recipe_id = r.id) as reviews,
              (SELECT AVG(rating) FROM reviews WHERE recipe_id = r.id) as rating
              FROM recipes r
              JOIN categories c ON r.category_id = c.id
              JOIN users u ON r.user_id = u.id
              WHERE 1=1";
    
    // Add filters
    if ($featured) {
        $query .= " AND r.featured = 1";
    }
    
    if ($category_id) {
        $query .= " AND r.category_id = " . $category_id;
    }
    
    if ($search) {
        $search = $conn->real_escape_string($search);
        $query .= " AND (r.title LIKE '%$search%' OR r.description LIKE '%$search%')";
    }
    
    // Add sorting
    if ($popular) {
        $query .= " ORDER BY rating DESC, reviews DESC";
    } else {
        $query .= " ORDER BY r.created_at DESC";
    }
    
    // Add pagination
    $query .= " LIMIT $offset, $limit";
    
    $result = $conn->query($query);
    $recipes = [];
    
    if ($result) {
        while ($row = $result->fetch_assoc()) {
            // Format the rating to one decimal place
            if (isset($row['rating'])) {
                $row['rating'] = round($row['rating'] * 2) / 2; // Round to nearest 0.5
            } else {
                $row['rating'] = 0;
            }
            $recipes[] = $row;
        }
    }
    
    // Count total recipes for pagination
    $count_query = "SELECT COUNT(*) as total FROM recipes r WHERE 1=1";
    if ($featured) {
        $count_query .= " AND r.featured = 1";
    }
    if ($category_id) {
        $count_query .= " AND r.category_id = " . $category_id;
    }

    if ($search) {
        $count_query .= " AND (r.title LIKE '%$search%' OR r.description LIKE '%$search%')";
    }
    
    $count_result = $conn->query($count_query);
    $total = ($count_result && $count_result->num_rows > 0) ? $count_result->fetch_assoc()['total'] : 0;
    $total_pages = ceil($total / $limit);
    
    echo json_encode([
        'success' => true,
        'recipes' => $recipes,
        'pagination' => [
            'current_page' => $page,
            'total_pages' => $total_pages,
            'total_recipes' => $total
        ]
    ]);
    
    $conn->close();
}

// Add recipe function
function addRecipe() {
    $conn = connectDB();
    
    // Get form data
    $title = isset($_POST['title']) ? sanitizeInput($_POST['title']) : '';
    $category_id = isset($_POST['category']) ? (int)$_POST['category'] : 0;
    $description = isset($_POST['description']) ? sanitizeInput($_POST['description']) : '';
    $ingredients = isset($_POST['ingredients']) ? $_POST['ingredients'] : '';
    $steps = isset($_POST['steps']) ? $_POST['steps'] : '';
    $user_id = $_SESSION['user_id'];
    
   // Validate input
if (empty($title) || empty($category_id) || empty($ingredients) || empty($steps)) {
    // Add debug information
    echo json_encode([
        'success' => false, 
        'message' => 'Title, category, ingredients and steps are required',
        'debug' => [
            'title' => $title,
            'category_id' => $category_id,
            'ingredients_set' => isset($_POST['ingredients']),
            'steps_set' => isset($_POST['steps'])
        ]
    ]);
    return;
}
    
    // Handle image upload
    $image_path = '';
    if (isset($_FILES['image']) && $_FILES['image']['error'] == 0) {
        $target_dir = "../uploads/recipes/";
        
        // Create directory if it doesn't exist
        if (!file_exists($target_dir)) {
            mkdir($target_dir, 0777, true);
        }
        
        $file_extension = pathinfo($_FILES['image']['name'], PATHINFO_EXTENSION);
        $file_name = uniqid() . '.' . $file_extension;
        $target_file = $target_dir . $file_name;
        
        // Check if file is an image
        $check = getimagesize($_FILES['image']['tmp_name']);
        if ($check === false) {
            echo json_encode(['success' => false, 'message' => 'File is not an image']);
            return;
        }
        
        // Check file size (limit to 5MB)
        if ($_FILES['image']['size'] > 5000000) {
            echo json_encode(['success' => false, 'message' => 'Image file is too large (max 5MB)']);
            return;
        }
        
        // Allow only certain file formats
        $allowed_extensions = ['jpg', 'jpeg', 'png', 'gif'];
        if (!in_array(strtolower($file_extension), $allowed_extensions)) {
            echo json_encode(['success' => false, 'message' => 'Only JPG, JPEG, PNG & GIF files are allowed']);
            return;
        }
        
        // Upload file
        if (move_uploaded_file($_FILES['image']['tmp_name'], $target_file)) {
            $image_path = 'uploads/recipes/' . $file_name;
        } else {
            echo json_encode(['success' => false, 'message' => 'Failed to upload image']);
            return;
        }
    }
    
    $featured = 0; // Default to not featured
    $stmt = $conn->prepare("INSERT INTO recipes (title, description, ingredients, steps, image, user_id, category_id, featured) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
    $stmt->bind_param("sssssiis", $title, $description, $ingredients, $steps, $image_path, $user_id, $category_id, $featured);

    // Insert recipe into database

    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Recipe added successfully']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to add recipe: ' . $conn->error]);
    }
    
    $stmt->close();
    $conn->close();
}
?>