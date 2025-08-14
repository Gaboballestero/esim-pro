from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'categories', views.SupportCategoryViewSet)
router.register(r'tickets', views.SupportTicketViewSet, basename='ticket')
router.register(r'faq', views.FAQViewSet, basename='faq')
router.register(r'chat', views.ChatSessionViewSet, basename='chat')
router.register(r'knowledge-base', views.SupportKnowledgeBaseViewSet, basename='knowledge-base')
router.register(r'quick', views.QuickSupportView, basename='quick-support')

urlpatterns = [
    path('', include(router.urls)),
]
