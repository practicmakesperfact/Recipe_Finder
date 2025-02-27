from django.urls import path,include
from rest_framework.routers import DefaultRouter
from .views import RecipeViewSet,IngredientViewSet,ReviewViewSet,ProfileViewSet
from rest_framework_simplejwt.views import TokenObtainPairView,TokenRefreshView
from .views import FavoriteRecipeView,FavoriteRecipeListView,ReviewListCreateView,ReviewDetailView,ReviewLikeDislikeView,NotificationListView,MarkNotificationAsReadView,MarkAllNotificationsAsReadView

router = DefaultRouter()
router.register(r'Recipes',RecipeViewSet)
router.register(r'Ingredients',IngredientViewSet)
router.register(r'Reviews',ReviewViewSet)
router.register(r'Profiles',ProfileViewSet)

urlpatterns = [
    path('',include(router.urls)), # this will include all the urls from the router
    path('token/',TokenObtainPairView.as_view(),name='token_obtain_pair'),
    path('token/refresh/',TokenRefreshView.as_view(),name='token_refresh'),
    path('favorite/',FavoriteRecipeView.as_view(),name='favorite'),
    path('favorites/list/',FavoriteRecipeListView.as_view(),name='favorite_recipes_list'),
    path('recipes/<int:recipe_id>/reviews/',ReviewListCreateView.as_view(),name='review_list'),
    path('reviews/<int:pk>/',ReviewDetailView.as_view(),name='review_detail'),
    path('reviews/<int:review_id>/<str:action>/', ReviewLikeDislikeView.as_view(),name='review_like_dislike'),
    path('notifications/',NotificationListView.as_view(),name='notifications_list'),
    path('notifications/<int:pk>/read/',MarkNotificationAsReadView.as_view(),name='mark_notification_read'),
    path('notifications/read-all/',MarkAllNotificationsAsReadView.as_view(),name='mark_all_notifications_read'),
    
 
    
]
