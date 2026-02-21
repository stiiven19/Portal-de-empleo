import pytest
from django.urls import reverse
from rest_framework.test import APIClient
from usuarios.models import Usuario

@pytest.mark.django_db
def test_perfil_usuario_autenticado():
    user = Usuario.objects.create_user(
        username="perfil_user",
        email="perfil@test.com",
        password="Test1234Seguro$",
        first_name="Juan",
        last_name="Pérez",
        rol="candidato"
    )

    client = APIClient()
    client.force_authenticate(user=user)  # 👈 fuerza login

    url = reverse("mi-perfil")
    response = client.get(url)

    assert response.status_code == 200
    assert response.data["usuario"]["username"] == "perfil_user"
    assert response.data["usuario"]["email"] == "perfil@test.com"
    assert response.data["usuario"]["rol"] == "candidato"

@pytest.mark.django_db
def test_perfil_usuario_sin_autenticacion():
    client = APIClient()
    url = reverse("mi-perfil")
    response = client.get(url)

    assert response.status_code == 401  # no autorizado