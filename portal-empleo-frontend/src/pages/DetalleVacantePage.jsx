
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/jobconnect.api";
import { toast } from 'react-toastify';
import { 
    FaMapMarkerAlt, 
    FaBuilding, 
    FaUser, 
    FaLink, 
    FaCalendarAlt, 
    FaArrowLeft, 
    FaEnvelope,
    FaPhoneAlt
} from 'react-icons/fa';

function DetalleVacantePage() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [vacante, setVacante] = useState(null);
    const [loading, setLoading] = useState(true);
    const [postulado, setPostulado] = useState(false);

    const getDatos = async () => {
        try {
            const res = await api.get(`/vacantes/${id}/`);
            
            // Mapear datos de reclutador y empresa
            const reclutador = res.data.reclutador || {
                id: null,
                first_name: 'Reclutador',
                last_name: 'no especificado',
                email: 'No disponible',
                perfil_reclutador: {
                    empresa: 'Empresa no especificada',
                    sitio_web: null,
                    cargo: 'No especificado',
                    telefono: 'No disponible'
                }
            };

            const vacanteConDetalles = {
                ...res.data,
                reclutador: {
                    id: reclutador.id,
                    nombre: `${reclutador.first_name} ${reclutador.last_name}`.trim(),
                    correo: reclutador.email,
                    perfil_reclutador: reclutador.perfil_reclutador
                },
                empresa: {
                    nombre: reclutador.perfil_reclutador?.empresa || 'Empresa no especificada',
                    sitio_web: reclutador.perfil_reclutador?.sitio_web || null,
                    cargo: reclutador.perfil_reclutador?.cargo || 'No especificado'
                }
            };

            setVacante(vacanteConDetalles);
            
            // Verificar si ya está postulado
            const postulacionesRes = await api.get('/mis-postulaciones/');
            const yaPostulado = postulacionesRes.data.results.some(p => p.vacante.id === parseInt(id));
            setPostulado(yaPostulado);
        } catch (err) {
            console.error("Error al cargar datos", err);
            toast.error("Error al cargar los detalles de la vacante");
        } finally {
            setLoading(false);
        }
    };

    const postularse = async () => {
        try {
            await api.post("/postulaciones/", { vacante: id });
            toast.success("¡Te has postulado exitosamente!");
            setPostulado(true);
        } catch (err) {
            console.error("Error al postularse", err);
            toast.error(err.response?.data?.non_field_errors?.[0] || "No se pudo completar la postulación");
        }
    };

    useEffect(() => {
        getDatos();
    }, [id]);

    if (loading) return (
        <div style={{ 
            display: "flex", 
            justifyContent: "center", 
            alignItems: "center", 
            minHeight: "100vh" 
        }}>
            <p>Cargando detalles de la vacante...</p>
        </div>
    );

    if (!vacante) return (
        <div style={{ 
            display: "flex", 
            justifyContent: "center", 
            alignItems: "center", 
            minHeight: "100vh" 
        }}>
            <p>Vacante no encontrada</p>
        </div>
    );

    return (
        <div style={{ 
            display: "flex", 
            justifyContent: "center", 
            alignItems: "center", 
            minHeight: "20vh", 
            padding: "4rem",
        }}>
            <div style={{ 
                width: "100%", 
                maxWidth: "800px", 
                backgroundColor: "#ffffff", 
                borderRadius: "12px", 
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                padding: "2rem"
            }}>
                <div style={{ 
                    display: "flex", 
                    justifyContent: "space-between", 
                    alignItems: "center", 
                    marginBottom: "1rem" 
                }}>
                    <button 
                        onClick={() => navigate(-1)}
                        style={{
                            backgroundColor: "transparent",
                            border: "none",
                            color: "#4a5568",
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem",
                            cursor: "pointer",
                            transition: "all 0.3s ease"
                        }}
                    >
                        <FaArrowLeft /> Volver
                    </button>
                </div>

                <div style={{ 
                    display: "grid", 
                    gridTemplateColumns: "1fr 1fr", 
                    gap: "1rem", 
                    marginBottom: "1rem" 
                }}>
                    <div>
                        <h2 style={{ 
                            fontSize: "1.75rem", 
                            fontWeight: "bold", 
                            color: "#2c3e50",
                            marginBottom: "0.5rem"
                        }}>
                            {vacante.titulo}
                        </h2>
                        <div style={{ 
                            display: "flex", 
                            alignItems: "center", 
                            gap: "0.5rem",
                            color: "#718096",
                            marginBottom: "0.5rem"
                        }}>
                            <FaBuilding />
                            <span>{vacante.empresa.nombre || 'Empresa no especificada'}</span>
                        </div>
                        <div style={{ 
                            display: "flex", 
                            alignItems: "center", 
                            gap: "0.5rem",
                            color: "#718096",
                            marginBottom: "0.5rem"
                        }}>
                            <FaMapMarkerAlt />
                            <span>{vacante.ubicacion}</span>
                        </div>
                        <div style={{ 
                            display: "flex", 
                            alignItems: "center", 
                            gap: "0.5rem",
                            color: "#718096"
                        }}>
                            <FaCalendarAlt />
                            <span>
                                Publicado el: {new Date(vacante.fecha_publicacion).toLocaleDateString()}
                            </span>
                        </div>
                    </div>

                    <div style={{ 
                        backgroundColor: "#f9fafb", 
                        borderRadius: "8px", 
                        padding: "1rem",
                        border: "1px solid #e2e8f0"
                    }}>
                        <h3 style={{ 
                            fontSize: "1.25rem", 
                            fontWeight: "bold", 
                            color: "#2c3e50",
                            marginBottom: "1rem",
                            borderBottom: "2px solid #3498db",
                            paddingBottom: "0.5rem"
                        }}>
                            Detalles del Reclutador
                        </h3>
                        <div style={{ 
                            display: "flex", 
                            alignItems: "center", 
                            gap: "0.5rem",
                            marginBottom: "0.5rem",
                            color: "#718096"
                        }}>
                            <FaUser />
                            <span>{vacante.reclutador.nombre || 'Reclutador no especificado'}</span>
                        </div>
                        <div style={{ 
                            display: "flex", 
                            alignItems: "center", 
                            gap: "0.5rem",
                            marginBottom: "0.5rem",
                            color: "#718096"
                        }}>
                            <FaEnvelope />
                            <span>{vacante.reclutador.correo || 'Correo no disponible'}</span>
                        </div>
                        {/* Detalles del sitio web del reclutador */}
                        {vacante.reclutador.perfil_reclutador.sitio_web ? (
                            <div style={{ 
                                display: "flex", 
                                alignItems: "center", 
                                gap: "0.5rem",
                                marginTop: "0.5rem"
                            }}>
                                <FaLink />
                                <a 
                                    href={vacante.reclutador.perfil_reclutador.sitio_web} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    style={{
                                        color: "#007bff",
                                        textDecoration: "none"
                                    }}
                                >
                                    {vacante.reclutador.perfil_reclutador.sitio_web}
                                </a>
                            </div>
                        ) : (
                            <div style={{ 
                                display: "flex", 
                                alignItems: "center", 
                                gap: "0.5rem",
                                marginTop: "0.5rem",
                                color: "#6c757d"
                            }}>
                                <FaLink />
                                <span>Sitio web no disponible</span>
                            </div>
                        )}
                    </div>
                </div>

                <div style={{ 
                    display: "grid", 
                    gridTemplateColumns: "1fr 1fr", 
                    gap: "1rem", 
                    marginBottom: "1rem" 
                }}>
                    <div>
                        <h3 style={{ 
                            fontSize: "1.25rem", 
                            fontWeight: "bold", 
                            color: "#2c3e50",
                            marginBottom: "0.5rem",
                            borderBottom: "2px solid #2ecc71",
                            paddingBottom: "0.5rem"
                        }}>
                            Descripción
                        </h3>
                        <p style={{ color: "#4a5568" }}>
                            {vacante.descripcion}
                        </p>
                    </div>
                    <div>
                        <h3 style={{ 
                            fontSize: "1.25rem", 
                            fontWeight: "bold", 
                            color: "#2c3e50",
                            marginBottom: "0.5rem",
                            borderBottom: "2px solid #e74c3c",
                            paddingBottom: "0.5rem"
                        }}>
                            Requisitos
                        </h3>
                        <p style={{ color: "#4a5568" }}>
                            {vacante.requisitos}
                        </p>
                    </div>
                </div>

                <div style={{ 
                    display: "flex", 
                    justifyContent: "space-between", 
                    alignItems: "center" 
                }}>
                    <div style={{ 
                        display: "flex", 
                        alignItems: "center", 
                        gap: "0.5rem" 
                    }}>
                        <span style={{
                            backgroundColor: "#e6f7ff",
                            color: "#1890ff",
                            padding: "0.5rem 1rem",
                            borderRadius: "4px",
                            fontSize: "0.9rem"
                        }}>
                            {vacante.tipo_contrato}
                        </span>
                    </div>
                    
                    <button 
                        onClick={postularse}
                        disabled={postulado}
                        style={{
                            backgroundColor: postulado ? "#95a5a6" : "#2ecc71",
                            color: "white",
                            border: "none",
                            padding: "0.75rem 1.5rem",
                            borderRadius: "8px",
                            cursor: postulado ? "not-allowed" : "pointer",
                            transition: "background-color 0.2s"
                        }}
                    >
                        {postulado ? "Ya Postulado" : "Postularme"}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default DetalleVacantePage;
