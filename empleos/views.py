# from rest_framework.permissions import IsAuthenticated    
from rest_framework import viewsets, permissions, status
from rest_framework.exceptions import PermissionDenied
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters
from .models import Vacante
from .serializers import VacanteSerializer
from rest_framework.response import Response

# Create your views here.
class VacanteViewSet(viewsets.ModelViewSet):
    serializer_class = VacanteSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['ubicacion', 'tipo_contrato']
    search_fields = ['titulo', 'descripcion', 'requisitos']
    ordering_fields = ['fecha_publicacion', 'titulo']
    
    def get_permissions(self):
        if self.action in ['update', 'partial_update', 'destroy']:
            return [permissions.IsAuthenticated()]
        return super().get_permissions()
    
    def get_queryset(self):
        user = self.request.user
        
        # Para edición o eliminación, filtra por reclutador
        if self.action in ['update', 'partial_update', 'destroy']:
            return Vacante.objects.filter(reclutador=user)
        
        # Si está autenticado y es reclutador -> solo sus vacantes  
        if user.is_authenticated and user.rol == 'reclutador':
            return Vacante.objects.filter(reclutador=user).order_by('-fecha_publicacion')
        
        # Todos los usuarios ven vacantes publicadas
        return Vacante.objects.all().order_by('-fecha_publicacion')
    
    def perform_create(self, serializer):
        # valida el rol (solo reclutadores pueden crear vacantes)
        user = self.request.user
        if user.rol != 'reclutador':
            raise PermissionDenied("Solo los reclutadores pueden crear vacantes.")
        serializer.save(reclutador=user)
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        self.perform_create(serializer)
        
        return Response({
            "mensaje": "Vacante publicada con éxito.",
            "vacante": serializer.data
        }, status=status.HTTP_201_CREATED)
    
