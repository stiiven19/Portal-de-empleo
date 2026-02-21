from rest_framework import serializers
from .models import Postulacion
from empleos.serializers import VacanteSerializer
from usuarios.models import PerfilCandidato
from usuarios.serializers import PerfilCandidatoSerializer

class PostulacionSerializer(serializers.ModelSerializer):
    perfil_candidato = serializers.SerializerMethodField()
    nombre = serializers.CharField(source='candidato.first_name', read_only=True)
    apellido = serializers.CharField(source='candidato.last_name', read_only=True)
    email = serializers.CharField(source='candidato.email', read_only=True)
    vacante = VacanteSerializer(read_only=True)  # 👈 Aquí está la clave
    
    class Meta:
        model = Postulacion
        fields = '__all__'
        read_only_fields = ['candidato', 'vacante', 'fecha_postulacion']
        
    def get_perfil_candidato(self, obj):
        perfil = getattr(obj.candidato, 'perfil_candidato', None)
        return PerfilCandidatoSerializer(perfil).data if perfil else None