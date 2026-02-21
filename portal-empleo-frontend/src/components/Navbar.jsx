import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";

function Navbar() {
    const { usuario, cerrarSesion } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        cerrarSesion();
        navigate("/login");
    };

    return (
        <nav className="bg-white  shadow-md py-4 px-6 flex justify-between items-center border-b border-gray-200">
            <Link
                to="/"
                className="text-2xl font-bold text-blue-700 hover:text-blue-600 transition-colors"
            >
                Portal de Empleo
            </Link>

            <div className="flex items-center gap-3 flex-wrap text-sm">
                {!usuario && (
                    <>
                        <Link
                            to="/login"
                            className="text-gray-700 hover:text-blue-600 transition font-medium"
                        >
                            Iniciar Sesión
                        </Link>
                        <Link
                            to="/registro"
                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded transition"
                        >
                            Registro
                        </Link>
                    </>
                )}

                {usuario?.rol === "reclutador" && (
                    <Link
                        to="/reclutador"
                        className="text-gray-700 hover:text-blue-600 font-medium transition"
                    >
                        Panel Reclutador
                    </Link>
                )}

                {usuario?.rol === "candidato" && (
                    <Link
                        to="/candidato"
                        className="text-gray-700 hover:text-blue-600 font-medium transition"
                    >
                        Panel Candidato
                    </Link>
                )}

                {usuario && (
                    <>
                        <span className="text-gray-600 hidden sm:inline">
                            Hola, <strong>{usuario.first_name}</strong> ({usuario.rol})
                        </span>
                        <button
                            onClick={handleLogout}
                            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded transition"
                        >
                            Cerrar sesión
                        </button>
                    </>
                )}
            </div>
        </nav>
    );
}

export default Navbar;