document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');
    const searchResults = document.getElementById('search-results');
    const trendingRecipes = document.getElementById('trending-recipes');

    // Fetch trending recipes (latest 3 recipes)
    axios.get('/Recipes/')
        .then(response => {
            const recipes = response.data.slice(0, 3);
            trendingRecipes.innerHTML = recipes.map(recipe => `
                <div class="bg-white p-4 rounded-lg shadow">
                    <h3 class="text-xl font-bold">${recipe.name}</h3>
                    <p>Rating: ${recipe.rating}</p>
                    <a href="/recipe/${recipe.id}/" class="text-blue-600 hover:underline">View Recipe</a>
                </div>
            `).join('');
        })
        .catch(error => console.error('Error fetching trending recipes:', error));

    // Search recipes
    searchBtn.addEventListener('click', () => {
        const ingredients = searchInput.value.trim();
        if (ingredients) {
            axios.get(`/recipes/search/?ingredients=${ingredients}`)
                .then(response => {
                    searchResults.innerHTML = response.data.length ? response.data.map(recipe => `
                        <div class="bg-white p-4 rounded-lg shadow">
                            <h3 class="text-xl font-bold">${recipe.name}</h3>
                            <p>Rating: ${recipe.rating}</p>
                            <a href="/recipe/${recipe.id}/" class="text-blue-600 hover:underline">View Recipe</a>
                        </div>
                    `).join('') : '<p class="text-center">No recipes found.</p>';
                })
                .catch(error => console.error('Error searching recipes:', error));
        }
    });
});