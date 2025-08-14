from django.urls import path
from . import views

app_name = 'rewards'

urlpatterns = [
    # Referidos
    path('referral-code/', views.ReferralCodeView.as_view(), name='referral_code'),
    path('my-referrals/', views.MyReferralsView.as_view(), name='my_referrals'),
    path('refer-friend/', views.refer_friend, name='refer_friend'),
    path('validate-referral/', views.validate_referral_code, name='validate_referral'),
    
    # Puntos de Fidelidad
    path('loyalty-points/', views.LoyaltyPointsView.as_view(), name='loyalty_points'),
    path('points-history/', views.PointsHistoryView.as_view(), name='points_history'),
    
    # Recompensas
    path('rewards/', views.AvailableRewardsView.as_view(), name='available_rewards'),
    path('my-redemptions/', views.MyRedemptionsView.as_view(), name='my_redemptions'),
    path('redeem/<int:reward_id>/', views.redeem_reward, name='redeem_reward'),
]
