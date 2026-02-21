import pytest
from django.urls import reverse
from rest_framework.test import APIClient
from usuarios.models import Usuario

@pytest.mark.django_db
def test_login_exitoso():
    user = Usuario.objects.create_user(
        username="testlogin",
        email="login@test.com",
        password="Test1234Segura$",
        rol="candidato"
    )

    client = APIClient()
    url = reverse("login")  # usa el nombre del endpoint del login
    response = client.post(url, {
        "username": "testlogin",
        "password": "Test1234Segura$"
    })

    assert response.status_code == 200
    assert "access" in response.data
    assert "refresh" in response.data

@pytest.mark.django_db
def test_login_contraseña_incorrecta():
    Usuario.objects.create_user(
        username="testlogin2",
        email="otro@test.com",
        password="PasswordSegura123$",
        rol="candidato"
    )

    client = APIClient()
    url = reverse("login")  # usa el nombre del endpoint del login
    response = client.post(url, {
        "username": "testlogin2",
        "password": "incorrecta123"
    })

    assert response.status_code == 401
    assert "access" not in response.data

@pytest.mark.django_db
def test_login_usuario_no_existe():
    client = APIClient()
    url = reverse("login")
    response = client.post(url, {
        "username": "noexiste",
        "password": "algo123"
    })

    assert response.status_code == 401

@pytest.mark.django_db
def test_login_sin_datos():
    client = APIClient()
    url = reverse("login")
    response = client.post(url, {})  # sin datos

    assert response.status_code in [400, 401]

