import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaTrash, FaEdit } from 'react-icons/fa';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import api from '../api/jobconnect.api';

function MisVacantes({ vacantes, onActualizar, expandida, setExpandida }) {
    
    const navigate = useNavigate();
    console.log(vacantes);

    const eliminarVacante = async (id) => {
        if (window.confirm('¿Estás seguro de eliminar esta vacante?')) {
            try {
                await api.delete(`/vacantes/${id}/`);
                toast.success('Vacante eliminada exitosamente');
                onActualizar();
            } catch (err) {
                console.error("Error al eliminar vacante:", err);
                toast.error('Error al eliminar la vacante');
            }
        }
    };

    const editarVacante = (id) => {
        navigate(`/editar-vacante/${id}`);
    };

    const irDetalleVacante = (id) => {
        navigate(`/ver-postulantes/${id}`);
    };

    return (
        <div style={{ padding: "2rem" }}>
            <h2 style={{ 
                textAlign: "center", 
                marginBottom: "1.5rem",
                color: "#2c3e50",
                fontSize: "1.75rem",
                fontWeight: "600"
            }}>Mis Vacantes Publicadas</h2>

            {vacantes.length === 0 ? (
                <p style={{ 
                    textAlign: "center", 
                    color: "#4a5568",
                    fontSize: "1rem" 
                }}>
                    No tienes vacantes publicadas aún
                </p>
            ) : (
                <div style={{ 
                    display: "grid", 
                    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", 
                    gap: "1.5rem",
                    maxWidth: "1200px",
                    margin: "0 auto"
                }}>
                    {vacantes.map(vacante => (
                        <div 
                            key={vacante.id} 
                            style={{
                                backgroundColor: "#ffffff",
                                border: "1px solid #dfe3e8",
                                borderRadius: "8px",
                                padding: "1.5rem",
                                boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                                cursor: "pointer",
                                transition: "transform 0.2s, box-shadow 0.2s",
                                ":hover": { 
                                    transform: "scale(1.02)", 
                                    boxShadow: "0 4px 15px rgba(0,0,0,0.15)" 
                                }
                            }}
                            className="transform hover:scale-105 active:scale-95 transition-all duration-200"
                            onClick={() => irDetalleVacante(vacante.id)}
                        >
                            <h3 style={{ 
                                fontSize: "1.25rem", 
                                fontWeight: "600",
                                color: "#2c3e50",
                                marginBottom: "1rem"
                            }}>{vacante.titulo}</h3>

                            <div style={{ marginBottom: "1rem" }}>
                                <p style={{ 
                                    color: "#4a5568",
                                    fontSize: "0.95rem",
                                    marginBottom: "0.5rem"
                                }}>
                                    <strong>Ubicación:</strong> {vacante.ubicacion}
                                </p>
                                <p style={{ 
                                    color: "#4a5568",
                                    fontSize: "0.95rem",
                                    marginBottom: "0.5rem"
                                }}>
                                    <strong>Tipo de contrato:</strong> {vacante.tipo_contrato}
                                </p>
                            </div>

                            <div style={{ 
                                display: "flex", 
                                gap: "0.5rem",
                                marginBottom: "1rem" 
                            }}>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        eliminarVacante(vacante.id);
                                    }}
                                    className="transform hover:scale-105 active:scale-95 transition-all duration-200"
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
                                    Eliminar
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        editarVacante(vacante.id);
                                    }}
                                    className="transform hover:scale-105 active:scale-95 transition-all duration-200"
                                    style={{
                                        padding: "0.5rem 1rem",
                                        backgroundColor: "#0066cc",
                                        color: "white",
                                        border: "none",
                                        borderRadius: "4px",
                                        cursor: "pointer",
                                        fontSize: "0.9rem"
                                    }}
                                >
                                    Editar
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default MisVacantes;