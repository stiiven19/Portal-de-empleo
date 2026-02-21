import pytest
from rest_framework.test import APIClient
from usuarios.models import Usuario
from empleos.models import Vacante

@pytest.mark.django_db
def test_crear_vacante_como_reclutador(usuario_factory):
    reclutador = usuario_factory(rol='reclutador')
    client = APIClient()
    client.force_authenticate(user=reclutador)
    data = {
        'titulo': 'Ingeniero de Datos',
        'descripcion': 'Experiencia en ETL',
        'requisitos': 'Python, SQL',
        'ubicacion': 'Medellín',
        'tipo_contrato': 'Tiempo completo'
    }
    response = client.post('/api/empleos/vacantes/', data)
    assert response.status_code == 201
    assert Vacante.objects.filter(titulo='Ingeniero de Datos').exists()
