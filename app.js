// Main JavaScript for FlavorShare Recipe Application

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all components
    initApp();
});

// Main application initialization
function initApp() {
    // Check login status first
    checkLoginStatus();
    
    // Initialize UI components
    initNavbar();
    initModals();
    initRecipeForm();
    initSearchFunctionality();
    initCategoryFilters(); // Add this line
    initAnimations();
    
    // Load data
    loadAllRecipes();
    loadFeaturedRecipes();
    loadCategories();
    
    // Event listeners for main buttons
    initMainEventListeners();
}
// Initialize main page buttons
function initMainEventListeners() {
    // Discovery button scrolls to recipes section
    const discoverBtn = document.getElementById('discover-btn');
    if (discoverBtn) {
        discoverBtn.addEventListener('click', function() {
            document.getElementById('recent').scrollIntoView({ behavior: 'smooth' });
        });
    }
    
    // Initialize newsletter form if exists
    const newsletterForm = document.getElementById('newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = newsletterForm.querySelector('input[type="email"]').value;
            
            fetch('api/newsletter.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    showToast('Thanks for subscribing!');
                    newsletterForm.reset();
                } else {
                    showToast('Error: ' + data.message, 'error');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                showToast('An error occurred. Please try again.', 'error');
            });
        });
    }
}

// Load all recipes to display on page
// Update loadAllRecipes to reset any active filters when called

function loadAllRecipes() {
    const recentContainer = document.getElementById('recent-recipes');
    if (!recentContainer) return;
    
    // Show loading state
    recentContainer.innerHTML = '<div class="col-span-full text-center py-8"><p class="text-gray-500">Loading recipes...</p></div>';
    
    // Fetch recipes from server
    fetch('api/recipes.php')
        .then(response => response.json())
        .then(data => {
            if (data.success && data.recipes && data.recipes.length > 0) {
                renderRecipes(data.recipes, 'recent-recipes', true);
                
                // Reset any active filter indicators if this is called directly
                const filterInfo = document.querySelector('#category-filter .filter-info');
                if (filterInfo) {
                    filterInfo.classList.add('hidden');
                }
                
                // Reset filter button styling if needed
                const activeFilterButton = document.querySelector('#category-filter .filter-button.active');
                const allFilterButton = document.querySelector('#category-filter .filter-button[data-category="all"]');
                
                if (activeFilterButton && activeFilterButton !== allFilterButton && allFilterButton) {
                    // Reset all buttons
                    document.querySelectorAll('#category-filter .filter-button').forEach(btn => {
                        btn.classList.remove('active', 'bg-green-500', 'text-white');
                        btn.classList.add('bg-gray-200', 'text-gray-700', 'hover:bg-gray-300');
                    });
                    
                    // Set all button as active
                    allFilterButton.classList.add('active', 'bg-green-500', 'text-white');
                    allFilterButton.classList.remove('bg-gray-200', 'text-gray-700', 'hover:bg-gray-300');
                }
            } else {
                recentContainer.innerHTML = '<div class="col-span-full text-center py-8"><p class="text-gray-500">No recipes found</p></div>';
            }
        })
        .catch(error => {
            console.error('Error:', error);
            recentContainer.innerHTML = '<div class="col-span-full text-center py-8"><p class="text-red-500">An error occurred while loading recipes</p></div>';
        });
}

// More flexible loadRecipes function with options
function loadRecipes(containerId = 'recipe-container', options = {}) {
    const container = document.getElementById(containerId);
    if (!container) return Promise.resolve(false);
    
    // Show loading state
    container.innerHTML = '<div class="col-span-full text-center py-8"><p class="text-gray-500">Loading recipes...</p></div>';
    
    // Build query string
    const params = new URLSearchParams();
    
    if (options.featured) params.append('featured', options.featured);
    if (options.popular) params.append('popular', options.popular);
    if (options.category) params.append('category', options.category);
    if (options.search) params.append('q', options.search);
    if (options.page) params.append('page', options.page);
    if (options.limit) params.append('limit', options.limit);
    
    // Fetch recipes from the server
    return fetch(`api/recipes.php?${params.toString()}`)
        .then(response => response.json())
        .then(data => {
            if (data.success && data.recipes && data.recipes.length > 0) {
                // Show recipes
                const showRating = containerId === 'popular-recipes' || options.popular === 1;
                renderRecipes(data.recipes, containerId, showRating);
                
                // Show pagination if available and container exists
                const paginationContainer = document.getElementById(`${containerId}-pagination`);
                if (paginationContainer && data.pagination) {
                    renderPagination(data.pagination, containerId, options);
                }
                return true;
            } else {
                container.innerHTML = '<div class="col-span-full text-center py-8"><p class="text-gray-500">No recipes found</p></div>';
                return false;
            }
        })
        .catch(error => {
            console.error('Error:', error);
            container.innerHTML = '<div class="col-span-full text-center py-8"><p class="text-gray-500">An error occurred while loading recipes</p></div>';
            return false;
        });
}











// Add this function after loadCategories function

// Initialize category filters
// function initCategoryFilters() {
//     const filterContainer = document.getElementById('category-filter');
//     if (!filterContainer) return;
    
//     // Clear existing filters
//     filterContainer.innerHTML = '';
    
//     // Get categories data
//     fetch('api/categories.php')
//         .then(response => response.json())
//         .then(data => {
//             if (data.success && data.categories && data.categories.length > 0) {
//                 renderCategoryFilters(data.categories, filterContainer);
//             }
//         })
//         .catch(error => {
//             console.error('Error loading category filters:', error);
//             filterContainer.innerHTML = '<div class="text-center py-4"><p class="text-red-500">Failed to load filters</p></div>';
//         });
// }

// // Render category filter buttons
// function renderCategoryFilters(categories, container) {
//     // Create filter buttons wrapper
//     const buttonsWrapper = document.createElement('div');
//     buttonsWrapper.className = 'flex flex-wrap gap-2 mb-4';
    
//     // Add "All" button at the beginning
//     const allButton = document.createElement('button');
//     allButton.className = 'filter-button active bg-green-500 text-white px-4 py-2 rounded-full text-sm font-medium transition-all duration-300';
//     allButton.textContent = 'All';
//     allButton.dataset.category = 'all';
//     buttonsWrapper.appendChild(allButton);
    
//     // Add category buttons
//     categories.forEach(category => {
//         const button = document.createElement('button');
//         button.className = 'filter-button bg-gray-200 text-gray-700 hover:bg-gray-300 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300';
//         button.textContent = category.name;
//         button.dataset.category = category.id;
//         buttonsWrapper.appendChild(button);
//     });
    
