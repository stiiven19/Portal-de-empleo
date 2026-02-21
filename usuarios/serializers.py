from rest_framework import serializers
from rest_framework.validators import UniqueValidator
from django.contrib.auth.password_validation import validate_password
from .models import Usuario, PerfilCandidato, PerfilReclutador

# Perfil del candidato
class PerfilCandidatoSerializer(serializers.ModelSerializer):
    class Meta:
        model = PerfilCandidato
        exclude = ['user']

# Perfil del reclutador
class PerfilReclutadorSerializer(serializers.ModelSerializer):
    class Meta:
        model = PerfilReclutador
        exclude = ['user']

# Usuario básico (para mostrar datos generales)
class UsuarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'rol']

# Registro combinado (Usuario + perfil según rol)
class RegistroUsuarioSerializer(serializers.ModelSerializer):
    perfil_candidato = PerfilCandidatoSerializer(required=False)
    perfil_reclutador = PerfilReclutadorSerializer(required=False)

    email = serializers.EmailField(
        required=True,
        validators=[UniqueValidator(queryset=Usuario.objects.all())],
    )

    username = serializers.CharField(
        required=True,
        validators=[UniqueValidator(queryset=Usuario.objects.all())],
    )

    password = serializers.CharField(
        write_only=True,
        required=True,
        validators=[
            validate_password,
        ],
    )

    class Meta:
        model = Usuario
        fields = [
            'username', 'email', 'password',
            'first_name', 'last_name', 'rol',
            'perfil_candidato', 'perfil_reclutador'
        ]

    def validate(self, data):
        rol = data.get('rol')

        if rol == 'candidato' and not data.get('perfil_candidato'):
            raise serializers.ValidationError({'perfil_candidato': 'Este campo es requerido para candidatos'})
        if rol == 'reclutador' and not data.get('perfil_reclutador'):
            raise serializers.ValidationError({'perfil_reclutador': 'Este campo es requerido para reclutadores'})
        return data

    def create(self, validated_data):
        perfil_candidato_data = validated_data.pop('perfil_candidato', None)
        perfil_reclutador_data = validated_data.pop('perfil_reclutador', None)
        password = validated_data.pop('password')
        
        # Crear usuario base
        usuario = Usuario(**validated_data)
        usuario.set_password(password)
        usuario.save()
        
        # Crear perfil según el rol
        if usuario.rol == 'candidato' and perfil_candidato_data:
            PerfilCandidato.objects.create(user=usuario, **perfil_candidato_data)
        elif usuario.rol == 'reclutador' and perfil_reclutador_data:
            PerfilReclutador.objects.create(user=usuario, **perfil_reclutador_data)
        
        return usuario


