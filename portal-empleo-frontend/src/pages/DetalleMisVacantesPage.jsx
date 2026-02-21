import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FaEye, FaCheck, FaTimes, FaSpinner, FaTrash, FaEdit, FaArrowLeft } from 'react-icons/fa';
import { Tooltip } from 'react-tooltip';
import api from '../api/jobconnect.api';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function DetalleVacantePage (){
    const navigate = useNavigate();
    const { id } = useParams(); // ID de la vacante
    const [vacante, setVacante] = useState(null);
    const [postulantes, setPostulantes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [paginaActual, setPaginaActual] = useState(1);
    const [totalPaginas, setTotalPaginas] = useState(0);

    useEffect(() => {
        const fetchDetalles = async () => {
            try {
                // Obtener detalles de la vacante
                const vacanteRes = await api.get(`/vacantes/${id}/`);
                setVacante(vacanteRes.data);

                // Intentar diferentes rutas para obtener postulantes
                let postulantesRes;
                const rutas = [
                    `/postulaciones-por-vacante/?vacante=${id}`,
                    `/postulaciones-recibidas/?vacante=${id}`,
                    `/mis-postulaciones/?vacante=${id}`
                ];

                for (const ruta of rutas) {
                    try {
                        postulantesRes = await api.get(ruta);
                        break;
                    } catch (error) {
                        console.log(`Error en ruta ${ruta}:`, error);
                        continue;
                    }
                }

                if (!postulantesRes) {
                    throw new Error('No se pudo obtener los postulantes');
                }

                // Procesar datos de postulantes
                const datosPostulantes = postulantesRes.data.results || postulantesRes.data;
                
                // Obtener detalles completos de cada postulación
                const postulantesConDetalles = await Promise.all(
                    datosPostulantes.map(async (postulacion) => {
                        try {
                            // Obtener detalles específicos de la postulación
                            const detallePostulacion = await api.get(`/postulaciones/${postulacion.id}/`);
                            
                            // Logging detallado para verificar estructura del correo
                            console.log('Detalle de postulación:', detallePostulacion.data);
                            console.log('Perfil candidato:', detallePostulacion.data.perfil_candidato);
                            console.log('Estructura completa:', JSON.stringify(detallePostulacion.data, null, 2));

                            // Obtener correo directamente de la postulación
                            let correo = detallePostulacion.data.email || 'Sin Correo';

                            return {
                                ...detallePostulacion.data,
                                candidato: {
                                    id: detallePostulacion.data.candidato,
                                    first_name: detallePostulacion.data.nombre,
                                    last_name: detallePostulacion.data.apellido,
                                    email: correo
                                }
                            };
                        } catch (error) {
                            console.error(`Error al obtener detalles de postulación ${postulacion.id}:`, error);
                            return postulacion;
                        }
                    })
                );

                setPostulantes(postulantesConDetalles);
                setTotalPaginas(Math.ceil(datosPostulantes.length / 10)); // Asumiendo 10 items por página

                setLoading(false);
            } catch (error) {
                console.error('Error completo:', error);
                toast.error('Error al cargar los detalles de la vacante', {
                    position: "bottom-right",
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true
                });
                setLoading(false);
            }
        };

        fetchDetalles();
    }, [id]);

    const cambiarEstado = async (postulacionId, nuevoEstado) => {
        try {
            console.log('Intentando cambiar estado:', { 
                postulacionId, 
                nuevoEstado,
                currentPostulantes: postulantes.map(p => ({id: p.id, estado: p.estado}))
            });
            
            const response = await api.patch(`/postulaciones/${postulacionId}/`, { estado: nuevoEstado });
            console.log('Respuesta del servidor:', response);
            
            // Actualizar estado localmente
            const postulantesActualizados = postulantes.map(p => 
                p.id === postulacionId ? { ...p, estado: nuevoEstado } : p
            );
            
            console.log('Postulantes después de actualizar:', postulantesActualizados);
            setPostulantes(postulantesActualizados);

            // Asegurarse de que el toast se muestre
            console.log('Preparando toast');
            toast.success(`Estado actualizado a ${nuevoEstado}`, {
                position: "bottom-right",
                autoClose: 3000,
                onOpen: () => console.log('Toast abierto'),
                onClose: () => console.log('Toast cerrado')
            });

            console.log('Estado cambiado exitosamente');
        } catch (error) {
            console.error("Error al actualizar el estado:", error);
            
            // Más detalles de error
            if (error.response) {
                console.error('Detalles de error de respuesta:', {
                    status: error.response.status,
                    data: error.response.data
                });
            }

            toast.error('Error al actualizar el estado', {
                position: "bottom-right",
                autoClose: 3000
            });
        }
    };

    const cambiarPagina = (nuevaPagina) => {
        if (nuevaPagina > 0 && nuevaPagina <= totalPaginas) {
            setPaginaActual(nuevaPagina);
        }
    };

    const eliminarVacante = async () => {
        if (window.confirm('¿Estás seguro de eliminar esta vacante?')) {
            try {
                await api.delete(`/vacantes/${id}/`);
                toast.success('Vacante eliminada exitosamente', {
                    position: "bottom-right",
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true
                });
                navigate('/reclutador');
            } catch (err) {
                console.error("Error al eliminar vacante:", err);
                toast.error('Error al eliminar la vacante', {
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

    const editarVacante = () => {
        navigate(`/editar-vacante/${id}`);
    };

    if (loading) return (
        <div className="flex justify-center items-center min-h-screen">
            <p className="text-xl text-gray-600">Cargando datos...</p>
        </div>
    );
    
    if (!vacante) return (
        <div className="flex justify-center items-center min-h-screen">
            <p className="text-xl text-red-600">Vacante no encontrada.</p>
        </div>
    );

    const renderEstadoIconos = (postulado) => {
        const estadosPermitidos = {
            'en revision': 'text-yellow-500',
            'descartado': 'text-red-500',
            'seleccionado': 'text-green-500'
        };

        const handleEstadoClick = (estado) => {
            console.log('Estado clickeado:', { 
                postulado: postulado.id, 
                estado,
                currentState: postulado.estado 
            });
            
            // Verificar si el estado es diferente antes de llamar a cambiarEstado
            if (postulado.estado !== estado) {
                cambiarEstado(postulado.id, estado);
            } else {
                console.log('Estado ya es igual, no se cambia');
                toast.info(`El estado ya es ${estado}`, {
                    position: "bottom-right",
                    autoClose: 2000
                });
            }
        };

        return (
            <div className="flex items-center space-x-2">
                <button 
                    onClick={() => handleEstadoClick('en revision')}
                    data-tooltip-id={`tooltip-revision-${postulado.id}`}
                    data-tooltip-content="En Revisión"
                    className={`p-2 rounded-full hover:bg-yellow-100 ${estadosPermitidos['en revision']} 
                        ${postulado.estado === 'en revision' ? 'bg-yellow-200' : ''}`}
                >
                    <FaSpinner />
                    <Tooltip id={`tooltip-revision-${postulado.id}`} />
                </button>

                <button 
                    onClick={() => handleEstadoClick('descartado')}
                    data-tooltip-id={`tooltip-descartado-${postulado.id}`}
                    data-tooltip-content="Descartado"
                    className={`p-2 rounded-full hover:bg-red-100 ${estadosPermitidos['descartado']} 
                        ${postulado.estado === 'descartado' ? 'bg-red-200' : ''}`}
                >
                    <FaTimes />
                    <Tooltip id={`tooltip-descartado-${postulado.id}`} />
                </button>

                <button 
                    onClick={() => handleEstadoClick('seleccionado')}
                    data-tooltip-id={`tooltip-seleccionado-${postulado.id}`}
                    data-tooltip-content="Seleccionado"
                    className={`p-2 rounded-full hover:bg-green-100 ${estadosPermitidos['seleccionado']} 
                        ${postulado.estado === 'seleccionado' ? 'bg-green-200' : ''}`}
                >
                    <FaCheck />
                    <Tooltip id={`tooltip-seleccionado-${postulado.id}`} />
                </button>
            </div>
        );
    };

    return (
        <div style={{ 
            display: "flex", 
            justifyContent: "center", 
            alignItems: "center", 
            minHeight: "100vh", 
            padding: "2rem",
        }}>
            <div style={{ 
                width: "100%", 
                maxWidth: "800px", 
                backgroundColor: "#ffffff", 
                borderRadius: "8px", 
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
                        onClick={() => navigate('/reclutador')}
                        style={{
                            backgroundColor: "transparent",
                            border: "none",
                            color: "#4a5568",
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem",
                            cursor: "pointer",
                            transition: "all 0.3s ease",
                            transform: "translateX(0)",
                            opacity: 1
                        }}
                        onMouseOver={(e) => {
                            e.target.style.color = "#2c3e50";
                            e.target.style.transform = "translateX(-5px)";
                        }}
                        onMouseOut={(e) => {
                            e.target.style.color = "#4a5568";
                            e.target.style.transform = "translateX(0)";
                        }}
                    >
                        <FaArrowLeft /> Volver
                    </button>

                    <div style={{ display: "flex", gap: "1rem" }}>
                        <button 
                            onClick={editarVacante}
                            style={{
                                backgroundColor: "#3b82f6",
                                color: "white",
                                border: "none",
                                padding: "0.5rem",
                                borderRadius: "50%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                cursor: "pointer",
                                transition: "background-color 0.2s"
                            }}
                            onMouseOver={(e) => e.target.style.backgroundColor = "#2563eb"}
                            onMouseOut={(e) => e.target.style.backgroundColor = "#3b82f6"}
                        >
                            <FaEdit />
                        </button>
                        <button 
                            onClick={eliminarVacante}
                            style={{
                                backgroundColor: "#ef4444",
                                color: "white",
                                border: "none",
                                padding: "0.5rem",
                                borderRadius: "50%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                cursor: "pointer",
                                transition: "background-color 0.2s"
                            }}
                            onMouseOver={(e) => e.target.style.backgroundColor = "#dc2626"}
                            onMouseOut={(e) => e.target.style.backgroundColor = "#ef4444"}
                        >
                            <FaTrash />
                        </button>
                    </div>
                </div>

                <div style={{ 
                    display: "grid", 
                    gridTemplateColumns: "1fr 1fr", 
                    gap: "1rem", 
                    marginBottom: "1rem" 
                }}>
                    <div>
                        <p style={{ fontWeight: "bold", color: "#4a5568", marginBottom: "0rem" }}>Título:</p>
                        <p style={{ color: "#2d3748" }}>{vacante.titulo}</p>
                    </div>
                    <div style={{ gridColumn: "1 / -1" }}>
                        <p style={{ fontWeight: "bold", color: "#4a5568", marginBottom: "0rem" }}>Descripción:</p>
                        <p style={{ color: "#2d3748" }}>{vacante.descripcion}</p>
                    </div>
                    <div style={{ gridColumn: "1 / -1" }}>
                        <p style={{ fontWeight: "bold", color: "#4a5568", marginBottom: "0rem" }}>Requisitos:</p>
                        <p style={{ color: "#2d3748" }}>{vacante.requisitos}</p>
                    </div>
                    <div>
                        <p style={{ fontWeight: "bold", color: "#4a5568", marginBottom: "0rem" }}>Ubicación:</p>
                        <p style={{ color: "#2d3748" }}>{vacante.ubicacion}</p>
                    </div>
                    <div>
                        <p style={{ fontWeight: "bold", color: "#4a5568", marginBottom: "0rem" }}>Tipo de Contrato:</p>
                        <p style={{ color: "#2d3748" }}>{vacante.tipo_contrato}</p>
                    </div>
                </div>

                <div>
                    <h3 style={{ 
                        fontSize: "1.5rem", 
                        fontWeight: "bold", 
                        color: "#2c3e50", 
                        textAlign: "center", 
                        marginBottom: "1.5rem" 
                    }}>Postulantes</h3>

                    {postulantes.length === 0 ? (
                        <div style={{ 
                            textAlign: "center", 
                            color: "#718096", 
                            padding: "2rem", 
                            backgroundColor: "#f7fafc", 
                            borderRadius: "8px" 
                        }}>
                            No tienes postulantes
                        </div>
                    ) : (
                        <div style={{ overflowX: "auto" }}>
                            <table style={{ 
                                width: "100%", 
                                borderCollapse: "collapse", 
                                backgroundColor: "white" 
                            }}>
                                <thead>
                                    <tr>
                                        <th style={tableHeaderStyle}>Nombre</th>
                                        <th style={tableHeaderStyle}>Estado</th>
                                        <th style={tableHeaderStyle}>Fecha Postulación</th>
                                        <th style={tableHeaderStyle}>Ver Perfil</th>
                                        <th style={tableHeaderStyle}>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {postulantes.map(postulado => (
                                        <tr key={postulado.id} style={{ borderBottom: "1px solid #e2e8f0" }}>
                                            <td style={tableCellStyle}>
                                                {postulado.candidato?.first_name || 'Sin'} {postulado.candidato?.last_name || 'Nombre'}
                                            </td>
                                            <td style={tableCellStyle}>
                                                <span style={{
                                                    padding: "0.25rem 0.5rem",
                                                    borderRadius: "0.375rem",
                                                    fontSize: "0.75rem",
                                                    fontWeight: "500",
                                                    backgroundColor: 
                                                        postulado.estado === 'en revision' ? "#fef3c7" :
                                                        postulado.estado === 'descartado' ? "#fee2e2" : 
                                                        "#d1fae5",
                                                    color: 
                                                        postulado.estado === 'en revision' ? "#92400e" :
                                                        postulado.estado === 'descartado' ? "#b91c1c" : 
                                                        "#047857"
                                                }}>
                                                    {postulado.estado === 'en revision' ? 'En Revisión' : 
                                                     postulado.estado === 'descartado' ? 'Descartado' : 
                                                     'Seleccionado'}
                                                </span>
                                            </td>
                                            <td style={tableCellStyle}>
                                                {new Date(postulado.fecha_postulacion).toLocaleDateString('es-CO', {
                                                    day: 'numeric',
                                                    month: 'long',
                                                    year: 'numeric'
                                                })}
                                            </td>
                                            <td style={tableCellStyle}>
                                                <button
                                                    onClick={() => navigate(`/ver-postulantes/${vacante.id}/${postulado.id}`)}
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
                                            </td>
                                            <td style={tableCellStyle}>
                                                {renderEstadoIconos(postulado)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {totalPaginas > 1 && (
                                <div style={{ 
                                    display: "flex", 
                                    justifyContent: "center", 
                                    alignItems: "center", 
                                    marginTop: "1.5rem", 
                                    gap: "1rem" 
                                }}>
                                    <button
                                        onClick={() => cambiarPagina(paginaActual - 1)}
                                        disabled={paginaActual === 1}
                                        style={{
                                            backgroundColor: "#3b82f6",
                                            color: "white",
                                            padding: "0.5rem 1rem",
                                            borderRadius: "9999px",
                                            opacity: paginaActual === 1 ? 0.5 : 1,
                                            cursor: paginaActual === 1 ? "not-allowed" : "pointer"
                                        }}
                                    >
                                        Anterior
                                    </button>
                                    <span style={{ color: "#4a5568" }}>
                                        Página {paginaActual} de {totalPaginas}
                                    </span>
                                    <button
                                        onClick={() => cambiarPagina(paginaActual + 1)}
                                        disabled={paginaActual === totalPaginas}
                                        style={{
                                            backgroundColor: "#3b82f6",
                                            color: "white",
                                            padding: "0.5rem 1rem",
                                            borderRadius: "9999px",
                                            opacity: paginaActual === totalPaginas ? 0.5 : 1,
                                            cursor: paginaActual === totalPaginas ? "not-allowed" : "pointer"
                                        }}
                                    >
                                        Siguiente
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
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

const tableHeaderStyle = {
    padding: "0.75rem",
    textAlign: "left",
    borderBottom: "1px solid #e2e8f0",
    color: "#4a5568"
};

const tableCellStyle = {
    padding: "0.75rem",
    color: "#2d3748"
};

export default DetalleVacantePage;