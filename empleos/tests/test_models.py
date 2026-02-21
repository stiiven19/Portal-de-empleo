import pytest
from empleos.models import Vacante

@pytest.mark.django_db
def test_creacion_vacante(vacante_factory):
    vacante = vacante_factory()
    assert vacante.titulo == 'Desarrollador Backend'
    assert vacante.reclutador.rol == 'reclutador'