//     // Create filter info container
//     const filterInfo = document.createElement('div');
//     filterInfo.className = 'filter-info hidden mb-4';
//     filterInfo.innerHTML = `
//         <div class="flex items-center justify-between">
//             <span id="active-filter" class="bg-green-100 text-green-800 px-3 py-1 rounded-lg text-sm">Showing: All</span>
//             <button id="clear-filter" class="bg-red-100 text-red-700 hover:bg-red-200 px-3 py-1 rounded-lg text-sm transition-all duration-300">
//                 Clear Filter
//             </button>
//         </div>
//     `;
    
//     // Add filter components to container
//     container.appendChild(buttonsWrapper);
//     container.appendChild(filterInfo);
    
//     // Add event listeners for filter buttons
//     const filterButtons = buttonsWrapper.querySelectorAll('.filter-button');
//     filterButtons.forEach(button => {
//         button.addEventListener('click', function() {
//             const categoryId = this.dataset.category;
            
//             // Update button states
//             filterButtons.forEach(btn => {
//                 btn.classList.remove('active', 'bg-green-500', 'text-white');
//                 btn.classList.add('bg-gray-200', 'text-gray-700', 'hover:bg-gray-300');
//             });
            
//             this.classList.add('active', 'bg-green-500', 'text-white');
//             this.classList.remove('bg-gray-200', 'text-gray-700', 'hover:bg-gray-300');
            
//             // Show/hide filter info
//             const filterInfo = container.querySelector('.filter-info');
//             const activeFilter = document.getElementById('active-filter');
            
//             if (categoryId === 'all') {
//                 filterInfo.classList.add('hidden');
//                 loadAllRecipes(); // Load all recipes
//             } else {
//                 filterInfo.classList.remove('hidden');
//                 activeFilter.textContent = `Showing: ${this.textContent}`;
//                 // Load filtered recipes
//                 loadRecipesByCategory(categoryId);
//             }
//         });
//     });
    
//     // Add clear filter functionality
//     const clearFilterBtn = document.getElementById('clear-filter');
//     if (clearFilterBtn) {
//         clearFilterBtn.addEventListener('click', function() {
//             // Reset buttons
//             filterButtons.forEach(btn => {
//                 btn.classList.remove('active', 'bg-green-500', 'text-white');
//                 btn.classList.add('bg-gray-200', 'text-gray-700', 'hover:bg-gray-300');
//             });
            
//             // Set "All" button as active
//             const allButton = buttonsWrapper.querySelector('[data-category="all"]');
//             if (allButton) {
//                 allButton.classList.add('active', 'bg-green-500', 'text-white');
//                 allButton.classList.remove('bg-gray-200', 'text-gray-700', 'hover:bg-gray-300');
//             }
            
//             // Hide filter info
//             container.querySelector('.filter-info').classList.add('hidden');
            
//             // Load all recipes
//             loadAllRecipes();
//         });
//     }
// }

// // Load recipes by category
// function loadRecipesByCategory(categoryId) {
//     const recentContainer = document.getElementById('recent-recipes');
//     if (!recentContainer) return;
    
//     // Show loading state
//     recentContainer.innerHTML = '<div class="col-span-full text-center py-8"><p class="text-gray-500">Loading recipes...</p></div>';
    
//     // Fetch recipes from server with category filter
//     fetch(`api/recipes.php?category=${categoryId}`)
//         .then(response => response.json())
//         .then(data => {
//             if (data.success && data.recipes && data.recipes.length > 0) {
//                 renderRecipes(data.recipes, 'recent-recipes', true);
//             } else {
//                 recentContainer.innerHTML = '<div class="col-span-full text-center py-8"><p class="text-gray-500">No recipes found in this category</p></div>';
//             }
//         })
//         .catch(error => {
//             console.error('Error:', error);
//             recentContainer.innerHTML = '<div class="col-span-full text-center py-8"><p class="text-red-500">An error occurred while loading recipes</p></div>';
//         });
// }


function initCategoryFilters() {
    const filterButtons = document.querySelectorAll('.category-filter');
    const clearFiltersBtn = document.getElementById('clear-filters');
    const activeFilterIndicator = document.getElementById('active-filter');
    const activeCategoryText = document.getElementById('active-category');
    
    if (!filterButtons.length || !clearFiltersBtn || !activeFilterIndicator || !activeCategoryText) return;
    
    // Add event listeners to category filter buttons
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            const categoryId = this.dataset.category;
            const categoryName = this.textContent.trim();
            
            // Reset all buttons to inactive state
            filterButtons.forEach(btn => {
                btn.classList.remove('bg-green-500', 'text-white');
                btn.classList.add('bg-gray-200', 'text-gray-700');
            });
            
            // Set this button as active
            this.classList.remove('bg-gray-200', 'text-gray-700');
            this.classList.add('bg-green-500', 'text-white');
            
            // Show clear filters button and active filter indicator
            clearFiltersBtn.classList.remove('hidden');
            activeFilterIndicator.classList.remove('hidden');
            activeCategoryText.textContent = categoryName;
            
            // Load recipes for selected category
            loadRecipesByCategory(categoryId);
        });
    });
    
    // Add event listener to clear filters button
    clearFiltersBtn.addEventListener('click', function() {
        // Reset all buttons to inactive state
        filterButtons.forEach(btn => {
            btn.classList.remove('bg-green-500', 'text-white');
            btn.classList.add('bg-gray-200', 'text-gray-700');
        });
        
        // Hide clear filters button and active filter indicator
        clearFiltersBtn.classList.add('hidden');
        activeFilterIndicator.classList.add('hidden');
        
        // Load all recipes
        loadAllRecipes();
    });
}

// Load recipes by category
function loadRecipesByCategory(categoryId) {
    const recentContainer = document.getElementById('recent-recipes');
    if (!recentContainer) return;
    
    // Show loading state
    recentContainer.innerHTML = '<div class="col-span-full text-center py-8"><p class="text-gray-500">Loading recipes...</p></div>';
    
    // Fetch recipes from server with category filter
    fetch(`api/recipes.php?category=${categoryId}`)
        .then(response => response.json())
        .then(data => {
            if (data.success && data.recipes && data.recipes.length > 0) {
                renderRecipes(data.recipes, 'recent-recipes', true);
            } else {
                recentContainer.innerHTML = '<div class="col-span-full text-center py-8"><p class="text-gray-500">No recipes found in this category</p></div>';
            }
        })
        .catch(error => {
            console.error('Error:', error);
            recentContainer.innerHTML = '<div class="col-span-full text-center py-8"><p class="text-red-500">An error occurred while loading recipes</p></div>';
        });
}











