import unittest
import time
import os
import psycopg2
from dotenv import load_dotenv
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import Select
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import NoSuchElementException
from urllib.parse import urlparse

class RegisterTest(unittest.TestCase):
    # Store created usernames for cleanup
    created_users = []

    @classmethod
    def setUpClass(cls):
        # Load environment variables
        load_dotenv()

        # Parse DATABASE_URL
        database_url = os.getenv('DATABASE_URL', 'postgresql://postgres:WgzqeiLqonzZSXcxqCUTjbgOpucHJMTr@gondola.proxy.rlwy.net:23203/railway')
        if not database_url:
            raise ValueError("DATABASE_URL environment variable is not set")

        # Parse the database URL
        url = urlparse(database_url)
        
        # Database connection parameters
        cls.db_params = {
            'dbname': url.path.lstrip('/'),  # Remove leading '/'
            'user': url.username,
            'password': url.password,
            'host': url.hostname,
            'port': url.port or 5432
        }

    def setUp(self):
        self.driver = webdriver.Chrome()
        self.driver.maximize_window()
        self.driver.get("http://localhost:5173/registro/")
        time.sleep(2)  # Wait for page to load

    def verify_user_in_database(self, username, email):
        """
        Verify if a user exists in the database
        
        :param username: Username to check
        :param email: Email to check
        :return: Boolean indicating user existence
        """
        try:
            # Establish database connection
            conn = psycopg2.connect(**self.__class__.db_params)
            cursor = conn.cursor()

            # Query to check user existence
            query = """
            SELECT EXISTS(
                SELECT 1 FROM usuarios_usuario 
                WHERE username = %s OR email = %s
            )
            """
            
            # Execute query
            cursor.execute(query, (username, email))
            user_exists = cursor.fetchone()[0]

            # Close database connection
            cursor.close()
            conn.close()

            # Print debug information
            print(f"Checking user - Username: {username}, Email: {email}")
            print(f"User exists: {user_exists}")

            return user_exists

        except Exception as e:
            print(f"Error verifying user in database: {e}")
            # Print connection parameters for debugging (be careful with sensitive info)
            print("Connection Parameters:")
            safe_params = {k: '****' if k == 'password' else v for k, v in self.__class__.db_params.items()}
            print(safe_params)
            return False

    def delete_test_user(self, username, email):
        """
        Delete test user from the database
        """
        try:
            # Establish database connection
            conn = psycopg2.connect(**self.__class__.db_params)
            cursor = conn.cursor()
            
            # Delete user
            cursor.execute("""
                DELETE FROM usuarios_usuario 
                WHERE username = %s OR email = %s
            """, (username, email))
            
            # Commit the transaction
            conn.commit()
            
            # Close database connection
            cursor.close()
            conn.close()
            
            print(f"Deleted test user: {username}")
        except Exception as e:
            print(f"Error deleting user {username}: {e}")

    @classmethod
    def tearDownClass(cls):
        """
        Clean up all created test users
        """
        if not cls.created_users:
            return

        try:
            # Establish database connection
            conn = psycopg2.connect(**cls.db_params)
            cursor = conn.cursor()

            # Delete each created test user
            for username, email in cls.created_users:
                try:
                    # Delete user by username or email
                    delete_query = """
                    DELETE FROM usuarios_usuario 
                    WHERE username = %s OR email = %s
                    """
                    cursor.execute(delete_query, (username, email))
                    
                    print(f"Deleted test user: {username}")
                except Exception as user_delete_error:
                    print(f"Error deleting user {username}: {user_delete_error}")

            # Commit the transaction
            conn.commit()
            
            # Close database connection
            cursor.close()
            conn.close()

        except Exception as e:
            print(f"Error in tearDownClass: {e}")
            # Print connection parameters for debugging (be careful with sensitive info)
            safe_params = {k: '****' if k == 'password' else v for k, v in cls.db_params.items()}
            print("Connection Parameters:", safe_params)
        
        # Clear the list after cleanup
        cls.created_users.clear()

    def test_register_empty_fields(self):
        """
        Test registration with empty fields for both candidate and recruiter
        """
        driver = self.driver

        # Test candidate registration with empty fields
        self._test_register_empty_fields_for_role("candidato", [
            "first_name", "last_name", "telefono", 
            "ciudad", "experiencia", "formacion", "habilidades"
        ], "Por favor, complete todos los campos obligatorios")

        # Refresh the page to reset the form
        driver.refresh()
        time.sleep(2)

        # Test recruiter registration with empty fields
        self._test_register_empty_fields_for_role("reclutador", [
            "empresa", "cargo"
        ], "Por favor, complete todos los campos obligatorios")

    def _test_register_empty_fields_for_role(self, role, required_fields, expected_message):
        """
        Helper method to test empty field validation for a specific role
        
        :param role: Role to test ('candidato' or 'reclutador')
        :param required_fields: List of required field IDs that must be filled
        :param expected_message: Expected toast error message
        """
        driver = self.driver

        # Select role
        rol_select = Select(driver.find_element(By.ID, "rol"))
        rol_select.select_by_value(role)
        time.sleep(0.5)

        # Fill only username, email, and password
        driver.find_element(By.ID, "username").send_keys(f"test_{role}_{int(time.time())}")
        driver.find_element(By.ID, "email").send_keys(f"test_{role}_{int(time.time())}@example.com")
        driver.find_element(By.ID, "password").send_keys("TestPassword123!")
        driver.find_element(By.ID, "confirmPassword").send_keys("TestPassword123!")

        # Submit form
        submit_button = driver.find_element(By.CSS_SELECTOR, "button[type='submit']")
        submit_button.click()
        time.sleep(2)

        # Wait for and validate toast notification
        try:
            # Wait for toast notification
            toast_element = WebDriverWait(driver, 10).until(
                EC.presence_of_element_located((By.CLASS_NAME, "Toastify__toast--error"))
            )

            # Validate toast message
            toast_text = toast_element.text
            print(f"Toast message for {role}: {toast_text}")
            
            # Assert toast contains expected error message
            self.assertTrue(
                expected_message in toast_text, 
                f"Unexpected toast message for {role}. Expected: {expected_message}, Got: {toast_text}"
            )

        except Exception as e:
            # Print page source and current URL for debugging
            print(f"Error validating empty fields for {role}:")
            print("Page Source:", driver.page_source)
            print("Current URL:", driver.current_url)
            print("Error details:", str(e))
            
            # Fail the test with detailed error information
            self.fail(f"Empty field validation failed for {role}: {e}")

    def test_register_invalid_email(self):
        """
        Test registration with invalid email format
        """
        driver = self.driver

        # Select role
        rol_select = Select(driver.find_element(By.ID, "rol"))
        rol_select.select_by_value("candidato")
        time.sleep(0.5)

        # Fill form with invalid email
        driver.find_element(By.ID, "username").send_keys("invalid_user")
        driver.find_element(By.ID, "email").send_keys("invalid_email")  # Invalid email format
        driver.find_element(By.ID, "password").send_keys("TestPassword123")
        driver.find_element(By.ID, "confirmPassword").send_keys("TestPassword123")
        
        # Fill other required fields for candidate
        driver.find_element(By.ID, "first_name").send_keys("Test")
        driver.find_element(By.ID, "last_name").send_keys("User")
        driver.find_element(By.ID, "telefono").send_keys("3101234567")
        driver.find_element(By.ID, "ciudad").send_keys("Bogotá")
        driver.find_element(By.ID, "experiencia").send_keys("2 años")
        driver.find_element(By.ID, "formacion").send_keys("Ingeniería")
        driver.find_element(By.ID, "habilidades").send_keys("Python, Selenium")

        # Submit form
        submit_button = driver.find_element(By.CSS_SELECTOR, "button[type='submit']")
        submit_button.click()
        time.sleep(2)

        # Wait for and validate toast notification
        try:
            # Wait for toast notification
            toast_element = WebDriverWait(driver, 10).until(
                EC.presence_of_element_located((By.CLASS_NAME, "Toastify__toast--error"))
            )

            # Validate toast message
            toast_text = toast_element.text
            print(f"Toast message for invalid email: {toast_text}")
            
            # Assert toast contains expected error message
            self.assertTrue(
                "Por favor, ingrese un correo electrónico válido" in toast_text, 
                f"Unexpected toast message for invalid email: {toast_text}"
            )

        except Exception as e:
            # Print page source and current URL for debugging
            print("Error validating invalid email:")
            print("Page Source:", driver.page_source)
            print("Current URL:", driver.current_url)
            print("Error details:", str(e))
            
            # Fail the test with detailed error information
            self.fail(f"Invalid email validation failed: {e}")

    def _login_and_verify_route(self, username, role):
        """
        Helper method to log in and verify user route after registration
        
        :param username: Username to log in
        :param role: Expected role ('candidato' or 'reclutador')
        """
        driver = self.driver

        # Navigate to login page
        driver.get("http://localhost:5173/login")
        time.sleep(2)

        # Fill login form
        driver.find_element(By.ID, "username").send_keys(username)
        driver.find_element(By.ID, "password").send_keys("TestPassword123!")
        
        # Submit login form
        login_button = driver.find_element(By.ID, "login-button")
        login_button.click()
        
        # Wait for toast notification
        try:
            # Wait for success toast
            time.sleep(2)
            toast_element = WebDriverWait(driver, 10).until(
                EC.presence_of_element_located((By.CLASS_NAME, "Toastify__toast--success"))
            )

            # Validate toast message
            toast_text = toast_element.text
            print(f"Login Toast Message: {toast_text}")
            
            # Assert toast contains expected success message
            self.assertTrue(
                "¡Inicio de sesión exitoso!" in toast_text, 
                f"Unexpected login toast message: {toast_text}"
            )

            # Wait for route to change
            WebDriverWait(driver, 10).until(
                EC.url_contains(f"/{role}")
            )

            # Verify current URL
            current_url = driver.current_url
            print(f"Current URL after login: {current_url}")
            
            # Assert correct route
            self.assertTrue(
                f"/{role}" in current_url, 
                f"Unexpected route after login. Expected /{role}, got {current_url}"
            )

        except Exception as e:
            # Print page source and current URL for debugging
            print("Login Verification Error:")
            print("Page Source:", driver.page_source)
            print("Current URL:", driver.current_url)
            print("Error details:", str(e))
            
            # Fail the test with detailed error information
            self.fail(f"Login verification failed: {e}")

    def test_register_successful_candidate(self):
        """
        Test successful candidate registration and database verification
        """
        driver = self.driver

        # Select role
        rol_select = Select(driver.find_element(By.ID, "rol"))
        rol_select.select_by_value("candidato")
        time.sleep(0.5)

        # Unique test user for this run
        test_username = f"candidate_test_{int(time.time())}"
        test_email = f"{test_username}@example.com"

        # Fill registration form
        driver.find_element(By.ID, "username").send_keys(test_username)
        driver.find_element(By.ID, "email").send_keys(test_email)
        driver.find_element(By.ID, "password").send_keys("TestPassword123!")
        driver.find_element(By.ID, "confirmPassword").send_keys("TestPassword123!")
        driver.find_element(By.ID, "first_name").send_keys("Test")
        driver.find_element(By.ID, "last_name").send_keys("User")
        driver.find_element(By.ID, "telefono").send_keys("3101234567")
        driver.find_element(By.ID, "ciudad").send_keys("Bogotá")
        driver.find_element(By.ID, "experiencia").send_keys("2 años")
        driver.find_element(By.ID, "formacion").send_keys("Ingeniería")
        driver.find_element(By.ID, "habilidades").send_keys("Python, Selenium")
        
        # Submit form
        submit_button = driver.find_element(By.CSS_SELECTOR, "button[type='submit']")
        submit_button.click()
        
        # Wait for successful registration
        try:
            # Wait for toast message or redirect
            WebDriverWait(driver, 10).until(
                EC.presence_of_element_located((By.CLASS_NAME, "Toastify__toast--success"))
            )
            
            # If toast appears, wait for login page
            WebDriverWait(driver, 10).until(
                EC.url_contains("login")
            )
        except Exception as e:
            # Print page source and current URL for debugging
            print("Registration Error - Page Source:", driver.page_source)
            print("Current URL:", driver.current_url)
            print("Error details:", str(e))
            
            # Fail the test with detailed error information
            self.fail(f"Registration failed: {e}")

        # Verify user in database
        user_exists = self.verify_user_in_database(test_username, test_email)
        self.assertTrue(user_exists, f"User {test_username} not found in database")

        # Add user to cleanup list
        self.__class__.created_users.append((test_username, test_email))

        # Login and verify route
        self._login_and_verify_route(test_username, "candidato")

    def test_register_reclutador(self):
        """
        Test successful recruiter registration and database verification
        """
        driver = self.driver

        # Select role
        rol_select = Select(driver.find_element(By.ID, "rol"))
        rol_select.select_by_value("reclutador")
        time.sleep(0.5)

        # Unique test user for this run
        test_username = f"reclutador_test_{int(time.time())}"
        test_email = f"{test_username}@example.com"

        # Fill registration form
        driver.find_element(By.ID, "username").send_keys(test_username)
        driver.find_element(By.ID, "email").send_keys(test_email)
        driver.find_element(By.ID, "password").send_keys("TestPassword123!")
        driver.find_element(By.ID, "confirmPassword").send_keys("TestPassword123!")
        driver.find_element(By.ID, "first_name").send_keys("Test")
        driver.find_element(By.ID, "last_name").send_keys("Recruiter")
        driver.find_element(By.ID, "telefono").send_keys("3201234567")
        driver.find_element(By.ID, "ciudad").send_keys("Medellín")
        driver.find_element(By.ID, "empresa").send_keys("Test Company")
        driver.find_element(By.ID, "cargo").send_keys("HR Manager")
        
        # Submit form
        submit_button = driver.find_element(By.CSS_SELECTOR, "button[type='submit']")
        submit_button.click()
        
        # Wait for successful registration
        try:
            # Wait for toast message or redirect
            WebDriverWait(driver, 10).until(
                EC.presence_of_element_located((By.CLASS_NAME, "Toastify__toast--success"))
            )
            
            # If toast appears, wait for login page
            WebDriverWait(driver, 10).until(
                EC.url_contains("login")
            )
        except Exception as e:
            # Print page source and current URL for debugging
            print("Registration Error - Page Source:", driver.page_source)
            print("Current URL:", driver.current_url)
            print("Error details:", str(e))
            
            # Fail the test with detailed error information
            self.fail(f"Registration failed: {e}")

        # Verify user in database
        user_exists = self.verify_user_in_database(test_username, test_email)
        self.assertTrue(user_exists, f"User {test_username} not found in database")

        # Add user to cleanup list
        self.__class__.created_users.append((test_username, test_email))

        # Login and verify route
        self._login_and_verify_route(test_username, "reclutador")

    def test_register_candidato(self):
        driver = self.driver

        # Esperar a que el formulario sea interactuable
        time.sleep(1)

        # Rellenar el formulario de registro como 'candidato'
        rol_select = Select(driver.find_element(By.ID, "rol"))
        rol_select.select_by_value("candidato")
        time.sleep(0.5)

        # Generar un usuario de prueba único
        test_username = f"usuario_test_{int(time.time())}"
        test_email = f"{test_username}@example.com"

        driver.find_element(By.ID, "username").send_keys(test_username)  # Nombre de usuario
        time.sleep(0.3)

        driver.find_element(By.ID, "email").send_keys(test_email)  # Correo electrónico
        time.sleep(0.3)

        driver.find_element(By.ID, "password").send_keys("TestPassword123")  # Contraseña
        time.sleep(0.3)

        driver.find_element(By.ID, "confirmPassword").send_keys("TestPassword123")  # Confirmar contraseña
        time.sleep(0.3)

        driver.find_element(By.ID, "first_name").send_keys("Juan")  # Nombre
        time.sleep(0.3)

        driver.find_element(By.ID, "last_name").send_keys("Pérez")  # Apellido
        time.sleep(0.3)

        driver.find_element(By.ID, "telefono").send_keys("123456789")  # Teléfono
        time.sleep(0.3)

        driver.find_element(By.ID, "ciudad").send_keys("Bogotá")  # Ciudad
        time.sleep(0.3)

        driver.find_element(By.ID, "experiencia").send_keys("2 años de experiencia en desarrollo")  # Experiencia
        time.sleep(0.3)

        driver.find_element(By.ID, "formacion").send_keys("Ingeniería de Sistemas")  # Formación
        time.sleep(0.3)

        driver.find_element(By.ID, "habilidades").send_keys("JavaScript, Python, React")  # Habilidades
        time.sleep(0.3)

        # Enviar el formulario
        driver.find_element(By.CSS_SELECTOR, "button[type='submit']").click()
        time.sleep(2)  # Esperar a la respuesta del registro

        # Esperar la respuesta de éxito (espero que sea un mensaje de éxito o redirección)
        WebDriverWait(driver, 10).until(
            EC.url_contains("login")  # Verificamos si la URL cambia a la de login después del registro
        )

        # Verificamos que el mensaje de éxito aparece
        try:
            success_message = WebDriverWait(driver, 10).until(
                EC.presence_of_element_located((By.CLASS_NAME, "Toastify__toast--success"))
            )
            
            # Print the actual toast message for debugging
            print(f"Actual Success Message: {success_message.text}")
            
            # Verify the success message
            self.assertIsNotNone(success_message, "Success toast message not found")
            
            # Update the assertion to match the actual message
            self.assertTrue(
                any(msg in success_message.text for msg in [
                    "Registro exitoso", 
                    "Registro completado con éxito",
                    "Usuario registrado correctamente"
                ]), 
                f"Unexpected success message: {success_message.text}"
            )

        except Exception as e:
            # Print page source for debugging if toast is not found
            print("Page Source:", driver.page_source)
            print("Current URL:", driver.current_url)
            self.fail(f"Failed to find success toast message: {e}")

        # Verificar usuario en base de datos
        user_exists = self.verify_user_in_database(test_username, test_email)
        self.assertTrue(user_exists, f"User {test_username} not found in database")

        # Agregar usuario a la lista de limpieza
        self.__class__.created_users.append((test_username, test_email))

    def test_register_reclutador(self):
        driver = self.driver

        # Esperar a que el formulario sea interactuable
        time.sleep(1)

        # Rellenar el formulario de registro como 'reclutador'
        rol_select = Select(driver.find_element(By.ID, "rol"))
        rol_select.select_by_value("reclutador")
        time.sleep(0.5)

        # Generar un usuario de prueba único
        test_username = f"reclutador_test_{int(time.time())}"
        test_email = f"{test_username}@example.com"

        driver.find_element(By.ID, "username").send_keys(test_username)  # Nombre de usuario
        time.sleep(0.3)

        driver.find_element(By.ID, "email").send_keys(test_email)  # Correo electrónico
        time.sleep(0.3)

        driver.find_element(By.ID, "password").send_keys("TestPassword123")  # Contraseña
        time.sleep(0.3)

        driver.find_element(By.ID, "confirmPassword").send_keys("TestPassword123")  # Confirmar contraseña
        time.sleep(0.3)

        driver.find_element(By.ID, "first_name").send_keys("Carlos")  # Nombre
        time.sleep(0.3)

        driver.find_element(By.ID, "last_name").send_keys("Gómez")  # Apellido
        time.sleep(0.3)

        driver.find_element(By.ID, "telefono").send_keys("987654321")  # Teléfono
        time.sleep(0.3)

        driver.find_element(By.ID, "empresa").send_keys("TechCorp")  # Empresa
        time.sleep(0.3)

        driver.find_element(By.ID, "cargo").send_keys("Gerente de TI")  # Cargo
        time.sleep(0.3)

        driver.find_element(By.ID, "sitio_web").send_keys("https://techcorp.com")  # Sitio web
        time.sleep(0.3)

        # Enviar el formulario
        driver.find_element(By.CSS_SELECTOR, "button[type='submit']").click()
        time.sleep(2)  # Esperar a la respuesta del registro

        # Esperar la respuesta de éxito (espero que sea un mensaje de éxito o redirección)
        WebDriverWait(driver, 10).until(
            EC.url_contains("login")  # Verificamos si la URL cambia a la de login después del registro
        )

        # Verificamos que el mensaje de éxito aparece
        try:
            success_message = WebDriverWait(driver, 10).until(
                EC.presence_of_element_located((By.CLASS_NAME, "Toastify__toast--success"))
            )
            
            # Print the actual toast message for debugging
            print(f"Actual Success Message: {success_message.text}")
            
            # Verify the success message
            self.assertIsNotNone(success_message, "Success toast message not found")
            
            # Update the assertion to match the actual message
            self.assertTrue(
                any(msg in success_message.text for msg in [
                    "Registro exitoso", 
                    "Registro completado con éxito",
                    "Usuario registrado correctamente"
                ]), 
                f"Unexpected success message: {success_message.text}"
            )

        except Exception as e:
            # Print page source for debugging if toast is not found
            print("Page Source:", driver.page_source)
            print("Current URL:", driver.current_url)
            self.fail(f"Failed to find success toast message: {e}")

        # Verificar usuario en base de datos
        user_exists = self.verify_user_in_database(test_username, test_email)
        self.assertTrue(user_exists, f"User {test_username} not found in database")

        # Agregar usuario a la lista de limpieza
        self.__class__.created_users.append((test_username, test_email))

    def tearDown(self):
        time.sleep(2)  # Additional time to view results
        self.driver.quit()

if __name__ == "__main__":
    unittest.main()
