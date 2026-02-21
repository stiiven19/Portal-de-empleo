import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from 'react-toastify';
import api from "../api/jobconnect.api";
import 'react-toastify/dist/ReactToastify.css';

function RegisterPage() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
        rol: "candidato",
        first_name: "",
        last_name: "",
        telefono: "",
        ciudad: "",
        experiencia: "",
        formacion: "",
        habilidades: "",
        empresa: "",
        cargo: "",
        sitio_web: ""
    });
    const [error, setError] = useState("");

    const inputStyle = {
        padding: "0.75rem",
        fontSize: "1rem",
        border: "1px solid #ced4da",
        borderRadius: "6px",
        backgroundColor: "#fafafa",
        outline: "none",
        transition: "border-color 0.3s ease"
    };
    
    const textareaStyle = {
        ...inputStyle,
        resize: "vertical",
        minHeight: "60px"
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        // Validaciones básicas antes del envío
        if (!formData.username.trim()) {
            toast.error("El nombre de usuario es obligatorio", {
                position: "bottom-right",
                autoClose: 3000,
                hideProgressBar: true
            });
            setLoading(false);
            return;
        }

        if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) {
            toast.error("Por favor, ingrese un correo electrónico válido", {
                position: "bottom-right",
                autoClose: 3000,
                hideProgressBar: true
            });
            setLoading(false);
            return;
        }

        if (formData.password.length < 8) {
            toast.error("La contraseña debe tener al menos 8 caracteres", {
                position: "bottom-right",
                autoClose: 3000,
                hideProgressBar: true
            });
            setLoading(false);
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            toast.error("Las contraseñas no coinciden", {
                position: "bottom-right",
                autoClose: 3000,
                hideProgressBar: true
            });
            setLoading(false);
            return;
        }

        if (formData.rol === "candidato" && (!formData.first_name.trim() || !formData.last_name.trim() || !formData.telefono.trim() || !formData.ciudad.trim() || !formData.experiencia.trim() || !formData.formacion.trim() || !formData.habilidades.trim())) {
            toast.error("Por favor, complete todos los campos obligatorios", {
                position: "bottom-right",
                autoClose: 3000,
                hideProgressBar: true
            });
            setLoading(false);
            return;
        }

        if (formData.rol === "reclutador" && (!formData.first_name.trim() || !formData.last_name.trim() || !formData.telefono.trim() || !formData.empresa.trim() || !formData.cargo.trim())) {
            toast.error("Por favor, complete todos los campos obligatorios", {
                position: "bottom-right",
                autoClose: 3000,
                hideProgressBar: true
            });
            setLoading(false);
            return;
        }

        const payload = {
            username: formData.username,
            email: formData.email,
            password: formData.password,
            first_name: formData.first_name,
            last_name: formData.last_name,
            rol: formData.rol
        };

        if (formData.rol === "candidato") {
            payload.perfil_candidato = {
                telefono: formData.telefono,
                ciudad: formData.ciudad,
                experiencia: formData.experiencia,
                formacion: formData.formacion,
                habilidades: formData.habilidades,
            };
        } else if (formData.rol === "reclutador") {
            payload.perfil_reclutador = {
                telefono: formData.telefono,
                empresa: formData.empresa,
                cargo: formData.cargo,
                sitio_web: formData.sitio_web,
            };
        }

        try {
            const response = await api.post("registro/", payload);
            
            if (response.status === 201) {
                toast.success('Registro exitoso', {
                    position: "bottom-right",
                    autoClose: 2000,
                    hideProgressBar: true,
                });

                // Pequeño retraso antes de navegar
                setTimeout(() => {
                    navigate("/login");
                }, 2000);
            }
        } catch (error) {
            // Log full error details for debugging
            console.error("Error completo en el registro:", error);
            console.log("Error config:", error.config);
            console.log("Error response:", error.response);
            
            let errorMessage = "Error al registrar. el usuario y/o correo no son validos";
            let errorDetails = null;
            
            if (error.response) {
                // The request was made and the server responded with a status code
                const errors = error.response.data;
                console.log('Errores del servidor:', errors);

                // Manejar errores específicos del servidor con más detalle
                if (typeof errors === 'object') {
                    // Priorizar errores de username
                    if (errors.username) {
                        errorMessage = Array.isArray(errors.username) 
                            ? errors.username[0] 
                            : "El nombre de usuario ya está en uso.";
                        errorDetails = {
                            field: 'username',
                            message: errorMessage
                        };
                    } 
                    // Si no hay error de username, revisar email
                    else if (errors.email) {
                        errorMessage = Array.isArray(errors.email)
                            ? errors.email[0]
                            : "El correo electrónico ya está registrado.";
                        errorDetails = {
                            field: 'email',
                            message: errorMessage
                        };
                    } 
                    // Otros tipos de errores
                    else if (errors.password) {
                        errorMessage = Array.isArray(errors.password)
                            ? errors.password[0]
                            : "La contraseña no cumple con los requisitos.";
                    }
                    // Manejar errores en formato de string con error field
                    else if (errors.error) {
                        try {
                            // Intentar parsear el string de error
                            const errorParsed = JSON.parse(errors.error.replace(/'/g, '"'));
                            if (errorParsed.password) {
                                // Extraer solo el string del ErrorDetail
                                const passwordError = errorParsed.password[0];
                                if (typeof passwordError === 'string') {
                                    errorMessage = passwordError;
                                } else if (passwordError && passwordError.string) {
                                    errorMessage = passwordError.string;
                                } else {
                                    errorMessage = "La contraseña no cumple con los requisitos.";
                                }
                                errorDetails = {
                                    field: 'password',
                                    message: errorMessage
                                };
                            }
                        } catch (e) {
                            errorMessage = "La contraseña no cumple con los requisitos.";
                        }
                    }
                    else if (errors.non_field_errors) {
                        errorMessage = Array.isArray(errors.non_field_errors)
                            ? errors.non_field_errors[0]
                            : "Error en el registro. Verifica tus datos.";
                    }
                } else if (typeof errors === 'string') {
                    // Si el error es un string plano
                    errorMessage = errors;
                }
            } else if (error.request) {
                // The request was made but no response was received
                errorMessage = "No se recibió respuesta del servidor. Verifica tu conexión.";
            }
            
            // Mostrar toast de error con mensaje detallado
            toast.error(errorMessage, {
                position: "bottom-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true
            });

            // Si hay detalles específicos de error, hacer algo adicional
            if (errorDetails) {
                // Opcional: Puedes agregar lógica adicional aquí, como resaltar el campo
                console.log(`Error en campo: ${errorDetails.field}`);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex justify-center items-start py-10 px-4">
            <div className="w-full max-w-2xl bg-white shadow-md rounded-lg p-8">
                <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
                Registro de Usuario
                </h2>
        
                <form onSubmit={handleSubmit} noValidate className="space-y-5">
                {/* Selección de Rol */}
                <div>
                    <label className="block mb-1 font-medium text-gray-700">Rol</label>
                    <select
                    id="rol"
                    name="rol"
                    value={formData.rol}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                    <option value="">Selecciona un rol</option>
                    <option value="candidato">Candidato</option>
                    <option value="reclutador">Reclutador</option>
                    </select>
                </div>
        
                {/* Datos básicos */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                    id="username"
                    type="text"
                    name="username"
                    placeholder="Usuario"
                    value={formData.username}
                    onChange={handleChange}
                    required
                    className="input-style"
                    />
                    <input
                    id="email"
                    type="email"
                    name="email"
                    placeholder="Correo electrónico"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="input-style"
                    />
                    <input
                    id="password"
                    type="password"
                    name="password"
                    placeholder="Contraseña"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="input-style"
                    />
                    <input
                    id="confirmPassword"
                    type="password"
                    name="confirmPassword"
                    placeholder="Confirmar contraseña"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    className="input-style"
                    />
                    <input
                    id="first_name"
                    type="text"
                    name="first_name"
                    placeholder="Nombre"
                    value={formData.first_name}
                    onChange={handleChange}
                    required
                    className="input-style"
                    />
                    <input
                    id="last_name"
                    type="text"
                    name="last_name"
                    placeholder="Apellido"
                    value={formData.last_name}
                    onChange={handleChange}
                    required
                    className="input-style"
                    />
                    <input
                    id="telefono"
                    type="tel"
                    name="telefono"
                    placeholder="Teléfono"
                    value={formData.telefono}
                    onChange={handleChange}
                    required
                    className="input-style"
                    />
                </div>
        
                {/* Sección Candidato */}
                {formData.rol === "candidato" && (
                    <div className="grid gap-4 pt-2 border-t border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-700">Perfil del Candidato</h3>
                    <input
                        id="ciudad"
                        type="text"
                        name="ciudad"
                        placeholder="Ciudad"
                        value={formData.ciudad}
                        onChange={handleChange}
                        required
                        className="input-style"
                    />
                    <textarea
                        id="experiencia"
                        name="experiencia"
                        placeholder="Experiencia laboral"
                        value={formData.experiencia}
                        onChange={handleChange}
                        className="textarea-style"
                    />
                    <textarea
                        id="formacion"
                        name="formacion"
                        placeholder="Formación académica"
                        value={formData.formacion}
                        onChange={handleChange}
                        className="textarea-style"
                    />
                    <textarea
                        id="habilidades"
                        name="habilidades"
                        placeholder="Habilidades"
                        value={formData.habilidades}
                        onChange={handleChange}
                        className="textarea-style"
                    />
                    </div>
                )}
        
                {/* Sección Reclutador */}
                {formData.rol === "reclutador" && (
                    <div className="grid gap-4 pt-2 border-t border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-700">Perfil del Reclutador</h3>
                    <input
                    id="empresa"
                        type="text"
                        name="empresa"
                        placeholder="Empresa"
                        value={formData.empresa}
                        onChange={handleChange}
                        required
                        className="input-style"
                    />
                    <input
                        id="cargo"
                        type="text"
                        name="cargo"
                        placeholder="Cargo"
                        value={formData.cargo}
                        onChange={handleChange}
                        required
                        className="input-style"
                    />
                    <input
                        id="sitio_web"
                        type="url"
                        name="sitio_web"
                        placeholder="Sitio web (opcional)"
                        value={formData.sitio_web}
                        onChange={handleChange}
                        className="input-style"
                    />
                    </div>
                )}
        
                {/* Botón */}
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition font-semibold"
                >
                    {loading ? "Registrando..." : "Registrarse"}
                </button>
        
                <div className="text-center">
                    <button
                        id="login-button"
                    type="button"
                    onClick={() => navigate("/login")}
                    className="text-blue-600 hover:underline text-sm mt-2"
                    >
                    ¿Ya tienes cuenta? Inicia sesión
                    </button>
                </div>
                </form>
            </div>
            <ToastContainer 
                position="bottom-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
            />
        </div>
    );
}

export default RegisterPage;