from django.contrib import admin
from .models import ReferralCode, Referral, LoyaltyPoints, PointsTransaction, Reward, RewardRedemption


@admin.register(ReferralCode)
class ReferralCodeAdmin(admin.ModelAdmin):
    list_display = ('user', 'code', 'created_at', 'is_active')
    list_filter = ('is_active', 'created_at')
    search_fields = ('user__username', 'user__email', 'code')
    readonly_fields = ('code', 'created_at')


@admin.register(Referral)
class ReferralAdmin(admin.ModelAdmin):
    list_display = ('referrer', 'referred', 'referral_code', 'reward_given', 'reward_amount', 'created_at')
    list_filter = ('reward_given', 'created_at')
    search_fields = ('referrer__username', 'referred__username', 'referral_code__code')
    readonly_fields = ('created_at',)


@admin.register(LoyaltyPoints)
class LoyaltyPointsAdmin(admin.ModelAdmin):
    list_display = ('user', 'available_points', 'total_points', 'lifetime_points', 'tier', 'updated_at')
    list_filter = ('tier', 'created_at')
    search_fields = ('user__username', 'user__email')
    readonly_fields = ('created_at', 'updated_at')


@admin.register(PointsTransaction)
class PointsTransactionAdmin(admin.ModelAdmin):
    list_display = ('user', 'points', 'transaction_type', 'reason', 'created_at')
    list_filter = ('transaction_type', 'created_at')
    search_fields = ('user__username', 'reason')
    readonly_fields = ('created_at',)


@admin.register(Reward)
class RewardAdmin(admin.ModelAdmin):
    list_display = ('name', 'points_required', 'reward_type', 'is_active', 'current_redemptions', 'max_redemptions')
    list_filter = ('reward_type', 'is_active', 'created_at')
    search_fields = ('name', 'description')


@admin.register(RewardRedemption)
class RewardRedemptionAdmin(admin.ModelAdmin):
    list_display = ('user', 'reward', 'points_spent', 'used', 'redeemed_at')
    list_filter = ('used', 'redeemed_at')
    search_fields = ('user__username', 'reward__name')
    readonly_fields = ('redeemed_at',)