// Render recipes to the DOM
// Update renderRecipes function to add Get Featured button












function renderRecipes(recipes, containerId, showRating = false) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = '';
    
    if (recipes.length === 0) {
        container.innerHTML = '<div class="col-span-full text-center py-8"><p class="text-gray-500">No recipes found</p></div>';
        return;
    }
    
    recipes.forEach(recipe => {
        const recipeCard = document.createElement('div');
        recipeCard.className = 'recipe-card bg-white rounded-lg overflow-hidden shadow-md transition-all duration-300';
        
        const imageUrl = recipe.image || 'images/placeholder-recipe.jpg';
        
        // Check if current user is the author
        const isCurrentUserAuthor = recipe.user_id && window.currentUserId && recipe.user_id == window.currentUserId;
        // Check if recipe is already featured
        const isFeatured = recipe.featured == 1;
        
        recipeCard.innerHTML = `
            <div class="relative">
                <img src="${imageUrl}" alt="${recipe.title}" class="w-full h-48 object-cover">
                <span class="absolute top-3 right-3 bg-green-500 text-white text-xs px-2 py-1 rounded">${recipe.category}</span>
                ${isFeatured ? '<span class="absolute top-3 left-3 bg-amber-500 text-white text-xs px-2 py-1 rounded">Featured</span>' : ''}
            </div>
            <div class="p-4">
                <h3 class="text-lg font-bold mb-2 text-gray-800">${recipe.title}</h3>
                <p class="text-gray-600 text-sm mb-4">${truncateText(recipe.description || '', 100)}</p>
                <div class="flex items-center justify-between">
                    <div>
                        ${showRating ? 
                            `<div class="star-rating">
                                ${renderStars(recipe.rating || 0)}
                                <span class="text-gray-600 text-xs ml-1">(${recipe.reviews || 0})</span>
                            </div>` : ''}
                    </div>
                    <div class="flex space-x-2">
                        ${isCurrentUserAuthor && !isFeatured ? 
                            `<button class="feature-recipe-btn bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm transition-colors duration-300" 
                                data-id="${recipe.id}">Get Featured</button>` : ''}
                        <button class="view-recipe-btn bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm transition-colors duration-300" 
                                data-id="${recipe.id}">View Recipe</button>
                    </div>
                </div>
            </div>
        `;
        
        // Add click event for view recipe button
        const viewButton = recipeCard.querySelector('.view-recipe-btn');
        viewButton.addEventListener('click', function() {
            viewRecipeDetails(this.dataset.id);
        });
        
        // Add click event for feature recipe button if it exists
        const featureButton = recipeCard.querySelector('.feature-recipe-btn');
        if (featureButton) {
            featureButton.addEventListener('click', function(e) {
                e.stopPropagation(); // Prevent triggering view recipe
                const recipeId = this.dataset.id;
                
                featureRecipe(recipeId)
                    .then(success => {
                        if (success) {
                            // Reload both recipe sections
                            loadAllRecipes();
                            loadFeaturedRecipes();
                        }
                    });
            });
        }
        
        container.appendChild(recipeCard);
    });
}

// Generate star rating HTML
function renderStars(rating) {
    let stars = '';
    for (let i = 1; i <= 5; i++) {
        if (i <= rating) {
            stars += '<i class="fas fa-star"></i>';
        } else if (i - 0.5 <= rating) {
            stars += '<i class="fas fa-star-half-alt"></i>';
        } else {
            stars += '<i class="far fa-star"></i>';
        }
    }
    return stars;
}

// Interactive stars for rating
function renderInteractiveStars(rating, recipeId) {
    let stars = '';
    for (let i = 1; i <= 5; i++) {
        const filled = i <= rating ? 'fas' : 'far';
        stars += `<i class="${filled} fa-star interactive-star cursor-pointer text-yellow-400 mx-0.5" data-value="${i}"></i>`;
    }
    return stars;
}

