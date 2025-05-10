from django.apps import AppConfig


class RecipesConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'Recipes'
    
    def ready(self):
        import Recipes.signals # import signals to connect them
      