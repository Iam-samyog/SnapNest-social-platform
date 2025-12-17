from django.contrib.auth import views as auth_views
from django.urls import path,include
from .import views
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .api import UserViewSet




router = DefaultRouter()
router.register(r'users', UserViewSet)
urlpatterns=[
    # path('login/',auth_views.LoginView.as_view(),name='login'),
    # path('logout/',auth_views.LogoutView.as_view(),name='logout'),
    # path('password-change/',auth_views.PasswordChangeView.as_view(),name='password_change'),
    # path('password-change/done/',auth_views.PasswordChangeDoneView.as_view(),name='password_change_done'),
    # path('password-reset',auth_views.PasswordResetView.as_view(),name='password_reset'),
    # path('password-reset/done/',auth_views.PasswordResetDoneView.as_view(),name='password_reset_done'),
    # path('password-reset/<uidb64>/<token>',auth_views.PasswordResetConfirmView.as_view(),name='password_reset_confirm'),
    # path('password-reset/complete',auth_views.PasswordResetCompleteView.as_view(),name='password_reset_complete'),
    path('',include('django.contrib.auth.urls')),
    path('',views.dashboard,name='dashboard'),
    path('register/',views.register,name='register'),
    path('edit/',views.edit,name='edit'),
    path('users/',views.user_list,name='user_list'),
    path('users/search/',views.user_search,name='user_search'),
    path('users/follow/',views.user_follow,name='user_follow'),
    path('users/<username>/',views.user_detail,name='user_detail'),
    path('', include(router.urls)),
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]