// View Recipe Details
function viewRecipeDetails(recipeId) {
    // Fetch the recipe details
    fetch(`api/recipe_detail.php?id=${recipeId}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                displayRecipeModal(data.recipe);
            } else {
                showToast('Error: ' + data.message, 'error');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showToast('Failed to load recipe details', 'error');
        });
}

// Display recipe modal
// function displayRecipeModal(recipe) {
//     // Create modal if it doesn't exist
//     let recipeModal = document.getElementById('recipe-detail-modal');
//     if (!recipeModal) {
//         recipeModal = document.createElement('div');
//         recipeModal.id = 'recipe-detail-modal';
//         recipeModal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 hidden';
//         document.body.appendChild(recipeModal);
//     }
    
//     // Recipe image or placeholder
//     const imageUrl = recipe.image || 'https://via.placeholder.com/600x400?text=No+Image';
    
//     // Format ingredients from JSON
//     let ingredientsList = '';
//     try {
//         const ingredients = JSON.parse(recipe.ingredients);
//         ingredientsList = ingredients.map(ing => 
//             `<li class="py-2 border-b border-gray-200 flex">
//                 <span class="font-semibold w-1/4">${ing.amount}</span>
//                 <span class="flex-1">${ing.name}</span>
//             </li>`
//         ).join('');
//     } catch (e) {
//         ingredientsList = '<li class="py-2">Ingredients not available</li>';
//     }
    
//     // Format steps from JSON
//     let stepsList = '';
//     try {
//         const steps = JSON.parse(recipe.steps);
//         stepsList = steps.map((step, index) => 
//             `<li class="py-3 flex">
//                 <span class="flex-shrink-0 w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center mr-3">${index + 1}</span>
//                 <span>${step}</span>
//             </li>`
//         ).join('');
//     } catch (e) {
//         stepsList = '<li class="py-2">Preparation steps not available</li>';
//     }
    
//     // Check if current user is the author (to show delete button)
//     const isCurrentUserAuthor = recipe.user_id && window.currentUserId && recipe.user_id == window.currentUserId;
    
//     // Populate modal with recipe details
//     recipeModal.innerHTML = `
//         <div class="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-0 relative animation-scale-in">
//             <button id="close-recipe-modal" class="absolute top-4 right-4 text-white bg-black bg-opacity-50 hover:bg-opacity-70 rounded-full w-10 h-10 flex items-center justify-center z-10">
//                 <i class="fas fa-times"></i>
//             </button>
            
//             <div class="relative h-72">
//                 <img src="${imageUrl}" alt="${recipe.title}" class="w-full h-full object-cover">
//                 <div class="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black to-transparent">
//                     <h2 class="text-3xl font-bold text-white">${recipe.title}</h2>
//                     <div class="flex items-center mt-2">
//                         <span class="text-white mr-4">By ${recipe.author || 'Unknown'}</span>
//                         <div class="flex items-center rating-container" data-recipe-id="${recipe.id}">
//                             ${renderInteractiveStars(recipe.rating || 0, recipe.id)}
//                             <span class="text-white ml-2">(${recipe.reviews || 0} reviews)</span>
//                         </div>
//                     </div>
//                 </div>
//             </div>
            
//             <div class="p-6">
//                 <div class="mb-6">
//                     <div class="flex justify-between items-center">
//                         <h3 class="text-xl font-bold text-gray-800 mb-3">Description</h3>
//                         ${isCurrentUserAuthor ? 
//                             `<button id="delete-recipe-btn" class="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm transition-colors duration-300" 
//                                 data-id="${recipe.id}">Delete Recipe</button>` : ''}
//                     </div>
//                     <p class="text-gray-700">${recipe.description || 'No description available'}</p>
//                 </div>
                
//                 <div class="mb-6">
//                     <h3 class="text-xl font-bold text-gray-800 mb-3">Ingredients</h3>
//                     <ul class="list-none">
//                         ${ingredientsList}
//                     </ul>
//                 </div>
                
//                 <div class="mb-6">
//                     <h3 class="text-xl font-bold text-gray-800 mb-3">Preparation Steps</h3>
//                     <ul class="list-none">
//                         ${stepsList}
//                     </ul>
//                 </div>
//             </div>
            
//     `;
    
//     // Show modal
//     recipeModal.classList.remove('hidden');
    
//     // Add close functionality
//     document.getElementById('close-recipe-modal').addEventListener('click', function() {
//         recipeModal.classList.add('hidden');
//     });



//     // Add delete recipe functionality if button exists
//     const deleteButton = document.getElementById('delete-recipe-btn');
//     if (deleteButton) {
//         deleteButton.addEventListener('click', function() {
//             if (confirm('Are you sure you want to delete this recipe?')) {
//                 deleteRecipe(recipe.id)
//                     .then(success => {
//                         if (success) {
//                             recipeModal.classList.add('hidden');
//                             loadAllRecipes(); // Reload all recipes after deletion
//                         }
//                     });
//             }
//         });
//     }

//     // Add rating functionality
//     const stars = recipeModal.querySelectorAll('.interactive-star');
//     stars.forEach(star => {
//         star.addEventListener('click', function() {
//             const rating = parseInt(this.dataset.value);
//             const recipeId = parseInt(this.closest('.rating-container').dataset.recipeId);
//             rateRecipe(recipeId, rating);
//         });
//     });
// }

// Update the displayRecipeModal function to include Get Featured button

// Fix the displayRecipeModal function to handle non-existent back button

function displayRecipeModal(recipe) {
    // Create modal if it doesn't exist
    let recipeModal = document.getElementById('recipe-detail-modal');
    if (!recipeModal) {
        recipeModal = document.createElement('div');
        recipeModal.id = 'recipe-detail-modal';
        recipeModal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 hidden';
        document.body.appendChild(recipeModal);
    }
    
    // Recipe image or placeholder
    const imageUrl = recipe.image || 'https://via.placeholder.com/600x400?text=No+Image';
    
    // Format ingredients from JSON
    let ingredientsList = '';
    try {
        const ingredients = JSON.parse(recipe.ingredients);
        ingredientsList = ingredients.map(ing => 
            `<li class="py-2 border-b border-gray-200 flex">
                <span class="font-semibold w-1/4">${ing.amount}</span>
                <span class="flex-1">${ing.name}</span>
            </li>`
        ).join('');
    } catch (e) {
        ingredientsList = '<li class="py-2">Ingredients not available</li>';
    }
    
    // Format steps from JSON
    let stepsList = '';
    try {
        const steps = JSON.parse(recipe.steps);
        stepsList = steps.map((step, index) => 
            `<li class="py-3 flex">
                <span class="flex-shrink-0 w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center mr-3">${index + 1}</span>
                <span>${step}</span>
            </li>`
        ).join('');
    } catch (e) {
        stepsList = '<li class="py-2">Preparation steps not available</li>';
    }
    
    // Check if current user is the author (to show delete button)
    const isCurrentUserAuthor = recipe.user_id && window.currentUserId && recipe.user_id == window.currentUserId;
    
    // Check if recipe is already featured
    const isFeatured = recipe.featured == 1;
    
    // Populate modal with recipe details
    recipeModal.innerHTML = `
        <div class="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-0 relative animation-scale-in">
            <button id="close-recipe-modal" class="absolute top-4 right-4 text-white bg-black bg-opacity-50 hover:bg-opacity-70 rounded-full w-10 h-10 flex items-center justify-center z-10">
                <i class="fas fa-times"></i>
            </button>
            
            <div class="relative h-72">
                <img src="${imageUrl}" alt="${recipe.title}" class="w-full h-full object-cover">
                <div class="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black to-transparent">
                    <h2 class="text-3xl font-bold text-white">${recipe.title}</h2>
                    <div class="flex items-center mt-2">
                        <span class="text-white mr-4">By ${recipe.author || 'Unknown'}</span>
                        <div class="flex items-center rating-container" data-recipe-id="${recipe.id}">
                            ${renderInteractiveStars(recipe.rating || 0, recipe.id)}
                            <span class="text-white ml-2">(${recipe.reviews || 0} reviews)</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="p-6">
                <div class="mb-6">
                    <div class="flex justify-between items-center">
                        <h3 class="text-xl font-bold text-gray-800 mb-3">Description</h3>
                        <div class="flex space-x-2">
                            ${isCurrentUserAuthor ? `
                                ${isFeatured ? 
                                    `<button id="unfeature-recipe-btn" class="bg-amber-500 hover:bg-amber-600 text-white px-3 py-1 rounded text-sm transition-colors duration-300" 
                                        data-id="${recipe.id}">Unfeature</button>` :
                                    `<button id="feature-recipe-btn" class="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm transition-colors duration-300" 
                                        data-id="${recipe.id}">Get Featured</button>`
                                }
                                <button id="delete-recipe-btn" class="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm transition-colors duration-300" 
                                    data-id="${recipe.id}">Delete Recipe</button>
                            ` : ''}
                        </div>
                    </div>
                    <p class="text-gray-700">${recipe.description || 'No description available'}</p>
                </div>
                
                <div class="mb-6">
                    <h3 class="text-xl font-bold text-gray-800 mb-3">Ingredients</h3>
                    <ul class="list-none">
                        ${ingredientsList}
                    </ul>
                </div>
                
                <div class="mb-6">
                    <h3 class="text-xl font-bold text-gray-800 mb-3">Preparation Steps</h3>
                    <ul class="list-none">
                        ${stepsList}
                    </ul>
                </div>
            </div>
        </div>
    `;
    
    // Show modal
    recipeModal.classList.remove('hidden');
    
    // Add close functionality
    const closeButton = document.getElementById('close-recipe-modal');
    if (closeButton) {
        closeButton.addEventListener('click', function() {
            recipeModal.classList.add('hidden');
        });
    }

    // Add unfeature recipe functionality if button exists
    const unfeatureButton = document.getElementById('unfeature-recipe-btn');
    if (unfeatureButton) {
        unfeatureButton.addEventListener('click', function() {
            unfeatureRecipe(recipe.id)
                .then(success => {
                    if (success) {
                        recipeModal.classList.add('hidden');
                        // Reload both recipe sections
                        loadAllRecipes();
                        loadFeaturedRecipes();
                    }
                });
        });
    }

    // Add feature recipe functionality if button exists
    const featureButton = document.getElementById('feature-recipe-btn');
    if (featureButton) {
        featureButton.addEventListener('click', function() {
            featureRecipe(recipe.id)
                .then(success => {
                    if (success) {
                        recipeModal.classList.add('hidden');
                        // Reload both recipe sections
                        loadAllRecipes();
                        loadFeaturedRecipes();
                    }
                });
        });
    }

    

    // Add delete recipe functionality if button exists
    const deleteButton = document.getElementById('delete-recipe-btn');
    if (deleteButton) {
        deleteButton.addEventListener('click', function() {
            if (confirm('Are you sure you want to delete this recipe?')) {
                deleteRecipe(recipe.id)
                    .then(success => {
                        if (success) {
                            recipeModal.classList.add('hidden');
                            loadAllRecipes();
                            loadFeaturedRecipes(); // Also reload featured if needed
                        }
                    });
            }
        });
    }

    // Add rating functionality
    const stars = recipeModal.querySelectorAll('.interactive-star');
    stars.forEach(star => {
        star.addEventListener('click', function() {
            const rating = parseInt(this.dataset.value);
            const recipeId = parseInt(this.closest('.rating-container').dataset.recipeId);
            rateRecipe(recipeId, rating);
        });
    });
}


// Add function to load featured recipes

// Load featured recipes
function loadFeaturedRecipes() {
    const featuredContainer = document.getElementById('featured-recipes');
    if (!featuredContainer) return;
    
    // Show loading state
    featuredContainer.innerHTML = '<div class="col-span-full text-center py-8"><p class="text-gray-500">Loading featured recipes...</p></div>';
    
    // Fetch featured recipes from server
    fetch('api/recipes.php?featured=1')
        .then(response => response.json())
        .then(data => {
            if (data.success && data.recipes && data.recipes.length > 0) {
                renderRecipes(data.recipes, 'featured-recipes', true);
            } else {
                featuredContainer.innerHTML = '<div class="col-span-full text-center py-8"><p class="text-gray-500">No featured recipes found</p></div>';
            }
        })
        .catch(error => {
            console.error('Error:', error);
            featuredContainer.innerHTML = '<div class="col-span-full text-center py-8"><p class="text-red-500">An error occurred while loading featured recipes</p></div>';
        });
}








// Add new function to mark a recipe as featured

// Feature a recipe
function featureRecipe(recipeId) {
    return fetch('api/feature_recipe.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ recipe_id: recipeId })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showToast('Recipe has been featured!');
            return true;
        } else {
            showToast('Error: ' + data.message, 'error');
            return false;
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showToast('Failed to feature recipe', 'error');
        return false;
    });
}





// Load categories
function loadCategories() {
    fetch('api/categories.php')
        .then(response => response.json())
        .then(data => {
            if (data.success && data.categories && data.categories.length > 0) {
                renderCategories(data.categories);
            } else {
                console.error('No categories found or invalid response format');
                // Create some default categories if none are returned
                const defaultCategories = [
                    { id: 1, name: 'Breakfast', count: 0, image: 'uploads/categories/breakfast.jpg' },
                    { id: 2, name: 'Lunch', count: 0, image: 'uploads/categories/lunch.jpg' },
                    { id: 3, name: 'Dinner', count: 0, image: 'uploads/categories/dinner.jpg' },
                    { id: 4, name: 'Dessert', count: 0, image: 'uploads/categories/dessert.jpg' },
                    { id: 5, name: 'Vegetarian', count: 0, image: 'uploads/categories/vegetarian.jpg' },
                    { id: 6, name: 'Vegan', count: 0, image: 'uploads/categories/vegan.jpg' },
                    { id: 7, name: 'Quick & Easy', count: 0, image: 'uploads/categories/quick.jpg' }
                ];
                renderCategories(defaultCategories);
            }
        })
        .catch(error => {
            console.error('Error loading categories:', error);
            // Show error in the categories section
            const container = document.querySelector('#categories-section .grid');
            if (container) {
                container.innerHTML = '<div class="col-span-full text-center py-8"><p class="text-red-500">Failed to load categories. Please try again later.</p></div>';
            }
        });
}

// Render categories
function renderCategories(categories) {
    const container = document.querySelector('#categories-section .grid');
    if (!container) return;
    
    container.innerHTML = '';
    
    categories.forEach(category => {
        const categoryCard = document.createElement('div');
        categoryCard.className = 'category-card rounded-lg overflow-hidden shadow-md transition-transform duration-300 hover:shadow-lg hover:transform hover:scale-105';
        categoryCard.style.height = '180px'; // Fixed height for consistency
        
        // Default image if none provided
        const imageUrl = category.image || 'https://via.placeholder.com/300x200?text=' + category.name;
        
        categoryCard.innerHTML = `
            <a href="index.html?category=${category.id}" class="block relative h-full">
                <div class="absolute inset-0 bg-cover bg-center" style="background-image: url('${imageUrl}')"></div>
                <div class="absolute inset-0 bg-black bg-opacity-50"></div>
                <div class="absolute inset-0 flex items-center justify-center">
                    <div class="text-center">
                        <h3 class="text-xl font-bold text-white">${category.name}</h3>
                        <span class="inline-block px-3 py-1 mt-2 bg-green-500 text-white text-sm rounded-full">${category.count || 0} recipes</span>
                    </div>
                </div>
            </a>
        `;
        
        container.appendChild(categoryCard);
    });
}

// Rate a recipe
function rateRecipe(recipeId, rating) {
    // First check if user is logged in
    if (!window.currentUserId) {
        showToast('Please login to rate recipes', 'error');
        return;
    }

    fetch('api/rate_recipe.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ recipe_id: recipeId, rating: rating })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showToast('Thank you for your rating!');
            
            // Update stars in the UI
            const ratingContainer = document.querySelector(`.rating-container[data-recipe-id="${recipeId}"]`);
            if (ratingContainer) {
                const newRating = data.new_rating || rating;
                const reviewsCount = data.reviews_count || '1';
                
                ratingContainer.innerHTML = `
                    ${renderInteractiveStars(newRating, recipeId)}
                    <span class="text-white ml-2">(${reviewsCount} reviews)</span>
                `;
            }
        } else {
            showToast('Error: ' + data.message, 'error');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showToast('Failed to submit rating', 'error');
    });
}

