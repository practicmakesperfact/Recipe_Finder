from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from .models import Review, Recipe

@receiver(post_save, sender=Review)
@receiver(post_delete, sender=Review)
def update_recipe_rating(sender, instance, **kwargs):
    recipe = instance.recipe
    reviews = recipe.reviews.all()
    if reviews.exists():
        average_rating = reviews.aggregate(models.Avg('rating'))['rating__avg']
        recipe.rating = round(average_rating, 1)
    else:
        recipe.rating = 0
    recipe.save()