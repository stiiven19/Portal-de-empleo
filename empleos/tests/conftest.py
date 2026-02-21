# conftest.py

import pytest
from usuarios.models import Usuario, PerfilReclutador
from empleos.models import Vacante

@pytest.fixture
def usuario_factory(db):
    def create_usuario(**kwargs):
        defaults = {
            'username': 'reclutador_test',
            'email': 'reclutador@test.com',
            'password': 'Testpass1234',
            'rol': 'reclutador',
        }
        defaults.update(kwargs)
        usuario = Usuario.objects.create_user(**defaults)
        PerfilReclutador.objects.create(user=usuario, empresa='Empresa X', telefono='123456789', cargo='Gerente')
        return usuario
    return create_usuario

@pytest.fixture
def vacante_factory(db, usuario_factory):
    def create_vacante(**kwargs):
        reclutador = usuario_factory()
        defaults = {
            'titulo': 'Desarrollador Backend',
            'descripcion': 'Descripción de la vacante',
            'ubicacion': 'Ciudad',
            #'salario': 4000.0,
            'reclutador': reclutador,
        }
        defaults.update(kwargs)
        return Vacante.objects.create(**defaults)
    return create_vacante
