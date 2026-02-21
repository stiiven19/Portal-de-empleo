import { useEffect, useState } from "react";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import api from "../api/jobconnect.api";

function PostuladosPorVacante({ vacanteId }) {
    const [postulados, setPostulados] = useState([]);
    const [perfilAbierto, setPerfilAbierto] = useState(null);

    const verPerfil = (id) => {
        setPerfilAbierto(perfilAbierto === id ? null : id);
    };

    const fetchPostulados = async () => {
        try {
            const res = await api.get(`/postulaciones-por-vacante/?vacante=${vacanteId}`);
            setPostulados(res.data);
        } catch (err) {
            console.error("Error al obtener postulados", err);
            toast.error("Error al cargar los postulados");
        }
    };

    useEffect(() => {
        fetchPostulados();
    }, [vacanteId]);

    const cambiarEstado = async (id, nuevoEstado) => {
        try {
            await api.patch(`/postulaciones/${id}/`, { estado: nuevoEstado });
            toast.success(`Candidato ${nuevoEstado} exitosamente`);
            fetchPostulados(); // Recargar la lista
        } catch (err) {
            console.error("Error al cambiar estado", err);
            toast.error("Error al cambiar el estado del candidato");
        }
    };

    return (
        <div>
            <h3 style={{ 
                fontSize: "1.1rem", 
                fontWeight: "600",
                color: "#2c3e50",
                marginBottom: "1rem"
            }}>Candidatos Postulados</h3>

            {postulados.length === 0 ? (
                <p style={{ 
                    color: "#6b7280",
                    fontSize: "0.95rem"
                }}>No hay postulaciones para esta vacante.</p>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    {postulados.map(postulado => (
                        <div key={postulado.id} style={{
                            backgroundColor: "#ffffff",
                            border: "1px solid #e5e7eb",
                            borderRadius: "6px",
                            padding: "1rem"
                        }}>
                            <div style={{ 
                                display: "flex", 
                                justifyContent: "space-between", 
                                alignItems: "center",
                                marginBottom: "0.5rem"
                            }}>
                                <h4 style={{ 
                                    fontSize: "1rem",
                                    fontWeight: "500",
                                    color: "#2c3e50"
                                }}>
                                    {postulado.usuario.first_name} {postulado.usuario.last_name}
                                </h4>
                                <span style={{ 
                                    padding: "0.25rem 0.75rem",
                                    borderRadius: "999px",
                                    fontSize: "0.85rem",
                                    backgroundColor: 
                                        postulado.estado === "aceptado" ? "#d1fae5" :
                                        postulado.estado === "rechazado" ? "#fee2e2" :
                                        "#f3f4f6",
                                    color:
                                        postulado.estado === "aceptado" ? "#059669" :
                                        postulado.estado === "rechazado" ? "#dc2626" :
                                        "#4b5563"
                                }}>
                                    {postulado.estado}
                                </span>
                            </div>

                            <button
                                onClick={() => verPerfil(postulado.id)}
                                style={{
                                    padding: "0.5rem",
                                    backgroundColor: "#f3f4f6",
                                    border: "none",
                                    borderRadius: "4px",
                                    fontSize: "0.9rem",
                                    color: "#4b5563",
                                    cursor: "pointer",
                                    marginBottom: "0.5rem",
                                    width: "100%",
                                    textAlign: "left"
                                }}
                            >
                                {perfilAbierto === postulado.id ? "Ocultar perfil" : "Ver perfil"}
                            </button>

                            {perfilAbierto === postulado.id && (
                                <div style={{ 
                                    backgroundColor: "#f8f9fa",
                                    padding: "1rem",
                                    borderRadius: "4px",
                                    marginBottom: "1rem"
                                }}>
                                    <p style={{ marginBottom: "0.5rem" }}>
                                        <strong>Email:</strong> {postulado.usuario.email}
                                    </p>
                                    <p style={{ marginBottom: "0.5rem" }}>
                                        <strong>Teléfono:</strong> {postulado.usuario.telefono}
                                    </p>
                                    <p style={{ marginBottom: "0.5rem" }}>
                                        <strong>Ciudad:</strong> {postulado.usuario.ciudad}
                                    </p>
                                    <p style={{ marginBottom: "0.5rem" }}>
                                        <strong>Formación:</strong> {postulado.usuario.formacion}
                                    </p>
                                    <p style={{ marginBottom: "0.5rem" }}>
                                        <strong>Experiencia:</strong> {postulado.usuario.experiencia}
                                    </p>
                                    <p>
                                        <strong>Habilidades:</strong> {postulado.usuario.habilidades}
                                    </p>
                                </div>
                            )}

                            <div style={{ 
                                display: "flex", 
                                gap: "0.5rem",
                                justifyContent: "flex-end" 
                            }}>
                                <button
                                    onClick={() => cambiarEstado(postulado.id, "aceptado")}
                                    style={{
                                        padding: "0.5rem 1rem",
                                        backgroundColor: "#28a745",
                                        color: "white",
                                        border: "none",
                                        borderRadius: "4px",
                                        cursor: "pointer",
                                        fontSize: "0.9rem"
                                    }}
                                >
                                    Aceptar
                                </button>
                                <button
                                    onClick={() => cambiarEstado(postulado.id, "rechazado")}
                                    style={{
                                        padding: "0.5rem 1rem",
                                        backgroundColor: "#dc3545",
                                        color: "white",
                                        border: "none",
                                        borderRadius: "4px",
                                        cursor: "pointer",
                                        fontSize: "0.9rem"
                                    }}
                                >
                                    Rechazar
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default PostuladosPorVacante;
