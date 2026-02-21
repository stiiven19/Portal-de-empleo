import pytest
from rest_framework.test import APIClient
from usuarios.models import Usuario
from empleos.models import Vacante
from postulaciones.models import Postulacion

@pytest.mark.django_db
def test_postularse_a_vacante(usuario_factory, vacante_factory):
    candidato = usuario_factory(rol='candidato')
    vacante = vacante_factory()
    client = APIClient()
    client.force_authenticate(user=candidato)
    data = {
        'vacante': vacante.id,
        'mensaje': 'Me gustaría postularme a esta vacante.'
    }
    response = client.post('/api/postulaciones/', data)
    assert response.status_code == 201
    assert Postulacion.objects.filter(candidato=candidato, vacante=vacante).exists()
