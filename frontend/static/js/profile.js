document.addEventListener('DOMContentLoaded', () => {
    const favoritesList = document.getElementById('favorites-list');
    const reviewsList = document.getElementById('reviews-list');

    // Fetch favorite recipes
    axios.get('/favorites/list/', {
        headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
    })
        .then(response => {
            favoritesList.innerHTML = response.data.length ? response.data.map(recipe => `
                <div class="bg-white p-4 rounded-lg shadow">
                    <h3 class="text-xl font-bold">${recipe.name}</h3>
                    <p>Rating: ${recipe.rating}</p>
                    <a href="/recipe/${recipe.id}/" class="text-blue-600 hover:underline">View Recipe</a>
                </div>
            `).join('') : '<p>No favorite recipes yet.</p>';
        })
        .catch(error => console.error('Error fetching favorites:', error));

    // Fetch user reviews
    axios.get('/Reviews/', {
        headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
    })
        .then(response => {
            const userReviews = response.data.filter(review => review.user === localStorage.getItem('username'));
            reviewsList.innerHTML = userReviews.length ? userReviews.map(review => `
                <div class="bg-white p-4 rounded-lg shadow">
                    <p><strong>Recipe:</strong> ${review.recipe}</p>
                    <p><strong>Rating:</strong> ${review.rating}/5</p>
                    <p>${review.comment}</p>
                    <p class="text-sm text-gray-500">${new Date(review.created_at).toLocaleDateString()}</p>
                </div>
            `).join('') : '<p>No reviews yet.</p>';
        })
        .catch(error => console.error('Error fetching reviews:', error));
});