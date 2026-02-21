import pytest
from empleos.models import Vacante
from usuarios.models import Usuario

@pytest.mark.django_db
def test_str_vacante():
    reclutador = Usuario.objects.create_user(username="reclu", rol="reclutador", password="test1234")
    vacante = Vacante.objects.create(
        titulo="Backend Developer",
        descripcion="Python y Django",
        requisitos="2 años de experiencia",
        reclutador=reclutador
    )
    assert str(vacante) == "Backend Developer"