// Delete a recipe
function deleteRecipe(recipeId) {
    return fetch('api/delete_recipe.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ recipe_id: recipeId })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showToast('Recipe deleted successfully');
            return true;
        } else {
            showToast('Error: ' + data.message, 'error');
            return false;
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showToast('Failed to delete recipe', 'error');
        return false;
    });
}

// Text utilities
function truncateText(text, length = 100) {
    if (!text) return '';
    return text.length > length ? text.substring(0, length) + '...' : text;
}

// Authentication Management
function initAuth() {
    // Login form submission
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData();
            formData.append('action', 'login');
            formData.append('email', document.getElementById('email').value);
            formData.append('password', document.getElementById('password').value);
            
            fetch('api/auth.php', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    showToast(data.message);
                    document.getElementById('auth-modal').classList.add('hidden');
                    document.body.style.overflow = 'auto';
                    window.location.reload(); // Reload to update UI with logged in state
                } else {
                    showToast('Error: ' + data.message, 'error');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                showToast('An error occurred. Please try again.', 'error');
            });
        });
    }

    // Registration form submission
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const password = document.getElementById('reg-password').value;
            const confirmPassword = document.getElementById('confirm-password').value;
            
            if (password !== confirmPassword) {
                showToast('Error: Passwords do not match', 'error');
                return;
            }
            
            const formData = new FormData();
            formData.append('action', 'register');
            formData.append('name', document.getElementById('name').value);
            formData.append('email', document.getElementById('reg-email').value);
            formData.append('password', password);
            formData.append('confirm_password', confirmPassword);
            
            fetch('api/auth.php', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    showToast(data.message);
                    // Switch to login tab
                    document.getElementById('login-tab').click();
                } else {
                    showToast('Error: ' + data.message, 'error');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                showToast('An error occurred. Please try again.', 'error');
            });
        });
    }
}

