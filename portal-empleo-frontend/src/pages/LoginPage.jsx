import { useState, useContext } from "react";
import api from "../api/jobconnect.api";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { toast, ToastContainer } from 'react-toastify';

function LoginPage() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const { cargarUsuario } = useContext(AuthContext);
    const navigate = useNavigate();

    // toast.success("Toast de prueba cargado!", {
    //     position: "bottom-right",
    //     autoClose: 2000,
    //     hideProgressBar: true,
    // });

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");
        
        // 🔒 Validación manual
        if (!username && !password) {
            setError("Por favor ingresa tu usuario y contraseña.");
            setTimeout(() => {
                toast.error("Campos requeridos: usuario y contraseña", {
                    position: "bottom-right",
                    autoClose: 2000,
                    hideProgressBar: true,
                });
            }, 100);
            
            return; // ❌ No continuar
        } else if (!username){
            setError("Por favor ingresa tu usuario.");
            setTimeout(() => {
                toast.error("Campo requerido: usuario", {
                    position: "bottom-right",
                    autoClose: 2000,
                    hideProgressBar: true,
                });
            }, 100);
            return; // ❌ No continuar
        } else if (!password) {
            setError("Por favor ingresa tu contraseña.");
            setTimeout(() => {
                toast.error("Campo requerido: contraseña", {
                    position: "bottom-right",
                    autoClose: 2000,
                    hideProgressBar: true,
                });
            }, 100);
            return; // ❌ No continuar
        }


        setLoading(true);

        try {
            // Obtener los tokens
            const response = await api.post("/login/", {
                username,
                password,
            });
            
            const { access, refresh } = response.data;
            localStorage.setItem("access", access);
            localStorage.setItem("refresh", refresh);

            await cargarUsuario(); // 

            // Obtener datos del usuario autenticado
            const userRes = await api.get("/perfil-usuario/");
            const rol = userRes.data.usuario.rol;

            if (rol === "candidato") {
                navigate("/candidato");
                // Delay toast to ensure navigation completes
                setTimeout(() => {
                    toast.success('¡Inicio de sesión exitoso!', {
                        position: "bottom-right",
                        autoClose: 2000,
                        hideProgressBar: true,
                    });
                }, 100);
            } else if (rol === "reclutador") {
                navigate("/reclutador");
                // Delay toast to ensure navigation completes
                setTimeout(() => {
                    toast.success('¡Inicio de sesión exitoso!', {
                        position: "bottom-right",
                        autoClose: 2000,
                        hideProgressBar: true,
                    });
                }, 100);
            } 
        } catch (err) {
            // setError("Credenciales inválidas o usuario no activo.");
            setTimeout(() => {
                toast.error("Credenciales inválidas. Por favor, verifica tus datos.", {
                    position: "bottom-right",
                    autoClose: 3000,
                    hideProgressBar: true,
                });
            }, 100);
            console.error(err.response?.data);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg border border-gray-200">
            <h2 className="text-2xl font-bold text-center text-blue-800 mb-6">
                Iniciar sesión
            </h2>

            {error && (
                <p className="text-red-600 bg-red-100 border border-red-200 rounded-md p-2 text-center mb-4">
                    {error}
                </p>
            )}

            <form onSubmit={handleLogin} noValidate className="space-y-4">
                <input
                    id="username"
                    type="text"
                    placeholder="Usuario"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <input
                    id="password"
                    type="password"
                    placeholder="Contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                />

                <button
                    id="login-button"
                    type="submit"
                    disabled={loading}
                    className={`w-full py-2 rounded-md text-white font-semibold transition ${
                        loading
                            ? "bg-green-400 cursor-not-allowed opacity-70"
                            : "bg-green-500 hover:bg-green-600"
                    }`}
                >
                    {loading ? "Ingresando..." : "Ingresar"}
                </button>

                <div className="text-center mt-4">
                    <button
                        type="button"
                        onClick={() => navigate("/registro")}
                        className="text-sm text-blue-600 hover:underline transition"
                    >
                        ¿No tienes cuenta? Regístrate
                    </button>
                </div>
            </form>
        </div>
        <ToastContainer />
    </div>
    );
}

export default LoginPage;