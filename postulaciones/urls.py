from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    PostulacionViewSet,
    PostulacionesDeMisVacantesView,
    PostulacionesPorVacanteView, 
    MisPostulacionesView,
)

router = DefaultRouter()
router.register(r'postulaciones', PostulacionViewSet, basename='postulaciones')

urlpatterns = [
    path('', include(router.urls)),  # Incluye las rutas del ViewSet

    # Rutas personalizadas
    path('postulaciones-por-vacante/', PostulacionesPorVacanteView.as_view(), name='postulaciones-por-vacante'),
    path('postulaciones-recibidas/', PostulacionesDeMisVacantesView.as_view(), name='postulaciones-recibidas'), # Para el reclutador
    path('mis-postulaciones/', MisPostulacionesView.as_view(), name='mis-postulaciones'),
]
