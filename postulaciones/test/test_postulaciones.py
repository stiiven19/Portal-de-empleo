import pytest
from django.urls import reverse
from rest_framework.test import APIClient
from usuarios.models import Usuario
from empleos.models import Vacante
from postulaciones.models import Postulacion

@pytest.mark.django_db
def test_postulacion_exitosa():
    candidato = Usuario.objects.create_user(
        username="candidato_post",
        email="candidato@post.com",
        password="Candi123$",
        rol="candidato"
    )

    reclutador = Usuario.objects.create_user(
        username="reclu_post",
        email="reclu@post.com",
        password="Reclu123$",
        rol="reclutador"
    )

    vacante = Vacante.objects.create(
        titulo="Data Scientist",
        descripcion="Trabajo con modelos de ML",
        requisitos="Python, Pandas",
        ubicacion="Remoto",
        tipo_contrato="Indefinido",
        reclutador=reclutador
    )

    client = APIClient()
    client.force_authenticate(user=candidato)

    url = reverse("postulaciones-list")
    response = client.post(url, {"vacante": vacante.id})

    assert response.status_code == 201
    assert response.data["mensaje"] == "Postulación registrada exitosamente."
    assert response.data["postulacion"]["vacante"]["titulo"] == "Data Scientist"

@pytest.mark.django_db
def test_postulacion_sin_autenticacion_falla():
    reclutador = Usuario.objects.create_user(
        username="recluref",
        email="recluref@test.com",
        password="Test1234$",
        rol="reclutador"
    )

    vacante = Vacante.objects.create(
        titulo="Analista de Datos",
        descripcion="Procesamiento de datos en SQL",
        requisitos="SQL, Excel",
        ubicacion="Bogotá",
        tipo_contrato="Término fijo",
        reclutador=reclutador
    )

    client = APIClient()
    url = reverse("postulaciones-list")
    response = client.post(url, {"vacante": vacante.id})  # No autenticado

    assert response.status_code == 401  # Unauthorized

@pytest.mark.django_db
def test_postulacion_duplicada_falla():
    candidato = Usuario.objects.create_user(
        username="candi_dup",
        email="dup@post.com",
        password="CandiDup123$",
        rol="candidato"
    )

    reclutador = Usuario.objects.create_user(
        username="reclu_dup",
        email="reclu@dup.com",
        password="RecluDup123$",
        rol="reclutador"
    )

    vacante = Vacante.objects.create(
        titulo="UX Designer",
        descripcion="Diseño centrado en el usuario",
        requisitos="Figma, Adobe XD",
        ubicacion="Remoto",
        tipo_contrato="Indefinido",
        reclutador=reclutador
    )

    client = APIClient()
    client.force_authenticate(user=candidato)

    url = reverse("postulaciones-list")

    # Primera postulación ✅
    res1 = client.post(url, {"vacante": vacante.id})
    assert res1.status_code == 201

    # Segunda postulación ❌
    res2 = client.post(url, {"vacante": vacante.id})
    assert res2.status_code == 400
    assert "mensaje" in res2.data
    assert "Ya te postulaste a esta vacante." in res2.data["mensaje"]

@pytest.mark.django_db
def test_listar_mis_postulaciones():
    candidato = Usuario.objects.create_user(
        username="candi_list",
        email="list@candi.com",
        password="TestList123$",
        rol="candidato"
    )

    reclutador = Usuario.objects.create_user(
        username="reclulist",
        email="reclulist@test.com",
        password="Test1234",
        rol="reclutador"
    )

    vacante = Vacante.objects.create(
        titulo="Backend Jr",
        descripcion="Trabajo con APIs",
        requisitos="Python",
        ubicacion="Remoto",
        tipo_contrato="Término fijo",
        reclutador=reclutador
    )

    Postulacion.objects.create(candidato=candidato, vacante=vacante)

    client = APIClient()
    client.force_authenticate(user=candidato)

    url = reverse("mis-postulaciones")
    response = client.get(url)

    assert response.status_code == 200
    resultados = response.data.get("results", response.data)
    assert any(p["vacante"]["titulo"] == "Backend Jr" for p in resultados)

