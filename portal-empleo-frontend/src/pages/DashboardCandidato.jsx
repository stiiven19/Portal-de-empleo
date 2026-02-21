import React, { useState, useEffect } from "react";
import api from "../api/jobconnect.api";
import { FaMapMarkerAlt, FaCalendarAlt, FaFilter, FaEye, FaBuilding, FaUser, FaLink } from 'react-icons/fa';
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from 'react-toastify';

function DashboardCandidato() {
    const navigate = useNavigate();
    const [vacantes, setVacantes] = useState([]);
    const [postulaciones, setPostulaciones] = useState([]);
    const [pagina, setPagina] = useState(1);
    const [paginaPostulaciones, setPaginaPostulaciones] = useState(1);
    const [totalPaginas, setTotalPaginas] = useState(0);
    const [totalPaginasPostulaciones, setTotalPaginasPostulaciones] = useState(0);
    const [filtro, setFiltro] = useState({
        ordenarPor: 'fecha_publicacion',
        orden: 'desc'
    });

    const getVacantes = async () => {
        try {
            // Mapear ordenamiento para backend
            const ordenamientoMap = {
                'titulo': 'titulo',
                'fecha_publicacion': 'fecha_publicacion'
            };

            const params = new URLSearchParams({
                page: pagina,
                ordering: `${filtro.orden === 'desc' ? '-' : ''}${ordenamientoMap[filtro.ordenarPor] || 'fecha_publicacion'}`
            });

            const res = await api.get(`/vacantes/?${params.toString()}`);
            
            // Mapear datos de reclutador y empresa
            const vacantesConDetalles = res.data.results.map(vacante => {
                // Extraer datos del reclutador
                const reclutador = vacante.reclutador || {
                    id: null,
                    first_name: 'Reclutador',
                    last_name: 'no especificado',
                    email: 'No disponible',
                    perfil_reclutador: {
                        empresa: 'Empresa no especificada',
                        sitio_web: null,
                        cargo: 'No especificado'
                    }
                };

                return {
                    ...vacante,
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
            });

            setVacantes(vacantesConDetalles);
            setTotalPaginas(Math.ceil(res.data.count / 10));
        } catch (err) {
            console.error("Error al cargar vacantes", err);
        }
    };
    
    const getPostulaciones = async () => {
        try {
            const params = new URLSearchParams({
                page: paginaPostulaciones
            });
            const res = await api.get(`/mis-postulaciones/?${params.toString()}`);
            setPostulaciones(res.data.results || []);
            setTotalPaginasPostulaciones(Math.ceil(res.data.count / 10));
        } catch (err) {
            console.error("Error al cargar tus postulaciones", err);
        }
    };

    const handlePostularse = async (vacante) => {
        try {
            // Verificar si ya existe una postulación para esta vacante
            const postulacionExistente = postulaciones.find(p => p.vacante.id === vacante.id);
            
            if (postulacionExistente) {
                toast.info('Ya estás postulado a esta vacante', {
                    position: "bottom-right",
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true
                });
                return;
            }

            const res = await api.post("/postulaciones/", { vacante: vacante.id });
            toast.success(`Te has postulado exitosamente a la vacante: ${vacante.titulo}`, {
                position: "bottom-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true
            });
            getPostulaciones(); // Actualizar lista de postulaciones
        } catch (err) {
            // Verificar si el error es por postulación duplicada
            if (err.response?.status === 400 && err.response?.data?.detail?.includes('Ya existe')) {
                toast.info('Ya estás postulado a esta vacante', {
                    position: "bottom-right",
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true
                });
            } else {
                toast.error(err.response?.data?.detail || "Error al postularse", {
                    position: "bottom-right",
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true
                });
            }
        }
    };

    const handleCancelarPostulacion = async (postulacion) => {
        const confirmacion = window.confirm(`¿Estás seguro de cancelar tu postulación a "${postulacion.vacante.titulo}"?`);
        
        if (confirmacion) {
            try {
                await api.delete(`/postulaciones/${postulacion.id}/`);
                toast.success(`Postulación cancelada para la vacante: ${postulacion.vacante.titulo}`, {
                    position: "bottom-right",
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true
                });
                getPostulaciones(); // Actualizar lista de postulaciones
            } catch (err) {
                toast.error(err.response?.data?.detail || "Error al cancelar postulación", {
                    position: "bottom-right",
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true
                });
            }
        }
    };

    const verDetallesVacante = (id) => {
        navigate(`/detalle-vacante/${id}`);
    };
    
    useEffect(() => {
        getVacantes();
    }, [pagina, filtro]);
    
    useEffect(() => {
        getPostulaciones();
    }, [paginaPostulaciones]);
    
    return (
        <div style={{
            maxWidth: "1200px",
            margin: "0 auto",
            padding: "2rem",
        }}>
            <ToastContainer />
            <div style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "2rem",
                marginBottom: "2rem"
            }}>
                {/* Vacantes Disponibles */}
                <div style={{
                    backgroundColor: "white",
                    borderRadius: "12px",
                    padding: "1.5rem",
                    boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                    height: "800px",
                    display: "flex",
                    flexDirection: "column"
                }}>
                    <div style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "1rem"
                    }}>
                        <h2 style={{
                            fontSize: "1.5rem",
                            fontWeight: "bold",
                            color: "#2c3e50",
                            borderBottom: "2px solid #3498db",
                            paddingBottom: "0.5rem"
                        }}>
                            Vacantes Disponibles
                        </h2>
                        
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            <FaFilter />
                            <select 
                                value={`${filtro.ordenarPor}-${filtro.orden}`}
                                onChange={(e) => {
                                    const [ordenarPor, orden] = e.target.value.split('-');
                                    setFiltro({ ordenarPor, orden });
                                }}
                                style={{
                                    padding: "0.5rem",
                                    borderRadius: "4px",
                                    border: "1px solid #e2e8f0"
                                }}
                            >
                                <option value="fecha_publicacion-desc">Más Recientes</option>
                                <option value="fecha_publicacion-asc">Más Antiguos</option>
                                <option value="titulo-asc">Título A-Z</option>
                                <option value="titulo-desc">Título Z-A</option>
                            </select>
                        </div>
                    </div>

                    {vacantes.length === 0 ? (
                        <p style={{ color: "#718096", textAlign: "center" }}>
                            No hay vacantes disponibles.
                        </p>
                    ) : (
                        <>
                            <div style={{ 
                                display: "grid", 
                                gap: "1rem",
                                flex: 1,
                                overflowY: "auto"
                            }}>
                                {vacantes.map((v) => (
                                    <div key={v.id} style={{
                                        backgroundColor: "#f9fafb",
                                        borderRadius: "8px",
                                        padding: "1rem",
                                        border: "1px solid #e2e8f0",
                                        display: "grid",
                                        gridTemplateColumns: "1fr 2fr",
                                        gap: "1rem",
                                        alignItems: "start"
                                    }}>
                                        <div style={{
                                            display: "flex",
                                            flexDirection: "column",
                                            gap: "0.5rem"
                                        }}>
                                            <div style={{ 
                                                display: "flex", 
                                                alignItems: "center", 
                                                gap: "0.5rem",
                                                color: "#718096"
                                            }}>
                                                <FaBuilding />
                                                <span style={{ fontWeight: "bold" }}>
                                                    {v.empresa.nombre || 'Empresa no especificada'}
                                                </span>
                                            </div>
                                            <div style={{ 
                                                display: "flex", 
                                                alignItems: "center", 
                                                gap: "0.5rem",
                                                color: "#718096"
                                            }}>
                                                <FaUser />
                                                <span>
                                                    {v.reclutador.nombre || 'Reclutador no especificado'}
                                                </span>
                                            </div>
                                            <div style={{ 
                                                display: "flex", 
                                                alignItems: "center", 
                                                gap: "0.5rem",
                                                color: "#718096"
                                            }}>
                                                <FaMapMarkerAlt />
                                                <span>{v.ubicacion}</span>
                                            </div>
                                            <div style={{ 
                                                display: "flex", 
                                                alignItems: "center", 
                                                gap: "0.5rem",
                                                color: "#718096"
                                            }}>
                                                <FaCalendarAlt />
                                                <span>
                                                    {new Date(v.fecha_publicacion).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>

                                        <div>
                                            <h3 style={{
                                                fontSize: "1.2rem",
                                                color: "#2c3e50",
                                                marginBottom: "0.5rem"
                                            }}>
                                                {v.titulo}
                                            </h3>
                                            <p style={{ 
                                                color: "#4a5568", 
                                                marginBottom: "1rem",
                                                overflow: "hidden",
                                                textOverflow: "ellipsis",
                                                display: "-webkit-box",
                                                WebkitLineClamp: 3,
                                                WebkitBoxOrient: "vertical"
                                            }}>
                                                {v.descripcion}
                                            </p>
                                            
                                            <div style={{ 
                                                display: "flex", 
                                                justifyContent: "space-between",
                                                alignItems: "center" 
                                            }}>
                                                <span style={{
                                                    backgroundColor: "#e6f7ff",
                                                    color: "#1890ff",
                                                    padding: "0.25rem 0.5rem",
                                                    borderRadius: "4px",
                                                    fontSize: "0.8rem"
                                                }}>
                                                    {v.tipo_contrato}
                                                </span>
                                                
                                                <div style={{ display: "flex", gap: "0.5rem" }}>
                                                    {v.reclutador.perfil_reclutador.sitio_web && (
                                                        <a 
                                                            href={v.reclutador.perfil_reclutador.sitio_web} 
                                                            target="_blank" 
                                                            rel="noopener noreferrer"
                                                            style={{
                                                                backgroundColor: "#2ecc71",
                                                                color: "white",
                                                                border: "none",
                                                                padding: "0.5rem",
                                                                borderRadius: "50%",
                                                                display: "flex",
                                                                alignItems: "center",
                                                                justifyContent: "center",
                                                                cursor: "pointer"
                                                            }}
                                                        >
                                                            <FaLink />
                                                        </a>
                                                    )}
                                                    <button
                                                        onClick={() => navigate(`/detalle-vacante/${v.id}`)}
                                                        className="transform hover:scale-105 active:scale-95 transition-all duration-200"
                                                        style={{
                                                            backgroundColor: "transparent",
                                                            border: "none",
                                                            cursor: "pointer",
                                                            padding: "0.5rem",
                                                            borderRadius: "50%"
                                                        }}
                                                    >
                                                        <FaEye />
                                                    </button>
                                                    <button
                                                        onClick={() => handlePostularse(v)}
                                                        className="transform hover:scale-105 active:scale-95 transition-all duration-200"
                                                        style={{
                                                            backgroundColor: "#2ecc71",
                                                            color: "white",
                                                            border: "none",
                                                            padding: "0.5rem 1rem",
                                                            borderRadius: "4px",
                                                            cursor: "pointer",
                                                            fontSize: "0.9rem"
                                                        }}
                                                    >
                                                        Postularme
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Paginación */}
                            <div style={{ 
                                display: "flex", 
                                justifyContent: "center", 
                                marginTop: "1rem",
                                gap: "0.5rem"
                            }}>
                                {Array.from({ length: totalPaginas }, (_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setPagina(i + 1)}
                                        className="transform hover:scale-105 active:scale-95 transition-all duration-200"
                                        style={{
                                            padding: "0.5rem 1rem",
                                            backgroundColor: pagina === i + 1 ? "#0066cc" : "#f8f9fa",
                                            color: pagina === i + 1 ? "white" : "black",
                                            border: "1px solid #dee2e6",
                                            borderRadius: "4px",
                                            cursor: "pointer"
                                        }}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                            </div>
                        </>
                    )}
                </div>

                {/* Mis Postulaciones */}
                <div style={{
                    backgroundColor: "white",
                    borderRadius: "12px",
                    padding: "1.5rem",
                    boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                    height: "800px",
                    display: "flex",
                    flexDirection: "column"
                }}>
                    <div style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center"
                    }}>
                        <h2 style={{
                            fontSize: "1.5rem",
                            fontWeight: "bold",
                            color: "#2c3e50",
                            margin: 0,
                            borderBottom: "2px solid #2ecc71",
                            paddingBottom: "0.5rem"
                        }}>
                            Mis Postulaciones
                        </h2>
                        {postulaciones.length > 0 && (
                            <div style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "0.5rem",
                                color: "#718096"
                            }}>
                                <span>{postulaciones.length} Postulaciones</span>
                            </div>
                        )}
                    </div>

                    <div style={{
                        overflowY: "auto",
                        display: "grid",
                        gap: "1rem",
                        flex: 1
                    }}>
                        {postulaciones.length === 0 ? (
                            <div style={{
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "center",
                                alignItems: "center",
                                height: "100%",
                                color: "#718096"
                            }}>
                                <p>No tienes postulaciones activas</p>
                            </div>
                        ) : (
                            postulaciones.map((p) => (
                                <div key={p.id} style={{
                                    backgroundColor: "#f9fafb",
                                    borderRadius: "8px",
                                    padding: "1rem",
                                    border: "1px solid #e2e8f0",
                                    display: "grid",
                                    gridTemplateColumns: "1fr 2fr",
                                    gap: "1rem",
                                    alignItems: "start"
                                }}>
                                    <div style={{
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: "0.5rem"
                                    }}>
                                        <div style={{ 
                                            display: "flex", 
                                            alignItems: "center", 
                                            gap: "0.5rem",
                                            color: "#718096"
                                        }}>
                                            <FaBuilding />
                                            <span style={{ fontWeight: "bold" }}>
                                                {p.vacante.empresa?.nombre || 
                                                    p.vacante.reclutador?.perfil_reclutador?.empresa || 'Empresa no especificada'}
                                            </span>
                                        </div>
                                        <div style={{ 
                                            display: "flex", 
                                            alignItems: "center", 
                                            gap: "0.5rem",
                                            color: "#718096"
                                        }}>
                                            <FaUser />
                                            <span>
                                                {p.vacante.reclutador ? 
                                                    `${p.vacante.reclutador.first_name} ${p.vacante.reclutador.last_name}` : 
                                                    'Reclutador no especificado'
                                                }
                                            </span>
                                        </div>
                                        <div style={{ 
                                            display: "flex", 
                                            alignItems: "center", 
                                            gap: "0.5rem",
                                            color: "#718096"
                                        }}>
                                            <FaMapMarkerAlt />
                                            <span>{p.vacante.ubicacion || 'Ubicación no especificada'}</span>
                                        </div>
                                        <div style={{ 
                                            display: "flex", 
                                            alignItems: "center", 
                                            gap: "0.5rem",
                                            color: "#718096"
                                        }}>
                                            <FaCalendarAlt />
                                            <span>
                                                {new Date(p.vacante.fecha_publicacion).toLocaleDateString('es-CO', {
                                                    day: 'numeric',
                                                    month: 'long',
                                                    year: 'numeric'
                                                })}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    <div style={{
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: "1rem"
                                    }}>
                                        <div>
                                            <h3 style={{ 
                                                margin: "0 0 0.5rem 0", 
                                                color: "#2c3e50",
                                                fontSize: "1.2rem"
                                            }}>
                                                {p.vacante.titulo}
                                            </h3>
                                            <p style={{
                                                margin: 0,
                                                fontWeight: "bold",
                                                fontSize: "0.9rem",
                                                color: p.estado === "seleccionado"
                                                    ? "#28a745"
                                                    : p.estado === "descartado"
                                                    ? "#dc3545"
                                                    : "#ffc107"
                                            }}>
                                                Estado: {p.estado.charAt(0).toUpperCase() + p.estado.slice(1)}
                                            </p>
                                            <p style={{ 
                                                color: "#718096", 
                                                margin: "0",
                                                overflow: "hidden",
                                                textOverflow: "ellipsis",
                                                display: "-webkit-box",
                                                WebkitLineClamp: "2",
                                                WebkitBoxOrient: "vertical"
                                            }}>
                                                {p.vacante.descripcion}
                                            </p>
                                        </div>
                                        
                                        <div style={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center"
                                        }}>
                                            <span style={{
                                                backgroundColor: "#e9ecef",
                                                color: "#495057",
                                                padding: "0.25rem 0.5rem",
                                                borderRadius: "4px",
                                                fontSize: "0.9rem"
                                            }}>
                                                {p.vacante.tipo_contrato}
                                            </span>
                                            
                                            <button 
                                                onClick={() => handleCancelarPostulacion(p)}
                                                className="transform hover:scale-105 active:scale-95 transition-all duration-200"
                                                style={{
                                                    backgroundColor: "#dc3545",
                                                    color: "white",
                                                    border: "none",
                                                    padding: "0.5rem 1rem",
                                                    borderRadius: "4px",
                                                    cursor: "pointer",
                                                    fontSize: "0.9rem"
                                                }}
                                            >
                                                Cancelar Postulación
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {postulaciones.length > 0 && (
                        <div style={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            gap: "0.5rem"
                        }}>
                            {Array.from({ length: totalPaginasPostulaciones }, (_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setPaginaPostulaciones(i + 1)}
                                    className="transform hover:scale-105 active:scale-95 transition-all duration-200"
                                    style={{
                                        padding: "0.5rem 1rem",
                                        backgroundColor: paginaPostulaciones === i + 1 ? "#0066cc" : "#f8f9fa",
                                        color: paginaPostulaciones === i + 1 ? "white" : "black",
                                        border: "1px solid #dee2e6",
                                        borderRadius: "4px",
                                        cursor: "pointer"
                                    }}
                                >
                                    {i + 1}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default DashboardCandidato;