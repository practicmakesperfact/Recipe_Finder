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
from django.urls import path,include
from django.conf import settings
from django.conf.urls.static import static
from Recipes.views import home
urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('Recipes.urls')),
    path('', home, name='home'),
    path('recipe/<int:pk>/', home, name='recipe_detail'),  # Temporary, will render index.html
    path('profile/', home, name='profile'),
    path('login/', home, name='login'),
    path('register/', home, name='register'),
    path('logout/', home, name='logout'),
] + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
