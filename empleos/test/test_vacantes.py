import pytest
from django.urls import reverse
from rest_framework.test import APIClient
from usuarios.models import Usuario
from empleos.models import Vacante

@pytest.mark.django_db
def test_publicar_vacante_reclutador_autenticado():
    reclutador = Usuario.objects.create_user(
        username="reclu_test",
        email="reclu@test.com",
        password="RecluSeguro123",
        rol="reclutador"
    )

    client = APIClient()
    client.force_authenticate(user=reclutador)

    data = {
        "titulo": "Backend Developer",
        "descripcion": "Desarrollar APIs REST con Django.",
        "requisitos": "Experiencia con Django, DRF.",
        "ubicacion": "Remoto",
        "tipo_contrato": "Indefinido"
    }

    url = reverse("vacante-list")
    response = client.post(url, data)

    assert response.status_code == 201
    assert response.data["vacante"]["titulo"] == "Backend Developer"

@pytest.mark.django_db
def test_publicar_vacante_sin_autenticacion():
    client = APIClient()
    data = {
        "titulo": "DevOps Engineer",
        "descripcion": "Manejo de infraestructura en la nube.",
        "requisitos": "AWS, Docker.",
        "ubicacion": "Bogotá",
        "tipo_contrato": "Término fijo"
    }
    url = reverse("vacante-list")
    response = client.post(url, data)

    assert response.status_code == 401

@pytest.mark.django_db
def test_publicar_vacante_como_candidato_falla():
    candidato = Usuario.objects.create_user(
        username="canditest",
        email="candi@test.com",
        password="TestCandi123",
        rol="candidato"
    )

    client = APIClient()
    client.force_authenticate(user=candidato)

    data = {
        "titulo": "QA Tester",
        "descripcion": "Pruebas manuales y automatizadas.",
        "requisitos": "Selenium, Cypress.",
        "ubicacion": "Cali",
        "tipo_contrato": "Prestación de servicios"
    }

    url = reverse("vacante-list")
    response = client.post(url, data)

    assert response.status_code == 403  # Permiso denegado

@pytest.mark.django_db
def test_publicar_vacante_sin_titulo():
    reclutador = Usuario.objects.create_user(
        username="reclu_error",
        email="recluerror@test.com",
        password="Test1234$",
        rol="reclutador"
    )
    client = APIClient()
    client.force_authenticate(user=reclutador)

    data = {
        "titulo": "",  # ❌ vacío
        "descripcion": "Desarrollar frontend.",
        "requisitos": "React, JS.",
        "ubicacion": "Remoto",
        "tipo_contrato": "Indefinido"
    }

    url = reverse("vacante-list")
    response = client.post(url, data)

    assert response.status_code == 400
    assert "titulo" in response.data

@pytest.mark.django_db
def test_listar_vacantes_reclutador_autenticado():
    reclutador = Usuario.objects.create_user(
        username="reclulista",
        email="reclulista@test.com",
        password="TestReclu123",
        rol="reclutador"
    )

    client = APIClient()
    client.force_authenticate(user=reclutador)

    # Crear vacante asociada al reclutador
    
    Vacante.objects.create(
        titulo="Ingeniero de Datos",
        descripcion="ETLs, BigQuery",
        requisitos="Python, SQL",
        ubicacion="Remoto",
        tipo_contrato="Indefinido",
        reclutador=reclutador
    )

    url = reverse("vacante-list")
    response = client.get(url)

    assert response.status_code == 200
    assert len(response.data.get("results", response.data)) > 0
    assert response.data.get("results", response.data)[0]["titulo"] == "Ingeniero de Datos"

@pytest.mark.django_db
def test_editar_vacante_reclutador_autenticado():
    user = Usuario.objects.create_user(
        username="reclu_edit",
        email="reclu@edit.com",
        password="RecluEdit123",
        rol="reclutador"
    )

    client = APIClient()
    client.force_authenticate(user=user)

    # Crear vacante inicial
    vacante = client.post(reverse("vacante-list"), {
        "titulo": "Dev Inicial",
        "descripcion": "Descripción inicial",
        "requisitos": "Requisitos básicos",
        "ubicacion": "Medellín",
        "tipo_contrato": "Término fijo"
    }).data["vacante"]

    # Editar vacante
    response = client.put(reverse("vacante-detail", args=[vacante["id"]]), {
        "titulo": "Dev Senior",
        "descripcion": "Nueva descripción",
        "requisitos": "Python, Django",
        "ubicacion": "Remoto",
        "tipo_contrato": "Indefinido"
    })

    assert response.status_code == 200
    assert response.data["titulo"] == "Dev Senior"
    assert response.data["tipo_contrato"] == "Indefinido"

@pytest.mark.django_db
def test_editar_vacante_ajena_falla():
    creador = Usuario.objects.create_user(
        username="dueño",
        email="dueno@test.com",
        password="Dueño123$",
        rol="reclutador"
    )
    otro = Usuario.objects.create_user(
        username="intruso",
        email="otro@test.com",
        password="Otro123$",
        rol="reclutador"
    )

    client = APIClient()
    client.force_authenticate(user=creador)

    vacante = client.post(reverse("vacante-list"), {
        "titulo": "Frontend Dev",
        "descripcion": "React y Tailwind",
        "requisitos": "HTML, CSS, JS",
        "ubicacion": "Cali",
        "tipo_contrato": "Término fijo"
    }).data["vacante"]

    # Autenticarse con otro usuario y tratar de editar
    client.force_authenticate(user=otro)
    response = client.put(reverse("vacante-detail", args=[vacante["id"]]), {
        "titulo": "Modificado por intruso",
        "descripcion": "Hackeo",
        "requisitos": "Ninguno",
        "ubicacion": "Misterio",
        "tipo_contrato": "Indefinido"
    })

    assert response.status_code in [403, 404]  # dependiendo si filtra o no la queryset

@pytest.mark.django_db
def test_eliminar_vacante_reclutador_autenticado():
    user = Usuario.objects.create_user(
        username="reclu_delete",
        email="delete@test.com",
        password="Delete123$",
        rol="reclutador"
    )

    client = APIClient()
    client.force_authenticate(user=user)

    # Crear vacante
    vacante = client.post(reverse("vacante-list"), {
        "titulo": "DevOps",
        "descripcion": "Infraestructura",
        "requisitos": "Docker, AWS",
        "ubicacion": "Bogotá",
        "tipo_contrato": "Indefinido"
    }).data["vacante"]

    # Eliminar vacante
    response = client.delete(reverse("vacante-detail", args=[vacante["id"]]))
    assert response.status_code == 204

@pytest.mark.django_db
def test_eliminar_vacante_ajena_falla():
    creador = Usuario.objects.create_user(
        username="dueno_eliminar",
        email="dueno@elim.com",
        password="DuenoDelete123",
        rol="reclutador"
    )
    otro = Usuario.objects.create_user(
        username="otro_user",
        email="otro@elim.com",
        password="OtroDelete123",
        rol="reclutador"
    )

    client = APIClient()
    client.force_authenticate(user=creador)

    vacante = client.post(reverse("vacante-list"), {
        "titulo": "Data Analyst",
        "descripcion": "SQL, Python",
        "requisitos": "Excel, Power BI",
        "ubicacion": "Pasto",
        "tipo_contrato": "Prestación de servicios"
    }).data["vacante"]

    # Intento de otro usuario
    client.force_authenticate(user=otro)
    response = client.delete(reverse("vacante-detail", args=[vacante["id"]]))

    assert response.status_code in [403, 404]  # según cómo esté filtrado el queryset
