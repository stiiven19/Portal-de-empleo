# import pytest
# from usuarios.models import Usuario
# from empleos.models import Vacante
# from postulaciones.models import Postulacion

# @pytest.mark.django_db
# def test_str_postulacion():
#     candidato = Usuario.objects.create_user(username="candi", rol="candidato", password="test1234")
#     reclutador = Usuario.objects.create_user(username="reclu", rol="reclutador", password="test1234")
#     vacante = Vacante.objects.create(
#         titulo="Fullstack Developer",
#         descripcion="React y Django",
#         requisitos="3 años",
#         reclutador=reclutador
#     )
#     postulacion = Postulacion.objects.create(candidato=candidato, vacante=vacante)
#     assert str(postulacion) == "candi - Fullstack Developer"
