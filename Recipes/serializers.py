from rest_framework import serializers
from .models import Recipe,Ingredient,Review,Profile,Notification


class RecipeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Recipe
        fields = '__all__'
        
class IngredientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ingredient
        fields = '__all__'

class ReviewSerializer(serializers.ModelSerializer):
    user =serializers.ReadOnlyField(source = 'user.username')
    recipe = serializers.PrimaryKeyRelatedField(read_only=True)
    rating = serializers.IntegerField(required=True)
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
    class Meta:
        model = Profile
        fields = '__all__'
        
class ProfileSerializer(serializers.ModelSerializer):
    favorites = serializers.PrimaryKeyRelatedField(many=True, queryset=Recipe.objects.all())

    class Meta:
        model = Profile
        fields = ['favorites']