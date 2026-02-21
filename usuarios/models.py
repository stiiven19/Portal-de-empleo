from django.db import models
from django.conf import settings
from django.contrib.auth.models import AbstractUser

# Usuario principal
class Usuario(AbstractUser):
    class Rol(models.TextChoices):
        CANDIDATO = 'candidato', 'Candidato'
        RECLUTADOR = 'reclutador', 'Reclutador'

    rol = models.CharField(max_length=20, choices=Rol.choices)

    def __str__(self):
        return f"{self.username} ({self.rol})"


# Perfil para Candidato
class PerfilCandidato(models.Model):
    user = models.OneToOneField(Usuario, on_delete=models.CASCADE, related_name='perfil_candidato')
    telefono = models.CharField(max_length=20)
    ciudad = models.CharField(max_length=100)
    experiencia = models.TextField(blank=True, null=True)
    formacion = models.TextField(blank=True, null=True)
    habilidades = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"Perfil Candidato: {self.user.username}"

# Perfil para Reclutador
class PerfilReclutador(models.Model):
    user = models.OneToOneField(Usuario, on_delete=models.CASCADE, related_name='perfil_reclutador')
    empresa = models.CharField(max_length=100)
    cargo = models.CharField(max_length=100)
    telefono = models.CharField(max_length=20)
    sitio_web = models.URLField(blank=True, null=True)

    def __str__(self):
        return f"Perfil Reclutador: {self.user.username} - {self.empresa}"
