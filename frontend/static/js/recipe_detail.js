document.addEventListener('DOMContentLoaded', () => {
    const recipeDetails = document.getElementById('recipe-details');
    const reviewsList = document.getElementById('reviews-list');
    const reviewForm = document.getElementById('review-form');
    const recipeId = window.location.pathname.split('/')[2];

    // Fetch recipe details
    axios.get(`/Recipes/${recipeId}/`)
        .then(response => {
            const recipe = response.data;
            recipeDetails.innerHTML = `
                <h1 class="text-3xl font-bold">${recipe.name}</h1>
                <p class="my-2"><strong>Category:</strong> ${recipe.category}</p>
                <p class="my-2"><strong>Rating:</strong> ${recipe.rating}</p>
                <p class="my-2"><strong>Ingredients:</strong> ${recipe.ingredients}</p>
                <p class="my-2"><strong>Instructions:</strong> ${recipe.instructions}</p>
                <p class="my-2"><strong>Cooking Time:</strong> ${recipe.cooking_time} minutes</p>
                <p class="my-2"><strong>Dietary Restrictions:</strong> ${recipe.dietary_restrictions || 'None'}</p>
                <button id="favorite-btn" class="bg-yellow-500 text-white p-2 rounded">${recipe.favorited_by ? 'Remove from Favorites' : 'Add to Favorites'}</button>
            `;

            // Add/Remove favorite
            document.getElementById('favorite-btn').addEventListener('click', () => {
                axios.patch('/favorite/', { recipe_id: recipeId }, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
                })
                    .then(response => {
                        alert(response.data.message);
                        location.reload();
                    })
                    .catch(error => console.error('Error updating favorite:', error));
            });
        })
        .catch(error => console.error('Error fetching recipe:', error));

    // Fetch reviews
    axios.get(`/recipes/${recipeId}/reviews/`)
        .then(response => {
            reviewsList.innerHTML = response.data.map(review => `
                <div class="bg-white p-4 rounded-lg shadow flex justify-between items-center">
                    <div>
                        <p><strong>${review.user}</strong> (${review.rating}/5)</p>
                        <p>${review.comment}</p>
                        <p class="text-sm text-gray-500">${new Date(review.created_at).toLocaleDateString()}</p>
                    </div>
                    <div class="flex space-x-2">
                        <button class="like-btn bg-green-500 text-white p-2 rounded" data-review-id="${review.id}">Like (${review.like_count})</button>
                        <button class="dislike-btn bg-red-500 text-white p-2 rounded" data-review-id="${review.id}">Dislike (${review.dislike_count})</button>
                    </div>
                </div>
            `).join('');

            // Add like/dislike functionality
            document.querySelectorAll('.like-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    const reviewId = btn.getAttribute('data-review-id');
                    axios.post(`/reviews/${reviewId}/like/`, {}, {
                        headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
                    })
                        .then(response => {
                            alert(response.data.message);
                            location.reload();
                        })
                        .catch(error => console.error('Error liking review:', error));
                });
            });

            document.querySelectorAll('.dislike-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    const reviewId = btn.getAttribute('data-review-id');
                    axios.post(`/reviews/${reviewId}/dislike/`, {}, {
                        headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
                    })
                        .then(response => {
                            alert(response.data.message);
                            location.reload();
                        })
                        .catch(error => console.error('Error disliking review:', error));
                });
            });
        })
        .catch(error => console.error('Error fetching reviews:', error));

    // Submit review
    reviewForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const rating = document.getElementById('rating').value;
        const comment = document.getElementById('comment').value;

        axios.post(`/recipes/${recipeId}/reviews/`, { rating, comment }, {
            headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
        })
            .then(response => {
                alert('Review submitted!');
                location.reload();
            })
            .catch(error => console.error('Error submitting review:', error));
    });
});