export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          eSIM Platform - ¡Funcionando! 🎉
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          El servidor web está corriendo correctamente.
        </p>
        <div className="space-x-4">
          <button 
            onClick={() => window.location.href = '/plans'}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Ver Planes
          </button>
          <button 
            onClick={() => window.location.href = '/dashboard'}
            className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