// Check login status
function checkLoginStatus() {
    fetch('api/check_login.php')
        .then(response => response.json())
        .then(data => {
            if (data.loggedIn) {
                window.currentUserId = data.userId;
                window.currentUserName = data.userName;
                updateUIForLoginState();
            }
            
            // Initialize auth forms after checking login status
            initAuth();
        })
        .catch(error => {
            console.error('Error checking login status:', error);
            initAuth(); // Still initialize auth forms even if check fails
        });
}

// Update UI for logged in state
function updateUIForLoginState() {
    if (window.currentUserId) {
        // User is logged in
        const loginBtn = document.getElementById('login-btn');
        const navbarItemsContainer = document.querySelector('nav .flex.items-center.space-x-4');
        
        // Create welcome message element
        const welcomeMsg = document.createElement('div');
        welcomeMsg.id = 'welcome-msg';
        welcomeMsg.className = 'flex items-center mr-2 px-2 py-1 bg-green-700 rounded text-sm';
        welcomeMsg.innerHTML = `
            <i class="fas fa-user-circle mr-1"></i>
            <span>Welcome, ${window.currentUserName}</span>
        `;
        
        // Replace login button with logout button or add logout functionality
        if (loginBtn) {
            // Modify the existing login button to be a logout button
            loginBtn.textContent = 'Logout';
            loginBtn.id = 'logout-btn';
            loginBtn.classList.remove('bg-white', 'text-green-600');
            loginBtn.classList.add('bg-green-800', 'text-white', 'hover:bg-green-900');
            
            // Clear existing event listeners (if any)
            const newBtn = loginBtn.cloneNode(true);
            loginBtn.parentNode.replaceChild(newBtn, loginBtn);
            
            // Add logout functionality
            newBtn.addEventListener('click', function(e) {
                e.preventDefault();
                logoutUser();
            });
        }
        
        // Insert welcome message before the search input in the navbar
        if (navbarItemsContainer && !document.getElementById('welcome-msg')) {
            navbarItemsContainer.insertBefore(welcomeMsg, navbarItemsContainer.firstChild);
        }
        
        // Hide "Create Account" button in hero section if it exists
        const createAccountBtn = document.getElementById('create-account-btn');
        if (createAccountBtn) {
            createAccountBtn.style.display = 'none';
        }
    }
}

// Logout user
function logoutUser(e) {
    if (e) e.preventDefault();
    
    // Create FormData instead of JSON
    const formData = new FormData();
    formData.append('action', 'logout');
    
    fetch('api/auth.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showToast('Logged out successfully');
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        } else {
            showToast('Error: ' + data.message, 'error');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showToast('An error occurred. Please try again.', 'error');
    });
}

// Navbar functionality
function initNavbar() {
    const navbar = document.getElementById('navbar');
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');

    if (!navbar) return;

    // Change navbar style on scroll
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('bg-white', 'text-gray-800', 'shadow-md');
            navbar.classList.remove('bg-green-600', 'text-white');
        } else {
            navbar.classList.remove('bg-white', 'text-gray-800', 'shadow-md');
            navbar.classList.add('bg-green-600', 'text-white');
        }
    });

    // Mobile menu toggle if exists
    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });
    }
}

