import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import DashboardCandidato from "./pages/DashboardCandidato";
import DashboardReclutador from "./pages/DashboardReclutador";
import EditarVacante from "./pages/EditarVacantePage";
import DetalleVacantePage from "./pages/DetalleVacantePage";
import HomePage from "./pages/HomePage";
import Navbar from "./components/Navbar";
import RutaProtegida from "./components/RutaProtegida";
import DetalleMisVacantesPage from "./pages/DetalleMisVacantesPage";
import 'react-tooltip/dist/react-tooltip.css';
import PerfilCandidatoPage from "./pages/PerfilCandidatoPage";


function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen relative">
        <div className="absolute inset-0 -z-10 h-full w-full [background:radial-gradient(125%_125%_at_50%_10%,#000_40%,#63e_100%)]"></div>
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/registro" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
          
          {/* Ruta protegida para candidatos */}
          <Route path="/candidato" element={
            <RutaProtegida rolRequerido="candidato">
                <DashboardCandidato />
            </RutaProtegida>} />

          {/* Ruta protegida para reclutadores */}
          <Route path="/reclutador" element={
            <RutaProtegida rolRequerido="reclutador">
                <DashboardReclutador />
            </RutaProtegida>} />

          {/* Ruta protegida para editar vacantes */}
          <Route path="/editar-vacante/:id" element={
            <RutaProtegida rolRequerido="reclutador">
                <EditarVacante />
            </RutaProtegida>} />

          {/* Ruta protegida para detalle de vacante */}
          <Route path="/detalle-vacante/:id" element={
            <RutaProtegida rolRequerido={["candidato"]}>
                <DetalleVacantePage />
            </RutaProtegida>} />

          {/* Ruta protegida para perfil candidato */}
          <Route path="/ver-postulantes/:idvacante/:idpostulante" element={
              <RutaProtegida rolRequerido="reclutador">
                <PerfilCandidatoPage />
              </RutaProtegida>} />

          {/* Ruta protegida para ver postulantes */}
          <Route path="/ver-postulantes/:id" element={
            <RutaProtegida rolRequerido={["reclutador"]}>
                <DetalleMisVacantesPage />
            </RutaProtegida>} />
          
        </Routes>
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
    </BrowserRouter>
  );
}

export default App;