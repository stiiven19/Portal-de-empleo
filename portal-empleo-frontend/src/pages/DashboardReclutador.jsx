import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import MisVacantes from "../components/MisVacantes";
import FormularioVacante from "../components/FormularioVacante";
import api from "../api/jobconnect.api";

function DashboardReclutador() {
    const [vacantes, setVacantes] = useState([]);
    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    const [expandida, setExpandida] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [paginaActual, setPaginaActual] = useState(1);
    const [totalPaginas, setTotalPaginas] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        cargarVacantes();
    }, [paginaActual]);

    const cargarVacantes = async () => {
        setIsLoading(true);
        try {
            const res = await api.get("/vacantes/", {
                params: { page: paginaActual }
            });
            console.log("Contenido de res.data:", res.data);
            
            // Extraer las vacantes de la propiedad results
            const vacantesArray = res.data.results || [];
            
            console.log("Vacantes procesadas:", vacantesArray);
            setVacantes(vacantesArray);
            
            // Configurar total de páginas
            setTotalPaginas(Math.ceil(res.data.count / 9));
        } catch (err) {
            console.error("Error al cargar vacantes:", err);
            toast.error("Error al cargar las vacantes");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmitVacante = async (formData) => {
        try {
            // Eliminar cualquier toast previo
            toast.dismiss();
            
            // Ocultar el formulario inmediatamente
            setMostrarFormulario(false);
            
            // Cargar vacantes para actualizar la lista
            await cargarVacantes();
            
            return;
        } catch (err) {
            console.error("Error al procesar la creación de vacante:", err);
        }
    };

    const cambiarPagina = (nuevaPagina) => {
        if (nuevaPagina > 0 && nuevaPagina <= totalPaginas) {
            setPaginaActual(nuevaPagina);
        }
    };

    return (
        <div style={{
            maxWidth: "1200px",
            margin: "0 auto",
            padding: "2rem",
            minHeight: "100vh",
            backgroundColor: "#f9fafb"
        }}>
            <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "2rem"
            }}>
                <h1 style={{
                    fontSize: "2rem",
                    fontWeight: "700",
                    color: "#1f2937"
                }}>Dashboard Reclutador</h1>
                
                <button
                    id="form-button"
                    onClick={() => setMostrarFormulario(!mostrarFormulario)}
                    style={{
                        padding: "0.75rem 1.5rem",
                        backgroundColor: "#0066cc",
                        color: "white",
                        border: "none",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontSize: "1rem",
                        fontWeight: "500",
                        transition: "background-color 0.2s"
                    }}
                    className="transform hover:scale-105 active:scale-95 transition-all duration-200"
                >
                    {mostrarFormulario ? "Cerrar Formulario" : "Crear Nueva Vacante"}
                </button>
            </div>

            {mostrarFormulario && (
                <div style={{
                    backgroundColor: "white",
                    padding: "2rem",
                    borderRadius: "8px",
                    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                    marginBottom: "2rem"
                }}>
                    <FormularioVacante onVacanteCreada={handleSubmitVacante} />
                </div>
            )}

            {isLoading ? (
                <div style={{ 
                    display: "flex", 
                    justifyContent: "center", 
                    alignItems: "center", 
                    height: "200px" 
                }}>
                    <p>Cargando vacantes...</p>
                </div>
            ) : (
                <div>
                    <MisVacantes
                        vacantes={vacantes}
                        onActualizar={cargarVacantes}
                        expandida={expandida}
                        setExpandida={setExpandida}
                    />
                    <div style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        padding: "1rem"
                    }}>
                        <button
                            onClick={() => cambiarPagina(paginaActual - 1)}
                            disabled={paginaActual === 1}
                            className="transform hover:scale-105 active:scale-95 transition-all duration-200"
                            style={{
                                padding: "0.5rem 1rem",
                                backgroundColor: "#0066cc",
                                color: "white",
                                border: "none",
                                borderRadius: "6px",
                                cursor: paginaActual === 1 ? "not-allowed" : "pointer",
                                fontSize: "1rem",
                                fontWeight: "500",
                                opacity: paginaActual === 1 ? 0.5 : 1,
                                marginRight: "1rem"
                            }}
                        >
                            Anterior
                        </button>
                        <p style={{ fontSize: "1.2rem", fontWeight: "600" }}>
                            Página {paginaActual} de {totalPaginas}
                        </p>
                        <button
                            onClick={() => cambiarPagina(paginaActual + 1)}
                            disabled={paginaActual === totalPaginas}
                            className="transform hover:scale-105 active:scale-95 transition-all duration-200"
                            style={{
                                padding: "0.5rem 1rem",
                                backgroundColor: "#0066cc",
                                color: "white",
                                border: "none",
                                borderRadius: "6px",
                                cursor: paginaActual === totalPaginas ? "not-allowed" : "pointer",
                                fontSize: "1rem",
                                fontWeight: "500",
                                opacity: paginaActual === totalPaginas ? 0.5 : 1,
                                marginLeft: "1rem"
                            }}
                        >
                            Siguiente
                        </button>
                    </div>
                </div>
            )}

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
            />
        </div>
    );
}

export default DashboardReclutador;