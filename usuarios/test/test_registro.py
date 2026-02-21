import pytest
from usuarios.serializers import RegistroUsuarioSerializer

@pytest.mark.django_db
def test_registro_candidato_exitoso():
    data = {
        "username": "candidato_test",
        "email": "candidato@example.com",
        "password": "testpassword123",
        "first_name": "Carlos",
        "last_name": "López",
        "rol": "candidato",
        "perfil_candidato": {
            "telefono": "3111234567",
            "ciudad": "Pasto",
            "experiencia": "2 años en desarrollo web",
            "formacion": "Ingeniero de Sistemas",
            "habilidades": "Python, React"
        }
    }

    serializer = RegistroUsuarioSerializer(data=data)
    assert serializer.is_valid(), serializer.errors  # debe ser válido
    usuario = serializer.save()

    assert usuario.username == "candidato_test"
    assert usuario.rol == "candidato"
    assert usuario.perfil_candidato.ciudad == "Pasto"

@pytest.mark.django_db
def test_registro_reclutador_exitoso():
    data = {
        "username": "reclu_test",
        "email": "reclu@test.com",
        "password": "test1234x",
        "first_name": "Reclu",
        "last_name": "Tester",
        "rol": "reclutador",
        "perfil_reclutador": {
            "telefono": "123456",
            "empresa": "Empresa X",
            "cargo": "Líder de Talento"
        }
    }
    serializer = RegistroUsuarioSerializer(data=data)
    assert serializer.is_valid(), serializer.errors
    user = serializer.save()
    assert user.rol == "reclutador"
    assert user.perfil_reclutador.empresa == "Empresa X"

@pytest.mark.django_db
def test_registro_candidato_sin_perfil_falla():
    data = {
        "username": "candi_error",
        "email": "candierror@example.com",
        "password": "PruebaSegura1234$",
        "first_name": "Error",
        "last_name": "Prueba",
        "rol": "candidato"
        # ❌ Faltan los datos de perfil_candidato
    }

    serializer = RegistroUsuarioSerializer(data=data)
    is_valid = serializer.is_valid()

    assert not is_valid
    assert "perfil_candidato" in serializer.errors

@pytest.mark.django_db
def test_registro_reclutador_sin_perfil_falla():
    data = {
        "username": "reclu_error",
        "email": "recluerror@example.com",
        "password": "PruebaSegura1234$",
        "first_name": "Error",
        "last_name": "Prueba",
        "rol": "reclutador"
        # ❌ Faltan los datos de perfil_reclutador
    }

    serializer = RegistroUsuarioSerializer(data=data)
    is_valid = serializer.is_valid()

    assert not is_valid
    assert "perfil_reclutador" in serializer.errors

@pytest.mark.django_db
def test_registro_con_rol_invalido():
    data = {
        "username": "usuario_invalido",
        "email": "invalid@test.com",
        "password": "test12345",
        "first_name": "Fake",
        "last_name": "User",
        "rol": "estudiante",  # Rol inválido
    }
    serializer = RegistroUsuarioSerializer(data=data)
    assert not serializer.is_valid()

@pytest.mark.django_db
def test_registro_con_correo_duplicado_falla():
    data = {
        "username": "user1",
        "email": "repetido@test.com",
        "password": "PruebaSegura1234$",
        "first_name": "Uno",
        "last_name": "Test",
        "rol": "candidato",
        "perfil_candidato": {
            "telefono": "123456",
            "ciudad": "Pasto",
            "experiencia": "1 año",
            "formacion": "Técnico",
            "habilidades": "Python"
        }
    }
    # Primer registro OK
    serializer1 = RegistroUsuarioSerializer(data=data)
    assert serializer1.is_valid()
    serializer1.save()

    # Segundo con el mismo correo → debe fallar
    data["username"] = "otro_user"
    serializer2 = RegistroUsuarioSerializer(data=data)
    assert not serializer2.is_valid()
    assert "email" in serializer2.errors

@pytest.mark.django_db
def test_registro_username_duplicado_falla():
    from usuarios.serializers import RegistroUsuarioSerializer
    
    data = {
        "username": "duplicado",
        "email": "uno@test.com",
        "password": "UnaBuena123$",
        "first_name": "Uno",
        "last_name": "User",
        "rol": "candidato",
        "perfil_candidato": {
            "telefono": "3110000000",
            "ciudad": "Pasto",
            "experiencia": "Ninguna",
            "formacion": "Bachiller",
            "habilidades": "Ganas de aprender"
        }
    }
    
    # Primer registro debe funcionar
    serializer1 = RegistroUsuarioSerializer(data=data)
    assert serializer1.is_valid(), serializer1.errors
    serializer1.save()

    # Segundo intento con el mismo username (aunque el email sea distinto)
    data["email"] = "otro@test.com"
    serializer2 = RegistroUsuarioSerializer(data=data)
    assert not serializer2.is_valid()
    assert "username" in serializer2.errors


@pytest.mark.django_db
def test_contraseña_demasiado_comun_falla():
    data = {
        "username": "inseguro",
        "email": "inseguro@test.com",
        "password": "12345678",  # muy común
        "first_name": "Test",
        "last_name": "User",
        "rol": "candidato",
        "perfil_candidato": {
            "telefono": "123456",
            "ciudad": "Pasto",
            "experiencia": "1 año",
            "formacion": "Técnico",
            "habilidades": "Python"
        }
    }
    serializer = RegistroUsuarioSerializer(data=data)
    assert not serializer.is_valid()
    assert "password" in serializer.errors
