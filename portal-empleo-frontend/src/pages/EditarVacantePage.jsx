import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import api from "../api/jobconnect.api";

function EditarVacante() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        titulo: "",
        descripcion: "",
        requisitos: "",
        ubicacion: "",
        tipo_contrato: ""
    });

    useEffect(() => {
        const cargarVacante = async () => {
            try {
                const res = await api.get(`/vacantes/${id}/`);
                setFormData(res.data);
            } catch (err) {
                console.error("Error al cargar vacante:", err);
                toast.error("No se pudo cargar la vacante");
                navigate("/reclutador");
            }
        };

        cargarVacante();
    }, [id, navigate]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/vacantes/${id}/`, formData);
            
            // Mostrar toast y esperar un momento antes de navegar
            toast.success("Vacante actualizada exitosamente", {
                onClose: () => navigate("/reclutador"),
                autoClose: 1000
            });
        } catch (err) {
            console.error("Error al actualizar vacante:", err);
            toast.error("No se pudo actualizar la vacante");
        }
    };

    return (
        <div style={{
            maxWidth: "600px",
            margin: "2rem auto",
            padding: "2rem",
            backgroundColor: "white",
            borderRadius: "8px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.1)"
        }}>
            <h2 style={{
                textAlign: "center",
                marginBottom: "1.5rem",
                color: "#2c3e50"
            }}>Editar Vacante</h2>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <input
                    type="text"
                    name="titulo"
                    placeholder="Título de la vacante"
                    value={formData.titulo}
                    onChange={handleChange}
                    required
                    style={{
                        padding: "0.75rem",
                        fontSize: "1rem",
                        border: "1px solid #dfe3e8",
                        borderRadius: "4px",
                        outline: "none"
                    }}
                />

                <textarea
                    name="descripcion"
                    placeholder="Descripción de la vacante"
                    value={formData.descripcion}
                    onChange={handleChange}
                    required
                    style={{
                        padding: "0.75rem",
                        fontSize: "1rem",
                        border: "1px solid #dfe3e8",
                        borderRadius: "4px",
                        minHeight: "100px",
                        resize: "vertical",
                        outline: "none"
                    }}
                />

                <textarea
                    name="requisitos"
                    placeholder="Requisitos del cargo"
                    value={formData.requisitos}
                    onChange={handleChange}
                    required
                    style={{
                        padding: "0.75rem",
                        fontSize: "1rem",
                        border: "1px solid #dfe3e8",
                        borderRadius: "4px",
                        minHeight: "100px",
                        resize: "vertical",
                        outline: "none"
                    }}
                />

                <input
                    type="text"
                    name="ubicacion"
                    placeholder="Ubicación"
                    value={formData.ubicacion}
                    onChange={handleChange}
                    required
                    style={{
                        padding: "0.75rem",
                        fontSize: "1rem",
                        border: "1px solid #dfe3e8",
                        borderRadius: "4px",
                        outline: "none"
                    }}
                />

                <select
                    name="tipo_contrato"
                    value={formData.tipo_contrato}
                    onChange={handleChange}
                    required
                    style={{
                        padding: "0.75rem",
                        fontSize: "1rem",
                        border: "1px solid #dfe3e8",
                        borderRadius: "4px",
                        outline: "none"
                    }}
                >
                    <option value="">Seleccione tipo de contrato</option>
                    <option value="Tiempo completo">Tiempo completo</option>
                    <option value="Medio tiempo">Medio tiempo</option>
                    <option value="Por proyecto">Por proyecto</option>
                    <option value="Freelance">Freelance</option>
                </select>

                <div style={{ 
                    display: "flex", 
                    justifyContent: "space-between",
                    marginTop: "1rem" 
                }}>
                    <button
                        type="button"
                        onClick={() => navigate("/reclutador")}
                        style={{
                            padding: "0.75rem 1.5rem",
                            backgroundColor: "#6c757d",
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer"
                        }}
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        style={{
                            padding: "0.75rem 1.5rem",
                            backgroundColor: "#0066cc",
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer"
                        }}
                    >
                        Guardar Cambios
                    </button>
                </div>
            </form>
            <ToastContainer position="bottom-right" />
        </div>
    );
}

export default EditarVacante;
