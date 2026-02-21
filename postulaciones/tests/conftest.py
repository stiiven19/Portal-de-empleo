# conftest.py

import pytest
from usuarios.models import Usuario
from empleos.models import Vacante
from postulaciones.models import Postulacion

@pytest.fixture
def usuario_factory(db):
    def create_usuario(**kwargs):
        return Usuario.objects.create_user(
            username=kwargs.get("username", "usuario_test"),
            email=kwargs.get("email", "test@example.com"),
            password=kwargs.get("password", "password123"),
            rol=kwargs.get("rol", Usuario.Rol.CANDIDATO),
        )
    return create_usuario

@pytest.fixture
def vacante_factory(db, usuario_factory):
    def create_vacante(**kwargs):
        reclutador = kwargs.get("reclutador") or usuario_factory(rol=Usuario.Rol.RECLUTADOR)
        return Vacante.objects.create(
            titulo=kwargs.get("titulo", "Vacante de prueba"),
            descripcion=kwargs.get("descripcion", "Descripción"),
            requisitos=kwargs.get("requisitos", "Requisitos"),
            ubicacion=kwargs.get("ubicacion", "Ciudad"),
            tipo_jornada=kwargs.get("tipo_jornada", "Tiempo completo"),
            salario=kwargs.get("salario", 1000000),
            reclutador=reclutador,
        )
    return create_vacante

@pytest.fixture
def postulacion_factory(db, usuario_factory, vacante_factory):
    def create_postulacion(**kwargs):
        return Postulacion.objects.create(
            candidato=kwargs.get("candidato") or usuario_factory(rol=Usuario.Rol.CANDIDATO),
            vacante=kwargs.get("vacante") or vacante_factory(),
            mensaje=kwargs.get("mensaje", "Estoy interesado en esta vacante."),
        )
    return create_postulacion
