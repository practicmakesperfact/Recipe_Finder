"""
URL configuration for RecipeFinder project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from Recipes.views import home, recipe_detail  # Import the views we’ve defined

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', home, name='home'),  # Frontend home page
    path('api/', include('Recipes.urls')),  # DRF API endpoints under /api/
    path('recipe/<int:pk>/', recipe_detail, name='recipe_detail'),  # Recipe detail page
    path('profile/', home, name='profile'),  # Placeholder for profile page
    path('login/', home, name='login'),  # Placeholder for login page
    path('register/', home, name='register'),  # Placeholder for register page
    path('logout/', home, name='logout'),  # Placeholder for logout page
] + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)