@pytest.mark.django_db
def test_postulaciones_recibidas_reclutador():
    candidato = Usuario.objects.create_user(
        username="candidato_1",
        email="c1@test.com",
        password="Candi123$",
        rol="candidato"
    )
    reclutador = Usuario.objects.create_user(
        username="reclu_1",
        email="reclu1@test.com",
        password="Reclu123$",
        rol="reclutador"
    )

    vacante = Vacante.objects.create(
        titulo="QA Manual",
        descripcion="Pruebas funcionales",
        requisitos="Test Cases",
        ubicacion="Medellín",
        tipo_contrato="Término fijo",
        reclutador=reclutador
    )

    Postulacion.objects.create(candidato=candidato, vacante=vacante)

    client = APIClient()
    client.force_authenticate(user=reclutador)

    url = reverse("postulaciones-recibidas")
    response = client.get(url)

    assert response.status_code == 200
    resultados = response.data.get("results", response.data)
    assert any(p["vacante"]["titulo"] == "QA Manual" for p in resultados)

@pytest.mark.django_db
def test_mis_postulaciones_restringido_a_reclutador():
    reclutador = Usuario.objects.create_user(
        username="reclu_prohibido",
        email="no@postular.com",
        password="Reclu123$",
        rol="reclutador"
    )

    client = APIClient()
    client.force_authenticate(user=reclutador)

    url = reverse("mis-postulaciones")
    response = client.get(url)

    assert response.status_code == 200
    assert response.data["count"] == 0
    assert response.data["results"] == []

@pytest.mark.django_db
def test_actualizar_estado_postulacion_por_reclutador():
    reclutador = Usuario.objects.create_user(
        username="reclu_estado",
        email="reclu_estado@test.com",
        password="Reclu123$",
        rol="reclutador"
    )
    candidato = Usuario.objects.create_user(
        username="candi_estado",
        email="candi_estado@test.com",
        password="Candi123$",
        rol="candidato"
    )

    vacante = Vacante.objects.create(
        titulo="Tester",
        descripcion="QA",
        requisitos="Metodologías ágiles",
        ubicacion="Remoto",
        tipo_contrato="Término fijo",
        reclutador=reclutador
    )

    postulacion = Postulacion.objects.create(
        candidato=candidato,
        vacante=vacante,
        estado="en revision"
    )

    client = APIClient()
    client.force_authenticate(user=reclutador)

    url = reverse("postulaciones-detail", args=[postulacion.id])
    response = client.patch(url, {"estado": "seleccionado"}, format="json")

    assert response.status_code == 200
    assert response.data["estado"] == "seleccionado"

@pytest.mark.django_db
def test_candidato_no_puede_actualizar_postulacion():
    reclutador = Usuario.objects.create_user(
        username="reclu_noedit",
        email="rnoedit@test.com",
        password="Reclu123$",
        rol="reclutador"
    )
    candidato = Usuario.objects.create_user(
        username="candi_noedit",
        email="cnoedit@test.com",
        password="Candi123$",
        rol="candidato"
    )

    vacante = Vacante.objects.create(
        titulo="Dev Jr",
        descripcion="Aprendizaje continuo",
        requisitos="Ganas de aprender",
        ubicacion="Pasto",
        tipo_contrato="Práctica",
        reclutador=reclutador
    )

    postulacion = Postulacion.objects.create(
        candidato=candidato,
        vacante=vacante,
        estado="en revision"
    )

    client = APIClient()
    client.force_authenticate(user=candidato)

    url = reverse("postulaciones-detail", args=[postulacion.id])
    response = client.patch(url, {"estado": "seleccionado"}, format="json")

    assert response.status_code == 403  # Forbidden
