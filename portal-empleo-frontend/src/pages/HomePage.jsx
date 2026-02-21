import { FaBriefcase, FaUserCheck, FaUserCircle } from "react-icons/fa";

function HomePage() {
    return (
        <div className="min-h-screen flex flex-col justify-center items-center px-4 py-12">
            <div className="bg-white shadow-lg rounded-2xl p-10 max-w-4xl w-full transition-all">
                <h1 className="text-4xl font-extrabold text-center text-gray-800 mb-4">
                    🚀 Portal de Empleo
                </h1>
                <p className="text-center text-gray-600 text-lg mb-8">
                    Conecta con las mejores oportunidades laborales y destaca tu perfil profesional.
                </p>

                <div className="grid md:grid-cols-3 gap-6 text-center">
                    <div className="bg-green-100 rounded-xl p-6 hover:shadow-md transition">
                        <FaBriefcase className="text-green-600 text-3xl mx-auto mb-2" />
                        <h3 className="text-lg font-semibold text-gray-700 mb-1">Vacantes a tu medida</h3>
                        <p className="text-sm text-gray-600">Explora ofertas laborales según tu perfil y ubicación.</p>
                    </div>
                    <div className="bg-blue-100 rounded-xl p-6 hover:shadow-md transition">
                        <FaUserCheck className="text-blue-600 text-3xl mx-auto mb-2" />
                        <h3 className="text-lg font-semibold text-gray-700 mb-1">Postúlate fácil</h3>
                        <p className="text-sm text-gray-600">Aplica a vacantes en segundos con un solo clic.</p>
                    </div>
                    <div className="bg-yellow-100 rounded-xl p-6 hover:shadow-md transition">
                        <FaUserCircle className="text-yellow-600 text-3xl mx-auto mb-2" />
                        <h3 className="text-lg font-semibold text-gray-700 mb-1">Perfil profesional</h3>
                        <p className="text-sm text-gray-600">Gestiona tu experiencia, habilidades y formación.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default HomePage;
