import factory
from empleos.models import Vacante
from usuarios.tests.factories import UsuarioFactory

class VacanteFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Vacante

    reclutador = factory.SubFactory(UsuarioFactory, rol='reclutador')
    titulo = 'Desarrollador Backend'
    descripcion = 'Experiencia en Django'
    requisitos = 'Python, Django'
    ubicacion = 'Bogotá'
    tipo_contrato = 'Tiempo completo'
