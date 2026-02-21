from rest_framework import serializers
from .models import Vacante
from usuarios.models import Usuario
from usuarios.serializers import PerfilReclutadorSerializer

class ReclutadorMiniSerializer(serializers.ModelSerializer):
    perfil_reclutador = PerfilReclutadorSerializer()

    class Meta:
        model = Usuario
        fields = ['id', 'first_name', 'last_name', 'email', 'perfil_reclutador']

class VacanteSerializer(serializers.ModelSerializer):
    reclutador = ReclutadorMiniSerializer(read_only=True)  # 👈 aquí lo cambiamos
    
    class Meta:
        model = Vacante
        fields = '__all__'
        read_only_fields = ['reclutador', 'fecha_publicacion']
        extra_kwargs = {
            'titulo': {'required': True},
            'descripcion': {'required': True},
            'requisitos': {'required': True},
            'ubicacion': {'required': False},
            'tipo_contrato': {'required': True}
        }