// Modal functionality
function initModals() {
    // Auth Modal
    const loginBtn = document.getElementById('login-btn');
    const createAccountBtn = document.getElementById('create-account-btn');
    const authModal = document.getElementById('auth-modal');
    const closeAuthModal = document.getElementById('close-auth-modal');
    
    // Login/Register tabs
    const loginTab = document.getElementById('login-tab');
    const registerTab = document.getElementById('register-tab');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    
    // Upload Modal
    const uploadLink = document.getElementById('upload-link');
    const mobileUpload = document.querySelector('.mobile-upload');
    const uploadModal = document.getElementById('upload-modal');
    const closeUploadModal = document.getElementById('close-upload-modal');
    const cancelUpload = document.getElementById('cancel-upload');

    // Initialize auth modal if elements exist
    if (authModal && loginBtn && closeAuthModal) {
        // Open Auth Modal
        loginBtn.addEventListener('click', () => {
            authModal.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
        });

        if (createAccountBtn) {
            createAccountBtn.addEventListener('click', () => {
                authModal.classList.remove('hidden');
                if (registerTab) switchToRegisterTab();
                document.body.style.overflow = 'hidden';
            });
        }

        // Close Auth Modal
        closeAuthModal.addEventListener('click', () => {
            authModal.classList.add('hidden');
            document.body.style.overflow = 'auto';
        });

        // Switch Auth Tabs if they exist
        if (loginTab && registerTab) {
            loginTab.addEventListener('click', switchToLoginTab);
            registerTab.addEventListener('click', switchToRegisterTab);
        }
    }

    // Initialize upload modal if elements exist
    if (uploadModal && uploadLink && closeUploadModal && cancelUpload) {
        // Open Upload Modal
        uploadLink.addEventListener('click', () => {
            uploadModal.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
        });

        if (mobileUpload) {
            mobileUpload.addEventListener('click', () => {
                uploadModal.classList.remove('hidden');
                document.body.style.overflow = 'hidden';
                if (mobileMenu) mobileMenu.classList.add('hidden');
            });
        }

        // Close Upload Modal
        closeUploadModal.addEventListener('click', () => {
            uploadModal.classList.add('hidden');
            document.body.style.overflow = 'auto';
        });

        cancelUpload.addEventListener('click', () => {
            uploadModal.classList.add('hidden');
            document.body.style.overflow = 'auto';
        });
    }

    // Close modals when clicking outside
    window.addEventListener('click', (e) => {
        if (authModal && e.target === authModal) {
            authModal.classList.add('hidden');
            document.body.style.overflow = 'auto';
        }
        if (uploadModal && e.target === uploadModal) {
            uploadModal.classList.add('hidden');
            document.body.style.overflow = 'auto';
        }
    });

    // Tab switching functions
    function switchToLoginTab() {
        if (!loginTab || !registerTab || !loginForm || !registerForm) return;
        
        loginTab.classList.add('border-green-500', 'text-green-600');
        loginTab.classList.remove('border-gray-200', 'text-gray-500');
        registerTab.classList.add('border-gray-200', 'text-gray-500');
        registerTab.classList.remove('border-green-500', 'text-green-600');
        loginForm.classList.remove('hidden');
        loginForm.classList.add('block');
        registerForm.classList.add('hidden');
        registerForm.classList.remove('block');
    }

    function switchToRegisterTab() {
        if (!loginTab || !registerTab || !loginForm || !registerForm) return;
        
        registerTab.classList.add('border-green-500', 'text-green-600');
        registerTab.classList.remove('border-gray-200', 'text-gray-500');
        loginTab.classList.add('border-gray-200', 'text-gray-500');
        loginTab.classList.remove('border-green-500', 'text-green-600');
        registerForm.classList.remove('hidden');
        registerForm.classList.add('block');
        loginForm.classList.add('hidden');
        loginForm.classList.remove('block');
    }
}

