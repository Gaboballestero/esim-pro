from rest_framework import serializers
from .models import ReferralCode, Referral, LoyaltyPoints, PointsTransaction, Reward, RewardRedemption


class ReferralCodeSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReferralCode
        fields = ('code', 'created_at', 'is_active')
        read_only_fields = ('code', 'created_at')


class ReferralSerializer(serializers.ModelSerializer):
    referrer_name = serializers.CharField(source='referrer.username', read_only=True)
    referred_name = serializers.CharField(source='referred.username', read_only=True)
    
    class Meta:
        model = Referral
        fields = ('referrer_name', 'referred_name', 'reward_given', 'reward_amount', 'created_at')
        read_only_fields = ('referrer_name', 'referred_name', 'reward_given', 'reward_amount', 'created_at')


class LoyaltyPointsSerializer(serializers.ModelSerializer):
    tier_display = serializers.CharField(source='get_tier_display', read_only=True)
    
    class Meta:
        model = LoyaltyPoints
        fields = ('total_points', 'available_points', 'lifetime_points', 'tier', 'tier_display')
        read_only_fields = ('total_points', 'available_points', 'lifetime_points', 'tier', 'tier_display')


class PointsTransactionSerializer(serializers.ModelSerializer):
    transaction_type_display = serializers.CharField(source='get_transaction_type_display', read_only=True)
    
    class Meta:
        model = PointsTransaction
        fields = ('points', 'transaction_type', 'transaction_type_display', 'reason', 'created_at')
        read_only_fields = ('points', 'transaction_type', 'transaction_type_display', 'reason', 'created_at')


class RewardSerializer(serializers.ModelSerializer):
    reward_type_display = serializers.CharField(source='get_reward_type_display', read_only=True)
    can_redeem = serializers.SerializerMethodField()
    
    class Meta:
        model = Reward
        fields = ('id', 'name', 'description', 'points_required', 'discount_percentage', 
                 'discount_amount', 'reward_type', 'reward_type_display', 'can_redeem')
    
    def get_can_redeem(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            try:
                loyalty_points = request.user.loyalty_points
                return loyalty_points.available_points >= obj.points_required
            except:
                return False
        return False


class RewardRedemptionSerializer(serializers.ModelSerializer):
    reward_name = serializers.CharField(source='reward.name', read_only=True)
    
    class Meta:
        model = RewardRedemption
        fields = ('id', 'reward_name', 'points_spent', 'used', 'redeemed_at', 'used_at')
        read_only_fields = ('id', 'reward_name', 'points_spent', 'used', 'redeemed_at', 'used_at')


class ReferFriendSerializer(serializers.Serializer):
    email = serializers.EmailField()
    message = serializers.CharField(max_length=500, required=False)
    
    def validate_email(self, value):
        from django.contrib.auth import get_user_model
        User = get_user_model()
        
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Este email ya está registrado.")
        return value
