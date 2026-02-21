from rest_framework import viewsets, permissions, serializers, generics, status
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters
from .models import Postulacion
from .serializers import PostulacionSerializer
from empleos.models import Vacante

# Create your views here.
class PostulacionViewSet(viewsets.ModelViewSet):
    serializer_class = PostulacionSerializer
    permission_classes = [permissions.IsAuthenticated]

    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['estado', 'vacante']  # 👈 puedes filtrar por estado o vacante ID
    search_fields = ['vacante__titulo', 'candidato__username']
    ordering_fields = ['fecha_postulacion']

    def get_queryset(self):
        user = self.request.user
        if user.rol == 'reclutador':
            return Postulacion.objects.filter(vacante__reclutador=user).select_related('candidato', 'vacante').order_by('-fecha_postulacion')
        elif user.rol == 'candidato':
            return Postulacion.objects.filter(candidato=user).select_related('vacante').order_by('-fecha_postulacion')
        return Postulacion.objects.none()

    def perform_create(self, serializer):
        user = self.request.user

        # Validar que el usuario sea candidato
        if user.rol != 'candidato':
            raise PermissionDenied("Solo los candidatos pueden postularse.")
        
        vacante_id = self.request.data.get('vacante')
        
        try:
            vacante_id = int(vacante_id)
        except (ValueError, TypeError):
            raise serializers.ValidationError({"vacante": "El ID de la vacante no es válido."})
        
        # Validar existencia de la vacante y duplicdos
        if not Vacante.objects.filter(id=vacante_id).exists():
            raise serializers.ValidationError({"vacante": "La vacante no existe."})
        
        # Validar que el candidato no se haya postulado antes (Postulación duplicada)
        if Postulacion.objects.filter(candidato=user, vacante_id=vacante_id).exists():
            raise serializers.ValidationError({"mensaje": ["Ya te postulaste a esta vacante."]})
        
        serializer.save(candidato=user, vacante_id=vacante_id)
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        
        return Response({
            "mensaje": "Postulación registrada exitosamente.",
            "postulacion": serializer.data
        }, status=status.HTTP_201_CREATED)
    
    def update(self, request, *args, **kwargs):
        postulacion = self.get_object()
        user = request.user
        
        if user != postulacion.vacante.reclutador:
            raise PermissionDenied("Solo el reclutador puede actualizar esta postulación.")
        
        return super().update(request, *args, **kwargs)

class PostulacionesDeMisVacantesView(generics.ListAPIView):
    serializer_class = PostulacionSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.rol != 'reclutador':
            return Postulacion.objects.none()
        return Postulacion.objects.filter(vacante__reclutador=user).select_related("candidato", "vacante").order_by('-fecha_postulacion')

class PostulacionesPorVacanteView(generics.ListAPIView):
    serializer_class = PostulacionSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        vacante_id = self.request.query_params.get('vacante')
    
        if user.rol != 'reclutador':
            return Postulacion.objects.none()
    
        return Postulacion.objects.filter(vacante__id=vacante_id, vacante__reclutador=user).select_related("candidato").order_by('-fecha_postulacion')

class MisPostulacionesView(generics.ListAPIView):
    serializer_class = PostulacionSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.rol != 'candidato':
            return Postulacion.objects.none()
        return Postulacion.objects.filter(candidato=user).select_related("vacante").order_by('-fecha_postulacion')
