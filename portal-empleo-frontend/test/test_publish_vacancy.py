import unittest
import os
import psycopg2
from dotenv import load_dotenv
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from urllib.parse import urlparse
import time

class PublishVacancyTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        # Cargar variables de entorno
        load_dotenv()

        # Configurar conexión a base de datos
        database_url = os.getenv('DATABASE_URL', 'postgresql://postgres:WgzqeiLqonzZSXcxqCUTjbgOpucHJMTr@gondola.proxy.rlwy.net:23203/railway')
        if not database_url:
            raise ValueError("DATABASE_URL environment variable is not set")

        # Parse the database URL
        url = urlparse(database_url)
        cls.db_params = {
            'dbname': url.path.lstrip('/'),  # Remove leading '/'
            'user': url.username,
            'password': url.password,
            'host': url.hostname,
            'port': url.port or 5432
        }

        # Inicializar WebDriver
        options = webdriver.ChromeOptions()
        options.add_argument('--no-sandbox')
        options.add_argument('--disable-dev-shm-usage')
        cls.driver = webdriver.Chrome(options=options)
        cls.driver.maximize_window()

        # Credenciales de reclutador

    def setUp(self):
        # Iniciar sesión antes de cada prueba
        self.driver.get('http://localhost:5173/login')
        
        # Encontrar e ingresar credenciales
        username_input = WebDriverWait(self.driver, 10).until(
            EC.presence_of_element_located((By.ID, "username"))
        )
        username_input.send_keys("johan")
        
        password_input = WebDriverWait(self.driver, 10).until(
            EC.presence_of_element_located((By.ID, "password"))
        )
        password_input.send_keys("1234prueba")
        
        # Enviar formulario de login
        login_button = self.driver.find_element(By.ID, "login-button")
        login_button.click()
        
        # Esperar a que cargue el dashboard de reclutador
        
        WebDriverWait(self.driver, 10).until(
            EC.presence_of_element_located((By.ID, 'form-button'))
        )

    def test_publish_vacancy_empty_fields(self):
        # Hacer clic en botón de crear vacante
        create_vacancy_button = WebDriverWait(self.driver, 10).until(
            EC.element_to_be_clickable((By.ID, 'form-button'))
        )
        create_vacancy_button.click()
        
        # Intentar publicar sin llenar campos
        publish_button = WebDriverWait(self.driver, 10).until(
            EC.presence_of_element_located((By.ID, 'publish-vacancy-button'))
        )
        publish_button.click()
        
        # Verificar mensajes de error de toast
        toast_messages = WebDriverWait(self.driver, 10).until(
            EC.presence_of_all_elements_located((By.CLASS_NAME, 'Toastify__toast--error'))
        )
        self.assertTrue(len(toast_messages) > 0, "No se mostraron mensajes de error para campos vacíos")

    def test_publish_two_vacancies(self):
        vacancies = [
            {
                'titulo': 'Desarrollador Python Senior',
                'ubicacion': 'Bogotá',
                'descripcion': 'Buscamos desarrollador con experiencia en Django',
                'requisitos': 'Experiencia de 5+ años en Python',
                'tipo_contrato': 'Tiempo Completo'
            },
            {
                'titulo': 'Diseñador UX/UI',
                'ubicacion': 'Bogotá',
                'descripcion': 'Buscamos diseñador creativo para equipo de producto',
                'requisitos': 'Portafolio de proyectos, conocimiento de Figma',
                'tipo_contrato': 'Freelance'
            }
        ]

        for vacancy in vacancies:
            # Esperar y hacer clic en botón para abrir formulario de nueva vacante
            form_button = WebDriverWait(self.driver, 10).until(
                EC.element_to_be_clickable((By.ID, 'form-button'))
            )
            print("Haciendo clic en botón de formulario")
            form_button.click()
            time.sleep(2)
            # Llenar formulario de vacante
            WebDriverWait(self.driver, 10).until(
                EC.presence_of_element_located((By.ID, 'titulo-vacante'))
            )
            
            print(f"Llenando vacante: {vacancy['titulo']}")
            
            self.driver.find_element(By.ID, 'titulo-vacante').send_keys(vacancy['titulo'])
            self.driver.find_element(By.ID, 'ubicacion-vacante').send_keys(vacancy['ubicacion'])
            self.driver.find_element(By.ID, 'descripcion-vacante').send_keys(vacancy['descripcion'])
            self.driver.find_element(By.ID, 'requisitos-vacante').send_keys(vacancy['requisitos'])
            
            # Seleccionar tipo de contrato
            tipo_contrato_select = self.driver.find_element(By.ID, 'tipo-contrato-vacante')
            tipo_contrato_select.send_keys(vacancy['tipo_contrato'])
            
            # Publicar vacante
            publish_button = WebDriverWait(self.driver, 10).until(
                EC.element_to_be_clickable((By.ID, 'publish-vacancy-button'))
            )
            print("Haciendo clic en botón de publicar")
            publish_button.click()
            
            # Verificar mensaje de éxito
            success_toast = WebDriverWait(self.driver, 10).until(
                EC.presence_of_element_located((By.CLASS_NAME, 'Toastify__toast--success'))
            )
            
            # Verificar texto del toast
            success_message = success_toast.find_element(By.CLASS_NAME, 'Toastify__toast-body').text
            print(f"Mensaje de toast: {success_message}")
            
            # Verificar que el mensaje contenga "Vacante publicada exitosamente"
            self.assertIn("Vacante publicada exitosamente", success_message, 
                          f"El mensaje de éxito no coincide para la vacante: {vacancy['titulo']}")
            
            # Verificar en base de datos
            self._verify_vacancy_in_database(vacancy)
            
            print(f"Vacante {vacancy['titulo']} publicada exitosamente")

    def _verify_vacancy_in_database(self, vacancy):
        try:
            # Conectar a base de datos
            conn = psycopg2.connect(**self.db_params)
            cursor = conn.cursor()
            
            # Consultar vacante
            cursor.execute("""
                SELECT * FROM empleos_vacante 
                WHERE titulo = %s 
                AND descripcion = %s 
                AND requisitos = %s
            """, (vacancy['titulo'], vacancy['descripcion'], vacancy['requisitos']))
            
            result = cursor.fetchone()
            self.assertIsNotNone(result, f"Vacante no encontrada en base de datos: {vacancy['titulo']}")
            
            cursor.close()
            conn.close()
        except Exception as e:
            self.fail(f"Error al verificar vacante en base de datos: {str(e)}")

    @classmethod
    def tearDownClass(cls):
        # Cerrar navegador
        cls.driver.quit()

if __name__ == "__main__":
    unittest.main()
