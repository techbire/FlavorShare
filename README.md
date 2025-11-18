# FlavorShare - Recipe Sharing Community

FlavorShare is a modern, responsive web application that allows food enthusiasts to share, discover, and rate recipes from around the world. Built with PHP, MySQL, and vanilla JavaScript, it provides a seamless experience for managing culinary creations.

## Features

### 🍳 Core Functionality
- **Recipe Sharing**: Upload and share your favorite recipes with the community
- **Browse & Search**: Discover recipes by category or search functionality
- **Rating System**: Rate recipes and see average ratings from the community
- **Featured Recipes**: Highlight exceptional recipes in a dedicated section
- **Category Filtering**: Filter recipes by categories (Breakfast, Lunch, Dinner, Dessert, Vegetarian, Vegan, Quick & Easy)

### 👤 User Management
- User registration and authentication
- Secure login/logout functionality
- User-specific features (delete own recipes, rate recipes)
- Session management

### 📱 User Interface
- Responsive design that works on desktop, tablet, and mobile devices
- Modern UI with Tailwind CSS
- Smooth animations and transitions
- Interactive modals for login, registration, and recipe upload
- Toast notifications for user feedback
- Video background on hero section

### 🎯 Additional Features
- Newsletter subscription
- Recipe image upload with drag-and-drop support
- Dynamic ingredient and step management
- Category-based recipe organization

## Technology Stack

### Frontend
- **HTML5**: Semantic markup
- **CSS3**: Custom styles with Tailwind CSS framework
- **JavaScript**: Vanilla JS for dynamic functionality
- **Font Awesome**: Icons
- **Tailwind CSS**: Utility-first CSS framework

### Backend
- **PHP**: Server-side scripting
- **MySQL**: Database management
- **Session Management**: User authentication

## Project Structure

```
FlavorShare/
├── index.html              # Main landing page
├── app.js                  # Frontend JavaScript logic
├── styles.css              # Custom CSS styles
├── setup.php               # Database and directory setup script
├── api/                    # Backend API endpoints
│   ├── auth.php            # Authentication (login/register/logout)
│   ├── categories.php      # Category management
│   ├── check_login.php     # Login status verification
│   ├── delete_recipe.php   # Recipe deletion
│   ├── feature_recipe.php  # Mark recipes as featured
│   ├── newsletter.php      # Newsletter subscription
│   ├── rate_recipe.php     # Recipe rating system
│   ├── recipe_detail.php   # Individual recipe details
│   └── recipes.php         # Recipe CRUD operations
├── config/
│   └── database.php        # Database configuration and connection
├── uploads/                # User-uploaded content
│   ├── categories/         # Category images
│   └── recipes/            # Recipe images
└── utils/
    └── functions.php       # Helper functions
```

## Installation

### Prerequisites
- PHP 7.4 or higher
- MySQL 5.7 or higher
- Apache or Nginx web server
- GD Library (for image processing)

### Setup Instructions

1. **Clone or Download the Repository**
   ```bash
   git clone <repository-url>
   cd FlavorShare
   ```

2. **Configure Database**
   - Open `config/database.php`
   - Update database credentials:
     ```php
     $host = 'localhost';
     $dbname = 'flavorshare';
     $username = 'your_username';
     $password = 'your_password';
     ```

3. **Run Setup Script**
   - Navigate to `http://localhost/FlavorShare/setup.php` in your browser
   - This will:
     - Create necessary directories
     - Initialize database tables
     - Generate placeholder category images

4. **Configure Web Server**
   - Ensure the `uploads/` directory has write permissions:
     ```bash
     chmod -R 777 uploads/
     ```

5. **Access the Application**
   - Open `http://localhost/FlavorShare/` in your web browser

## Database Schema

The application uses the following main tables:

### Users Table
- `id`: Primary key
- `name`: User's full name
- `email`: User's email (unique)
- `password`: Hashed password
- `created_at`: Registration timestamp

### Recipes Table
- `id`: Primary key
- `user_id`: Foreign key to users
- `title`: Recipe title
- `description`: Recipe description
- `category_id`: Foreign key to categories
- `ingredients`: JSON array of ingredients
- `steps`: JSON array of preparation steps
- `image`: Image file path
- `featured`: Featured status (0/1)
- `created_at`: Creation timestamp

