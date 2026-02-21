from django.db import models
from django.conf import settings
from empleos.models import Vacante

# Create your models here.

class Postulacion(models.Model):
    candidato = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='postulaciones'
    )
    vacante = models.ForeignKey(
        Vacante, on_delete=models.CASCADE, related_name='postulaciones'
    )
    fecha_postulacion = models.DateTimeField(auto_now_add=True)
    estado = models.CharField(
        max_length=30,
        choices=[('en revision', 'En revisión'), ('descartado', 'Descartado'), ('seleccionado', 'Seleccionado')],
        default='en revision'
    )

    class Meta:
        unique_together = ['candidato', 'vacante']

    def __str__(self):
        return f"{self.candidato.username} - {self.vacante.titulo}"