// Recipe Form Functionality
function initRecipeForm() {
    const ingredientsContainer = document.getElementById('ingredients-container');
    const addIngredientBtn = document.getElementById('add-ingredient');
    const stepsContainer = document.getElementById('steps-container');
    const addStepBtn = document.getElementById('add-step');
    const recipeForm = document.getElementById('recipe-form');
    const imageDropArea = document.getElementById('image-drop-area');
    const browseBtn = document.getElementById('browse-btn');
    const recipeImage = document.getElementById('recipe-image');

    // Check if necessary elements exist
    if (!ingredientsContainer || !addIngredientBtn || !stepsContainer || !addStepBtn) return;

    // Add Ingredient row
    addIngredientBtn.addEventListener('click', () => {
        const newRow = document.createElement('div');
        newRow.className = 'ingredient-row flex mb-2';
        newRow.innerHTML = `
            <input class="w-1/4 mr-2 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400" type="text" placeholder="Amount">
            <input class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400" type="text" placeholder="Ingredient">
            <button type="button" class="ml-2 text-red rounded-lg px-3 py-2 remove-ingredient">
                <i class="fas fa-minus"></i>
            </button>
        `;
        ingredientsContainer.appendChild(newRow);

        // Add event listener to the remove button
        newRow.querySelector('.remove-ingredient').addEventListener('click', function() {
            ingredientsContainer.removeChild(newRow);
        });
    });

    // Add Step row
    addStepBtn.addEventListener('click', () => {
        const stepCount = stepsContainer.children.length + 1;
        const newRow = document.createElement('div');
        newRow.className = 'step-row flex mb-2';
        newRow.innerHTML = `
            <span class="step-number flex items-center justify-center bg-green-500 text-white rounded-full w-6 h-6 mr-2 mt-2">${stepCount}</span>
            <input class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400" type="text" placeholder="Describe this step">
            <button type="button" class="ml-2 text-red rounded-lg px-3 py-2 remove-step">
                <i class="fas fa-minus"></i>
            </button>
        `;
        stepsContainer.appendChild(newRow);

        // Add event listener to the remove button
        newRow.querySelector('.remove-step').addEventListener('click', function() {
            stepsContainer.removeChild(newRow);
            updateStepNumbers();
        });
    });

    // Update step numbers when a step is removed
    function updateStepNumbers() {
        const steps = stepsContainer.querySelectorAll('.step-row');
        steps.forEach((step, index) => {
            step.querySelector('.step-number').textContent = index + 1;
        });
    }

    // Initial ingredients and steps
    addIngredientBtn.click();
    addStepBtn.click();

    // Image upload functionality if elements exist
    if (imageDropArea && browseBtn && recipeImage) {
        browseBtn.addEventListener('click', () => {
            recipeImage.click();
        });

        recipeImage.addEventListener('change', function() {
            displaySelectedImage(this);
        });

        // Drag and drop functionality
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            imageDropArea.addEventListener(eventName, preventDefaults, false);
        });

        function preventDefaults(e) {
            e.preventDefault();
            e.stopPropagation();
        }

        ['dragenter', 'dragover'].forEach(eventName => {
            imageDropArea.addEventListener(eventName, highlight, false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            imageDropArea.addEventListener(eventName, unhighlight, false);
        });

        function highlight() {
            imageDropArea.classList.add('active');
        }

        function unhighlight() {
            imageDropArea.classList.remove('active');
        }

        imageDropArea.addEventListener('drop', handleDrop, false);

        function handleDrop(e) {
            const dt = e.dataTransfer;
            const files = dt.files;
            recipeImage.files = files;
            displaySelectedImage(recipeImage);
        }

        function displaySelectedImage(input) {
            if (input.files && input.files[0]) {
                const reader = new FileReader();
                
                reader.onload = function(e) {
                    // Remove previous preview if exists
                    const existingPreview = imageDropArea.querySelector('.preview-container');
                    if (existingPreview) {
                        imageDropArea.removeChild(existingPreview);
                    }
                    
                    // Create preview container
                    const previewContainer = document.createElement('div');
                    previewContainer.className = 'preview-container mt-3';
                    previewContainer.innerHTML = `
                        <img src="${e.target.result}" class="max-h-32 mx-auto rounded" />
                        <p class="text-sm text-gray-600 mt-2">${input.files[0].name}</p>
                    `;
                    
                    // Update drop area content
                    imageDropArea.innerHTML = '';
                    imageDropArea.appendChild(previewContainer);
                    
                    // Add browse button back
                    const browseButton = document.createElement('button');
                    browseButton.type = 'button';
                    browseButton.id = 'browse-btn';
                    browseButton.className = 'mt-2 text-green-600 hover:text-green-700';
                    browseButton.textContent = 'Change Image';
                    browseButton.addEventListener('click', () => recipeImage.click());
                    imageDropArea.appendChild(browseButton);
                }
                
                reader.readAsDataURL(input.files[0]);
            }
        }
    }

    // Recipe form submission
    if (recipeForm) {
        recipeForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Gather form data
            const formData = new FormData();
            formData.append('title', document.getElementById('recipe-title').value);
            formData.append('category', document.getElementById('recipe-category').value);
            formData.append('description', document.getElementById('recipe-description').value);
            
            // Get ingredients
            const ingredients = [];
            document.querySelectorAll('.ingredient-row').forEach(row => {
                const inputs = row.querySelectorAll('input');
                ingredients.push({
                    amount: inputs[0].value,
                    name: inputs[1].value
                });
            });
            formData.append('ingredients', JSON.stringify(ingredients));
            
            // Get steps
            const steps = [];
            document.querySelectorAll('.step-row').forEach(row => {
                steps.push(row.querySelector('input').value);
            });
            formData.append('steps', JSON.stringify(steps));
            
            // Add image if selected
            if (recipeImage && recipeImage.files[0]) {
                formData.append('image', recipeImage.files[0]);
            }
            
            // Submit to server
            fetch('api/recipes.php', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Show success toast
                    showToast('Recipe submitted successfully!');
                    
                    // Close the modal and reset form
                    const uploadModal = document.getElementById('upload-modal');
                    if (uploadModal) {
                        uploadModal.classList.add('hidden');
                        document.body.style.overflow = 'auto';
                    }
                    recipeForm.reset();
                    
                    // Reload recipes to show the new one
                    loadAllRecipes();
                } else {
                    showToast('Error: ' + data.message, 'error');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                showToast('An error occurred. Please try again.', 'error');
            });
        });
    }
}

// Search functionality
function initSearchFunctionality() {
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');

    if (!searchInput || !searchBtn) return;

    searchBtn.addEventListener('click', performSearch);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            performSearch();
        }
    });

    function performSearch() {
        const query = searchInput.value.trim();
        if (query) {
            window.location.href = `search.php?q=${encodeURIComponent(query)}`;
        }
    }
}

// Initialize animations
function initAnimations() {
    // Animate elements when they come into view
    const animateOnScroll = () => {
        const elements = document.querySelectorAll('.animate-on-scroll');
        elements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            const elementBottom = element.getBoundingClientRect().bottom;
            
            // Check if element is in viewport
            if (elementTop < window.innerHeight && elementBottom >= 0) {
                element.classList.add('animation-slide-up');
            }
        });
    };

    // Add animation class to section headers
    document.querySelectorAll('section h2').forEach(header => {
        header.classList.add('animate-on-scroll');
    });

    // Initialize animations on load and scroll
    window.addEventListener('load', animateOnScroll);
    window.addEventListener('scroll', animateOnScroll);
}

// Show toast notification
function showToast(message, type = 'success') {
    // Check if toast container exists, if not create it
    let toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        toastContainer.className = 'fixed bottom-4 right-4 z-50';
        document.body.appendChild(toastContainer);
    }
    
    // Create toast
    const toast = document.createElement('div');
    toast.className = `mb-3 p-4 rounded-lg shadow-lg flex items-center justify-between min-w-[300px] transform translate-x-full transition-transform duration-300 ${
        type === 'error' ? 'bg-red-500 text-white' : 'bg-green-500 text-white'
    }`;
    
    toast.innerHTML = `
        <div class="flex items-center">
            <i class="fas fa-${type === 'error' ? 'exclamation-circle' : 'check-circle'} mr-3"></i>
            <span>${message}</span>
        </div>
        <button class="ml-4 text-white hover:text-gray-200">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // Add to container
    toastContainer.appendChild(toast);
    
    // Show toast (animate)
    setTimeout(() => {
        toast.classList.remove('translate-x-full');
    }, 10);
    
    // Add close handler
    toast.querySelector('button').addEventListener('click', () => {
        toast.classList.add('translate-x-full');
        setTimeout(() => {
            toast.remove();
        }, 300);
    });
    
    // Auto hide after 5 seconds
    setTimeout(() => {
        if (toast.isConnected) {
            toast.classList.add('translate-x-full');
            setTimeout(() => {
                if (toast.isConnected) toast.remove();
            }, 300);
        }
    }, 5000);
}