from django.shortcuts import render,get_object_or_404

# Create your views here.
from django.http import JsonResponse
from django.contrib.auth.models import User
from rest_framework.views import APIView
from rest_framework import viewsets,permissions,generics,status
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView,TokenRefreshView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from  rest_framework.exceptions import PermissionDenied
from rest_framework.generics import UpdateAPIView
from .models import Recipe,Ingredient,Review,Profile,Notification
from .serializers import RecipeSerializer,IngredientSerializer,ReviewSerializer,ProfileSerializer,NotificationSerializer
import json
import logging

logger = logging.getLogger(__name__)
# CREAT API VIEWS
class RecipeViewSet(viewsets.ModelViewSet):
    queryset = Recipe.objects.all()
    serializer_class = RecipeSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]   # adjust permissions later
    def perform_create(self, serializer):
        serializer.save(author=self.request.user) # save the author as the logged-in user
        
class IngredientViewSet(viewsets.ModelViewSet):
    queryset = Ingredient.objects.all()
    serializer_class = IngredientSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]   

class ReviewViewSet(viewsets.ModelViewSet):
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]  
    
    
class ReviewListCreateView(generics.ListCreateAPIView):
        serializer_class = ReviewSerializer
        permission_classes = [permissions.IsAuthenticatedOrReadOnly]
        
        def get_queryset(self):
            """retrun reviews for a specific recipe"""
            recipe_id = self.kwargs.get('recipe_id')
            return Review.objects.filter(recipe_id=recipe_id)
        
        def perform_create(self,serializer):
             """save the reivew with the logged user."""
             try:
                 recipe = Recipe.objects.get(id=self.kwargs['recipe_id'])
                 serializer.save(user=self.request.user, recipe=recipe)
             except Recipe.DoesNotExist:
               raise serializers.ValidationError({'error':'Recipe not found'},status=404)
             
class ReviewDetailView(generics.RetrieveUpdateDestroyAPIView):
    """allows users to view, update and delete a review"""
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
       """Ensure users can only edite or delete their own reviews"""
       review = super().get_object()
       if review.user != self.request.user:
           raise PermissionDenied("You don't have permission to edit or delete this review.")      
       return review
    def delete(self, request, *args, **kwargs):
       """custom delete response instead of 204 no content"""
       review = self.get_object()
       self.perform_destroy(review)
       return JsonResponse({'message':'Review deleted successfully'},status=200)
   
   
class ReviewLikeDislikeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, review_id, action):
        review = get_object_or_404(Review, id=review_id)
        user = request.user
        reviewer = review.user

        if action == 'like':
            if user in review.likes.all():
                review.likes.remove(user)
                message = 'Like removed'
            else:
                review.likes.add(user)
                review.dislikes.remove(user)  # Remove dislike if exists
                message = 'Review liked'
                if reviewer != user:
                    Notification.objects.create(
                        user=reviewer,
                        message=f"{user.username} liked your review on {review.recipe.name}!"
                    )

        elif action == 'dislike':
            if user in review.dislikes.all():
                review.dislikes.remove(user)
                message = 'Dislike removed'
            else:
                review.dislikes.add(user)
                review.likes.remove(user)  # Remove like if exists
                message = 'Review disliked'
                if reviewer != user:
                    Notification.objects.create(
                        user=reviewer,
                        message=f"{user.username} disliked your review on {review.recipe.name}!"
                    )

        review.save()
        return Response({
            'message': message,
            'like_count': review.likes.count(),
            'dislike_count': review.dislikes.count()
        }, status=status.HTTP_200_OK)
# create api to fetch notifications
class NotificationListView(generics.ListAPIView):
    """return a list of unread notifications for the logged-in user."""
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Notification.objects.filter(
            user=self.request.user,
            is_read=False
            ).order_by('-created_at')
        
    
class MarkNotificationAsReadView(UpdateAPIView):
    """mark a single notification as read"""
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    
    def patch(self,request,pk):
        notification = get_object_or_404(Notification, id=pk, user=request.user)
        notification.is_read = True
        notification.save()
        return Response({"message":"Notification marked as read"}, status=200)
    
class MarkAllNotificationsAsReadView(APIView):
    """mark all notifications as read"""
    permission_classes = [permissions.IsAuthenticated]
    
    def patch(self,request):
        notifications = Notification.objects.filter(user=request.user,is_read=False)
        count = notifications.update(is_read=True) #mark all as read
        return Response({"message":f"{count} notifications marked as read"}, status=200)    
    
class ProfileViewSet(viewsets.ModelViewSet):
    queryset = Profile.objects.all()
    serializer_class = ProfileSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]   


class FavoriteRecipeView(generics.UpdateAPIView):
    serializer_class = ProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        return self.request.user.profile
    
    def patch(self, request, *args, **kwargs):
        Profile = self.get_object()
        recipe_id = request.data.get('recipe_id')
        try:
            recipe = Recipe.objects.get(id=recipe_id)
            
            if recipe in Profile.favorites.all():
                Profile.favorites.remove(recipe)
                return Response({'message':'Recipe removed from favorites'})
            else:
                Profile.favorites.add(recipe)
                return Response({'message':'Recipe added to favorites'})
        except Recipe.DoesNotExist:
            return Response({'message':'Recipe not found'},status=404)
    
    # create authentication views JWT    
class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        logger.info(f"Login attempt for username: {attrs['username']}")
        return data

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


class CustomTokenRefreshView(TokenRefreshView):
    pass


class FavoriteRecipeListView(generics.ListAPIView):
    serializer_class = RecipeSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return self.request.user.profile.favorites.all()
    
    
#frontend views

def home(request):
    return render(request, 'index.html')


class RecipeSearchView(generics.ListAPIView):
    serializer_class = RecipeSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        queryset = Recipe.objects.all()
        ingredients = self.request.query_params.get('ingredients', None)
        category = self.request.query_params.get('category', None)
        dietary_restrictions = self.request.query_params.get('dietary_restrictions', None)

        if ingredients:
            queryset = queryset.filter(ingredients__icontains=ingredients)
        if category:
            queryset = queryset.filter(category__iexact=category)
        if dietary_restrictions:
            queryset = queryset.filter(dietary_restrictions__iexact=dietary_restrictions)

        return queryset