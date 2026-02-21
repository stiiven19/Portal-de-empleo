import pytest
from postulaciones.models import Postulacion

@pytest.mark.django_db
def test_creacion_postulacion(postulacion_factory):
    postulacion = postulacion_factory()
    assert postulacion.mensaje == 'Estoy interesado en esta vacante.'
    assert postulacion.candidato.rol == 'candidato'
