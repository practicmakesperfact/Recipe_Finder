from django.contrib import admin

# Register your models here.
from .models import Recipe,Ingredient,Review,Profile


admin.site.site_header = 'Recipes Admin'
admin.site.site_title = 'Recipes Admin Area'
admin.site.index_title = 'Welcome to the Recipes Admin Area'

# admin.site.register(Recipe)
admin.site.register(Ingredient)
admin.site.register(Review)
admin.site.register(Profile)

#customizing the admin panel

class RecipeAdmin(admin.ModelAdmin):
    list_display = ('name','rating')
    search_fields = ('name','ingredients')
    list_filter = ('ingredients','category')
    
admin.site.register(Recipe,RecipeAdmin) #registering the model with the custom admin class