### Categories Table
- `id`: Primary key
- `name`: Category name
- `image`: Category image path

### Ratings Table
- `id`: Primary key
- `recipe_id`: Foreign key to recipes
- `user_id`: Foreign key to users
- `rating`: Rating value (1-5)
- `created_at`: Rating timestamp

### Newsletter Table
- `id`: Primary key
- `email`: Subscriber email (unique)
- `subscribed_at`: Subscription timestamp

## API Endpoints

### Authentication
- `POST /api/auth.php?action=register` - Register new user
- `POST /api/auth.php?action=login` - User login
- `POST /api/auth.php?action=logout` - User logout

### Recipes
- `GET /api/recipes.php` - Get all recipes
- `GET /api/recipes.php?featured=1` - Get featured recipes
- `GET /api/recipes.php?category=<id>` - Get recipes by category
- `POST /api/recipes.php` - Create new recipe (requires authentication)
- `POST /api/delete_recipe.php` - Delete recipe (owner only)
- `GET /api/recipe_detail.php?id=<id>` - Get recipe details

### Categories
- `GET /api/categories.php` - Get all categories

### Ratings
- `POST /api/rate_recipe.php` - Rate a recipe (requires authentication)

### Featured
- `POST /api/feature_recipe.php` - Mark recipe as featured (owner only)

### Newsletter
- `POST /api/newsletter.php` - Subscribe to newsletter

## Usage Guide

### For Users

1. **Creating an Account**
   - Click "Login" or "Create Account" button
   - Fill in the registration form
   - Login with your credentials

2. **Uploading a Recipe**
   - Click "Share Recipe" in the navigation
   - Fill in recipe details:
     - Title and category
     - Description
     - Ingredients (add multiple with amounts)
     - Preparation steps
     - Upload an image
   - Click "Share Recipe" to publish

3. **Browsing Recipes**
   - Scroll through all recipes on the homepage
   - Use category filters to narrow down results
   - Click "View Recipe" to see full details

4. **Rating Recipes**
   - Open any recipe detail
   - Click on the stars to rate (1-5 stars)
   - Your rating is saved immediately

5. **Managing Your Recipes**
   - Your recipes show a "Delete Recipe" button
   - Click "Get Featured" to highlight exceptional recipes
   - Featured recipes appear in the featured section

### For Developers

1. **Adding New Features**
   - API endpoints are in the `/api` directory
   - Frontend logic is in `app.js`
   - Database functions are in `config/database.php`

2. **Customizing Styles**
   - Modify `styles.css` for custom CSS
   - Tailwind utility classes are used throughout
   - Update color scheme in both CSS and Tailwind classes

3. **Database Modifications**
   - Update table schemas in `config/database.php`
   - Run `setup.php` to apply changes

## Security Features

- Password hashing using PHP's `password_hash()`
- SQL injection prevention using prepared statements
- Session-based authentication
- File upload validation
- CSRF protection considerations

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Known Limitations

- Image uploads limited to standard web formats (JPG, PNG, GIF)
- No email verification for user registration
- Basic search functionality (full-text search not implemented)
- No recipe editing functionality

## Future Enhancements

- [ ] Recipe editing functionality
- [ ] User profile pages
- [ ] Recipe comments and discussions
- [ ] Social sharing features
- [ ] Email notifications
- [ ] Advanced search with filters
- [ ] Recipe collections/favorites
- [ ] Print-friendly recipe view
- [ ] Ingredient shopping list generator

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is open source and available under the [MIT License](LICENSE).

## Support

For issues, questions, or suggestions:
- Email: anshtechnical@gmail.com
- Create an issue in the repository

## Credits

- **Icons**: Font Awesome
- **CSS Framework**: Tailwind CSS
- **Fonts**: System fonts for optimal performance

## Acknowledgments

Special thanks to all contributors and the open-source community for making this project possible.

---

**Enjoy cooking and sharing with FlavorShare! 🍳👨‍🍳👩‍🍳**
