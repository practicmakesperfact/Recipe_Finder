from rest_framework import serializers
from .models import Recipe,Ingredient,Review,Profile,Notification
from django.core.validators import MinValueValidator,MaxValueValidator


class RecipeSerializer(serializers.ModelSerializer):
    author = serializers.ReadOnlyField(source='author.username')
    class Meta:
        model = Recipe
        fields = '__all__'
        read_only_fields = ['author','created_at']  # prevent modification of these fields
        
class IngredientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ingredient
        fields = '__all__'

class ReviewSerializer(serializers.ModelSerializer):
    user =serializers.ReadOnlyField(source = 'user.username')
    recipe = serializers.PrimaryKeyRelatedField(read_only=True)
    rating = serializers.IntegerField(
        required=True,
        validators=[
            MinValueValidator(1),
            MaxValueValidator(5)
        ]
    )
    comment = serializers.CharField(required=True)
    like_count = serializers.SerializerMethodField()
    dislike_count = serializers.SerializerMethodField()

    
    class Meta:
        model = Review
        fields = ['id','user','recipe','rating','comment','created_at','like_count','dislike_count']
    
    def get_like_count(self,obj):
        return obj.likes.count()
    
    def get_dislike_count(self,obj):
        return obj.dislikes.count()
        
class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['id','message','is_read','created_at']
        read_only_fields = ['id','message','created_at']  # prevent users from modifing these fileds
        
class ProfileSerializer(serializers.ModelSerializer):
    favorites = RecipeSerializer(many=True, read_only=True) #shows full recipe details
    class Meta:
        model = Profile
        fields = 'user','favorites'
        read_only_fields = ['user']
        