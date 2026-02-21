import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

function RutaProtegida({ children, rolRequerido = null }) {
    const { usuario, loading } = useContext(AuthContext);

    if (loading) return <p>Cargando...</p>; // 👈 mientras se valida

    if (!usuario) {
        return <Navigate to="/login" />;
    }

    // Verificar si el rol está permitido
    const rolesPermitidos = Array.isArray(rolRequerido) ? rolRequerido : [rolRequerido];
    const tieneRolPermitido = rolRequerido === null || rolesPermitidos.includes(usuario.rol);

    if (!tieneRolPermitido) {
        return <Navigate to="/" />;
    }

    return children;
}

export default RutaProtegida;