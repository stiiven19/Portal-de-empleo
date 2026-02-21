# import pytest
# from usuarios.models import Usuario, PerfilCandidato, PerfilReclutador

# @pytest.mark.django_db
# def test_str_usuario():
#     user = Usuario(username="testuser", rol="candidato")
#     assert str(user) == "testuser (candidato)"

# @pytest.mark.django_db
# def test_str_perfil_candidato():
#     user = Usuario.objects.create_user(username="testuser", rol="candidato", password="test1234")
#     perfil = PerfilCandidato.objects.create(user=user, telefono="123456", ciudad="Pasto")
#     assert str(perfil) == "Perfil Candidato: testuser"

# @pytest.mark.django_db
# def test_str_perfil_reclutador():
#     user = Usuario.objects.create_user(username="reclu", rol="reclutador", password="test1234")
#     perfil = PerfilReclutador.objects.create(user=user, telefono="987654", empresa="Empresa X", cargo="Gerente")
#     assert str(perfil) == "Perfil Reclutador: reclu - Empresa X"