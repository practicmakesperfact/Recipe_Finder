from django.db import models

# Create your models here.
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, MaxValueValidator

class Recipe(models.Model):
    name =models.CharField(max_length=225)
    ingredients = models.TextField()
    instructions = models.TextField()
    cooking_time = models.IntegerField() 
    dietary_restrictions = models.CharField(max_length=225,blank=True,null=True)
    category =models.CharField(max_length=100)
    rating = models.FloatField(default=0)
    author = models.ForeignKey(User,on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    
    
    def __str__(self):
        return self.name
    
class Ingredient(models.Model):
    name = models.CharField(max_length=225)
    quantity = models.CharField(max_length=225)
    unit= models.CharField(max_length=225)
    recipe = models.ForeignKey(Recipe,on_delete=models.CASCADE)
    
    
    def __str__(self):
        return self.name
    
    
class Review(models.Model):
    user = models.ForeignKey(User,on_delete=models.CASCADE)
    recipe = models.ForeignKey('Recipe',related_name="reviews",on_delete=models.CASCADE)
    rating = models.IntegerField(
        validators= [
            MinValueValidator(1),
            MaxValueValidator(5)
        ]
    ) 
    comment = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    likes = models.ManyToManyField(User,related_name="liked_reviews",blank=True)
    dislikes = models.ManyToManyField(User,related_name="disliked_reviews",blank=True)
    
    def like_count(self):
        return self.likes.count()
    
    def dislike_count(self):
        return self.dislikes.count()
    
    def __str__(self):
        return f"{self.user.username} - {self.recipe.name} ({self.rating}/5)"
    
# notification model
class Notification(models.Model):
    user = models.ForeignKey(User,on_delete=models.CASCADE)  # user who will receive the notification
    message = models.TextField() # notfication message
    is_read = models.BooleanField(default=False) # track if  the notification has been read
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Notification for {self.user.username}: {self.message}"
    
  
class Profile(models.Model):
    user = models.OneToOneField(User,on_delete=models.CASCADE)
    favorites =models.ManyToManyField('Recipe',related_name="favorited_by", blank=True)
    
    
    def __str__(self):
        return self.user.username