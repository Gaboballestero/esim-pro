'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function DashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'overview' | 'esims' | 'profile'>('overview');
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [userESims, setUserESims] = useState<any[]>([]);

  useEffect(() => {
    // Verificar si el usuario está autenticado
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      if (parsedUser.isAuthenticated) {
        setUser(parsedUser);
        
        // Cargar eSIMs del usuario
        const savedESims = localStorage.getItem('userESims');
        if (savedESims) {
          setUserESims(JSON.parse(savedESims));
        }
      } else {
        router.push('/auth/login');
      }
    } else {
      router.push('/auth/login');
    }
    setLoading(false);

    // Verificar si hay un parámetro de tab en la URL
    const urlParams = new URLSearchParams(window.location.search);
    const tabParam = urlParams.get('tab');
    if (tabParam && ['overview', 'esims', 'profile'].includes(tabParam)) {
      setActiveTab(tabParam as 'overview' | 'esims' | 'profile');
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Se está redirigiendo
  }

  // Combinar eSIMs predeterminadas con las compradas por el usuario
  const defaultESims = [
    {
      id: 999,
      name: 'Europa 10GB',
      country: 'España',
      dataUsed: 3.2,
      dataTotal: 10,
      daysLeft: 15,
      status: 'active',
      purchaseDate: '2024-08-01',
      price: 45
    },
    {
      id: 998,
      name: 'USA 5GB',
      country: 'Estados Unidos',
      dataUsed: 5,
      dataTotal: 5,
      daysLeft: 0,
      status: 'expired',
      purchaseDate: '2024-07-15',
      price: 35
    }
  ];

  const myESims = [...userESims, ...defaultESims];

  const recentActivity = [
    { id: 1, action: 'eSIM activada', description: 'Europa 10GB - Madrid, España', date: '2024-08-10', type: 'activation' },
    { id: 2, action: 'Compra realizada', description: 'Europa 10GB - $45 USD', date: '2024-08-10', type: 'purchase' },
    { id: 3, action: 'eSIM vencida', description: 'USA 5GB - Nueva York, USA', date: '2024-08-05', type: 'expiration' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Navigation */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold text-indigo-600">
                Hablaris eSIM
              </Link>
            </div>
            
            {/* Navigation Menu */}
            <nav className="hidden md:flex space-x-8">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-3 py-2 text-sm font-medium ${
                  activeTab === 'overview' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => setActiveTab('esims')}
                className={`px-3 py-2 text-sm font-medium ${
                  activeTab === 'esims' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Mis eSIMs
              </button>
              <button
                onClick={() => setActiveTab('profile')}
                className={`px-3 py-2 text-sm font-medium ${
                  activeTab === 'profile' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Perfil
              </button>
              <Link
                href="/shop"
                className="px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-700"
              >
                Tienda
              </Link>
            </nav>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-semibold">{user?.name?.charAt(0) || 'U'}</span>
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-gray-900">{user?.name || 'Usuario'}</p>
                  <p className="text-xs text-gray-500">{user?.email || 'email@example.com'}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="text-gray-500 hover:text-gray-700 text-sm"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Welcome Section */}
            <div className="bg-white rounded-lg shadow p-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                ¡Bienvenido, {user?.name || 'Usuario'}!
              </h1>
              <p className="text-gray-600">
                Gestiona tus eSIMs y mantente conectado en todo el mundo.
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-md bg-indigo-100">
                    <svg className="w-6 h-6 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">eSIMs Activas</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {myESims.filter(esim => esim.status === 'active').length}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-md bg-green-100">
                    <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Datos Disponibles</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {myESims.reduce((total, esim) => total + (esim.dataTotal - esim.dataUsed), 0).toFixed(1)} GB
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-md bg-yellow-100">
                    <svg className="w-6 h-6 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Próximo a Vencer</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {Math.min(...myESims.filter(esim => esim.status === 'active').map(esim => esim.daysLeft))} días
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Actividad Reciente</h2>
              </div>
              <div className="divide-y divide-gray-200">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className={`w-2 h-2 rounded-full mr-3 ${
                          activity.type === 'activation' ? 'bg-green-400' :
                          activity.type === 'purchase' ? 'bg-blue-400' : 'bg-red-400'
                        }`}></div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                          <p className="text-sm text-gray-500">{activity.description}</p>
                        </div>
                      </div>
                      <span className="text-sm text-gray-500">{activity.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'esims' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Mis eSIMs</h2>
              
              <div className="grid gap-6">
                {myESims.map((esim) => (
                  <div key={esim.id} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{esim.name}</h3>
                        <p className="text-sm text-gray-500">{esim.country}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        esim.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {esim.status === 'active' ? 'Activa' : 'Vencida'}
                      </span>
                    </div>

                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Datos utilizados</span>
                        <span>{esim.dataUsed}GB / {esim.dataTotal}GB</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-indigo-600 h-2 rounded-full" 
                          style={{ width: `${(esim.dataUsed / esim.dataTotal) * 100}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="text-sm text-gray-600">
                      <p>Días restantes: {esim.daysLeft}</p>
                    </div>

                    <div className="mt-4 space-y-2">
                      <button className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition duration-200">
                        Ver Detalles
                      </button>
                      {esim.status === 'active' && (
                        <button className="w-full border border-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-50 transition duration-200">
                          Gestionar Datos
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 text-center">
                <Link 
                  href="/shop"
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Comprar Nueva eSIM
                </Link>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Mi Perfil</h2>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Información Personal</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Nombre</label>
                      <input 
                        type="text" 
                        value={user?.name || ''} 
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-50"
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Email</label>
                      <input 
                        type="email" 
                        value={user?.email || ''} 
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-50"
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Teléfono</label>
                      <input 
                        type="tel" 
                        value={user?.phone || 'No especificado'} 
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-50"
                        readOnly
                      />
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <button className="bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition duration-200">
                      Editar Perfil
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Preferencias</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Idioma</label>
                      <select className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2">
                        <option>Español</option>
                        <option>English</option>
                        <option>Français</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Moneda</label>
                      <select className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2">
                        <option>USD - Dólar Americano</option>
                        <option>EUR - Euro</option>
                        <option>GBP - Libra Esterlina</option>
                      </select>
                    </div>
                    <div className="flex items-center">
                      <input 
                        type="checkbox" 
                        id="notifications" 
                        className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                      />
                      <label htmlFor="notifications" className="ml-2 text-sm text-gray-700">
                        Recibir notificaciones por email
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input 
                        type="checkbox" 
                        id="marketing" 
                        className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                      />
                      <label htmlFor="marketing" className="ml-2 text-sm text-gray-700">
                        Recibir ofertas promocionales
                      </label>
                    </div>
                  </div>

                  <div className="mt-6">
                    <button className="bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition duration-200">
                      Guardar Preferencias
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Configuración de Cuenta</h3>
                <div className="space-y-2">
                  <button className="text-indigo-600 hover:text-indigo-800 text-sm">
                    Cambiar contraseña
                  </button>
                  <br />
                  <button className="text-red-600 hover:text-red-800 text-sm">
                    Eliminar cuenta
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
