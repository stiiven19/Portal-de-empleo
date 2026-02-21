import { createContext, useEffect, useState } from "react";
import api from "../api/jobconnect.api";
import { toast } from 'react-toastify';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [usuario, setUsuario] = useState(null);
    const [loading, setLoading] = useState(true);

    const cargarUsuario = async () => {
        try {
            const res = await api.get("/perfil-usuario/");
            setUsuario(res.data.usuario);
            
            // Añadir toast para carga de usuario con un pequeño retraso
            
        } catch (error) {
            console.warn("No se pudo cargar el perfil del usuario (token expirado o inválido)");
            localStorage.removeItem("access");
            localStorage.removeItem("refresh");
            setUsuario(null);
            
            // Añadir toast para error de carga de usuario con un pequeño retraso
            setTimeout(() => {
                toast.error('No se pudo restaurar la sesión', {
                    position: "bottom-right",
                    autoClose: 3000,
                    hideProgressBar: true
                });
            }, 100);
        } finally {
            setLoading(false);
        }
    };

    const cerrarSesion = () => {
        // Mostrar toast antes de eliminar tokens
        toast.info('Sesión cerrada', {
            position: "bottom-right",
            autoClose: 2000,
            hideProgressBar: true
        });

        // Pequeño retraso para asegurar que el toast se muestre
        setTimeout(() => {
            localStorage.removeItem("access");
            localStorage.removeItem("refresh");
            setUsuario(null);
        }, 100);
    };

    useEffect(() => {
        const token = localStorage.getItem("access");
        if (token) {
            cargarUsuario();
        } else {
            setLoading(false);
        }
    }, []);

    return (
        <AuthContext.Provider value={{ usuario, setUsuario, cerrarSesion, cargarUsuario, loading }}>
            {children}
        </AuthContext.Provider>
    );
}