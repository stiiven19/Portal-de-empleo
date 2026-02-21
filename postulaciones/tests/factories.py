import factory
from postulaciones.models import Postulacion
from usuarios.tests.factories import UsuarioFactory
from empleos.tests.factories import VacanteFactory

class PostulacionFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Postulacion

    candidato = factory.SubFactory(UsuarioFactory, rol='candidato')
    vacante = factory.SubFactory(VacanteFactory)
    mensaje = 'Estoy interesado en esta vacante.'
