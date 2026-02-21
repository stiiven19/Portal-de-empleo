import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";  
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import api from "../api/jobconnect.api";
import PostuladosPorVacante from './PostuladosPorVacante';

function FormularioVacante({ onVacanteCreada }) {
    const navigate = useNavigate();  
    const [formData, setFormData] = useState({
        titulo: "",
        descripcion: "",
        requisitos: "",
        ubicacion: "",
        tipo_contrato: "",
    });

    const [mensaje, setMensaje] = useState("");
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [expandida, setExpandida] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Prevenir múltiples envíos
        if (isSubmitting) return;
        
        setIsSubmitting(true);
        setError("");
        setMensaje("");

        // Limpiar cualquier toast previo
        toast.dismiss();

        try {
            // Validar campos antes de enviar
            const camposVacios = Object.values(formData).some(valor => valor.trim() === '');
            if (camposVacios) {
                toast.error("Por favor, complete todos los campos");
                setIsSubmitting(false);
                return;
            }

            console.log("Datos a enviar:", formData);

            const response = await api.post("/vacantes/", formData);
            
            console.log("Respuesta del servidor:", response);
            
            // Verificar respuesta de manera más robusta
            if (response && (response.status === 201 || response.status === 200)) {
                // Mostrar toast de éxito SOLO UNA VEZ
                if (!toast.isActive('vacante-success')) {
                    toast.success("Vacante publicada exitosamente", {
                        toastId: 'vacante-success',
                        onClose: () => {
                            // Navegar al dashboard de reclutador después de que se cierre el toast
                            navigate('/reclutador');
                        }
                    });
                }
                
                // Llamar al callback si existe
                if (onVacanteCreada) {
                    onVacanteCreada(response.data);
                }
            } else {
                throw new Error("Respuesta inesperada del servidor");
            }
        } catch (err) {
            console.error("Error completo al crear vacante:", err);
            
            // Mostrar error SOLO UNA VEZ
            if (!toast.isActive('vacante-error')) {
                if (err.response) {
                    // El servidor respondió con un estado de error
                    console.error("Detalles del error del servidor:", err.response.data);
                    const errorMsg = err.response.data?.detail || "Error al publicar la vacante";
                    toast.error(errorMsg, {
                        toastId: 'vacante-error',
                        onClose: () => {
                            navigate('/reclutador');
                        }
                    });
                } else if (err.request) {
                    // La solicitud se hizo pero no se recibió respuesta
                    toast.error("No se pudo conectar con el servidor", {
                        toastId: 'vacante-error',
                        onClose: () => {
                            navigate('/reclutador');
                        }
                    });
                } else {
                    // Algo sucedió al configurar la solicitud
                    toast.error("Error al procesar la solicitud", {
                        toastId: 'vacante-error',
                        onClose: () => {
                            navigate('/reclutador');
                        }
                    });
                }
            }
            
            setError("No se pudo publicar la vacante.");
        } finally {
            // Asegurar que isSubmitting se resetee
            setIsSubmitting(false);
        }
    };

    return (
        <div style={{ padding: "2rem" }}>
            <div style={{ 
                maxWidth: "1200px", 
                margin: "0 auto",
                backgroundColor: "#ffffff",
                border: "1px solid #dfe3e8",
                borderRadius: "8px",
                padding: "2rem",
                boxShadow: "0 2px 10px rgba(0,0,0,0.1)"
            }}>
                <h2 style={{ 
                    textAlign: "center", 
                    marginBottom: "1.5rem",
                    color: "#2c3e50",
                    fontSize: "1.75rem",
                    fontWeight: "600"
                }}>Publicar Nueva Vacante</h2>

                {mensaje && <p style={{ 
                    color: "#28a745", 
                    textAlign: "center",
                    padding: "0.5rem",
                    backgroundColor: "#d4edda",
                    borderRadius: "4px",
                    marginBottom: "1rem"
                }}>{mensaje}</p>}

                {error && <p style={{ 
                    color: "#dc3545", 
                    textAlign: "center",
                    padding: "0.5rem",
                    backgroundColor: "#f8d7da",
                    borderRadius: "4px",
                    marginBottom: "1rem"
                }}>{error}</p>}

                <form onSubmit={handleSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                        <div>
                            <label style={{ 
                                display: "block", 
                                marginBottom: "0.5rem", 
                                color: "#4a5568" 
                            }}>Título de la Vacante</label>
                            <input 
                                id="titulo-vacante"
                                type="text"
                                name="titulo"
                                value={formData.titulo}
                                onChange={handleChange}
                                required
                                style={{
                                    width: "100%",
                                    padding: "0.75rem",
                                    border: "1px solid #dfe3e8",
                                    borderRadius: "4px",
                                    fontSize: "1rem"
                                }}
                                placeholder="Ej: Desarrollador Full Stack"
                            />
                        </div>
                        <div>
                            <label style={{ 
                                display: "block", 
                                marginBottom: "0.5rem", 
                                color: "#4a5568" 
                            }}>Ubicación</label>
                            <input 
                                id="ubicacion-vacante"
                                type="text"
                                name="ubicacion"
                                value={formData.ubicacion}
                                onChange={handleChange}
                                required
                                style={{
                                    width: "100%",
                                    padding: "0.75rem",
                                    border: "1px solid #dfe3e8",
                                    borderRadius: "4px",
                                    fontSize: "1rem"
                                }}
                                placeholder="Ej: Bogotá, Colombia"
                            />
                        </div>
                    </div>

                    <div>
                        <label style={{ 
                            display: "block", 
                            marginBottom: "0.5rem", 
                            color: "#4a5568" 
                        }}>Descripción de la Vacante</label>
                        <textarea 
                            id="descripcion-vacante"
                            name="descripcion"
                            value={formData.descripcion}
                            onChange={handleChange}
                            required
                            style={{
                                width: "100%",
                                padding: "0.75rem",
                                border: "1px solid #dfe3e8",
                                borderRadius: "4px",
                                fontSize: "1rem",
                                minHeight: "100px"
                            }}
                            placeholder="Describe los detalles de la vacante..."
                        />
                    </div>

                    <div>
                        <label style={{ 
                            display: "block", 
                            marginBottom: "0.5rem", 
                            color: "#4a5568" 
                        }}>Requisitos</label>
                        <textarea 
                            id="requisitos-vacante"
                            name="requisitos"
                            value={formData.requisitos}
                            onChange={handleChange}
                            required
                            style={{
                                width: "100%",
                                padding: "0.75rem",
                                border: "1px solid #dfe3e8",
                                borderRadius: "4px",
                                fontSize: "1rem",
                                minHeight: "100px"
                            }}
                            placeholder="Describe los requisitos para la vacante..."
                        />
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                        <div>
                            <label style={{ 
                                display: "block", 
                                marginBottom: "0.5rem", 
                                color: "#4a5568" 
                            }}>Tipo de Contrato</label>
                            <select
                                id="tipo-contrato-vacante"
                                name="tipo_contrato"
                                value={formData.tipo_contrato}
                                onChange={handleChange}
                                required
                                style={{
                                    width: "200%",
                                    padding: "0.5rem",
                                    border: "1px solid #dfe3e8",
                                    borderRadius: "4px",
                                    fontSize: "1rem"
                                }}
                            >
                                <option value="">Selecciona un tipo de contrato</option>
                                <option value="Tiempo Completo">Tiempo Completo</option>
                                <option value="Medio Tiempo">Medio Tiempo</option>
                                <option value="Freelance">Freelance</option>
                            </select>
                        </div>
                    </div>

                    <button 
                        id="publish-vacancy-button"
                        type="submit" 
                        disabled={isSubmitting}
                        style={{
                            padding: "0.75rem 1.5rem",
                            backgroundColor: "#0066cc",
                            color: "white",
                            border: "none",
                            borderRadius: "6px",
                            cursor: isSubmitting ? "not-allowed" : "pointer",
                            fontSize: "1rem",
                            fontWeight: "500",
                            opacity: isSubmitting ? 0.5 : 1,
                            width: "100%"
                        }}
                        className="transform hover:scale-105 active:scale-95 transition-all duration-200"
                    >
                        {isSubmitting ? "Publicando..." : "Publicar Vacante"}
                    </button>
                </form>
            </div>

            {expandida && (
                <div style={{ marginTop: "2rem" }}>
                    <PostuladosPorVacante 
                        vacanteId={expandida} 
                        onClose={() => setExpandida(null)} 
                    />
                </div>
            )}
        </div>
    );
}

export default FormularioVacante;