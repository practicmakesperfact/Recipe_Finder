from django.test import TestCase

# Create your tests here.
from django.test import TestCase
from django.contrib.auth.models import User
from .models import Recipe, Ingredient, Review, Notification, Profile
from rest_framework.test import APIClient
from rest_framework import status

class RecipeTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username='testuser', password='testpass')
        self.client.force_authenticate(user=self.user)
        self.recipe = Recipe.objects.create(
            name='Test Recipe',
            ingredients='Flour, Sugar',
            instructions='Mix and bake',
            cooking_time=30,
            category='Dessert',
            author=self.user
        )

    def test_create_recipe(self):
        response = self.client.post('/Recipes/', {
            'name': 'New Recipe',
            'ingredients': 'Eggs, Milk',
            'instructions': 'Mix and cook',
            'cooking_time': 20,
            'category': 'Breakfast'
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_search_recipe(self):
        response = self.client.get('/recipes/search/?ingredients=Flour')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

class ReviewTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username='testuser', password='testpass')
        self.client.force_authenticate(user=self.user)
        self.recipe = Recipe.objects.create(
            name='Test Recipe',
            ingredients='Flour, Sugar',
            instructions='Mix and bake',
            cooking_time=30,
            category='Dessert',
            author=self.user
        )

    def test_create_review(self):
        response = self.client.post(f'/recipes/{self.recipe.id}/reviews/', {
            'rating': 4,
            'comment': 'Great recipe!'
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Review.objects.count(), 1)
        self.assertEqual(Recipe.objects.get(id=self.recipe.id).rating, 4)