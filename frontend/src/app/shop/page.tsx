'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface DataPlan {
  id: number;
  name: string;
  region: string;
  countries: string[];
  data: string;
  duration: string;
  price: number;
  originalPrice?: number;
  features: string[];
  popular: boolean;
  bestValue: boolean;
  coverage: string;
  speed: string;
  image: string;
  rating: number;
  reviews: number;
}

export default function ShopPage() {
  const router = useRouter();
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [selectedDuration, setSelectedDuration] = useState('all');
  const [selectedData, setSelectedData] = useState('all');
  const [sortBy, setSortBy] = useState('popular');
  const [showFilters, setShowFilters] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [purchaseLoading, setPurchaseLoading] = useState<number | null>(null);
  const [showLoginSuccess, setShowLoginSuccess] = useState(false);

  useEffect(() => {
    // Verificar si el usuario está autenticado
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      if (parsedUser.isAuthenticated) {
        setUser(parsedUser);
      }
    }

    // Verificar si viene de un login exitoso
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('loginSuccess') === 'true') {
      setShowLoginSuccess(true);
      // Limpiar el parámetro de la URL
      window.history.replaceState({}, '', '/shop');
      // Ocultar el mensaje después de 5 segundos
      setTimeout(() => setShowLoginSuccess(false), 5000);
    }
  }, []);

  const handlePurchase = async (plan: DataPlan) => {
    // Verificar si el usuario está logueado
    if (!user) {
      // Guardar el plan seleccionado para después del login
      localStorage.setItem('pendingPurchase', JSON.stringify(plan));
      router.push('/auth/login?redirect=shop');
      return;
    }

    setPurchaseLoading(plan.id);

    try {
      // Simular proceso de compra
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Generar nueva eSIM
      const newESim = {
        id: Date.now(),
        name: plan.name,
        country: plan.countries[0],
        dataUsed: 0,
        dataTotal: plan.data === 'Ilimitado' ? 999 : parseInt(plan.data),
        daysLeft: parseInt(plan.duration),
        status: 'active',
        purchaseDate: new Date().toISOString().split('T')[0],
        price: plan.price,
        qrCode: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
        activationCode: `ESIM-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        coverage: plan.coverage,
        speed: plan.speed
      };

      // Obtener eSIMs existentes del usuario
      const existingESims = JSON.parse(localStorage.getItem('userESims') || '[]');
      const updatedESims = [...existingESims, newESim];
      
      // Guardar en localStorage
      localStorage.setItem('userESims', JSON.stringify(updatedESims));

      // Mostrar mensaje de éxito
      alert(`¡Compra exitosa! 🎉\n\nTu eSIM "${plan.name}" ha sido activada.\nCódigo de activación: ${newESim.activationCode}\n\nPuedes gestionar tu eSIM desde el Dashboard.`);

      // Redirigir al dashboard
      router.push('/dashboard?tab=esims');

    } catch (error) {
      alert('Error en la compra. Por favor, inténtalo de nuevo.');
    } finally {
      setPurchaseLoading(null);
    }
  };

  const regions = [
    { value: 'all', label: 'Todas las regiones', icon: '🌍' },
    { value: 'europe', label: 'Europa', icon: '🇪🇺' },
    { value: 'americas', label: 'Américas', icon: '🌎' },
    { value: 'asia', label: 'Asia', icon: '🌏' },
    { value: 'africa', label: 'África', icon: '🌍' },
    { value: 'oceania', label: 'Oceanía', icon: '🇦🇺' },
    { value: 'global', label: 'Global', icon: '🌐' }
  ];

  const durations = [
    { value: 'all', label: 'Todas las duraciones' },
    { value: '7', label: '7 días' },
    { value: '15', label: '15 días' },
    { value: '30', label: '30 días' },
    { value: '60', label: '60 días' },
    { value: '90', label: '90 días' }
  ];

  const dataOptions = [
    { value: 'all', label: 'Todos los datos' },
    { value: '1', label: '1-5 GB' },
    { value: '5', label: '5-10 GB' },
    { value: '10', label: '10-20 GB' },
    { value: '20', label: '20+ GB' },
    { value: 'unlimited', label: 'Ilimitado' }
  ];

  const sortOptions = [
    { value: 'popular', label: 'Más populares' },
    { value: 'price-low', label: 'Precio: menor a mayor' },
    { value: 'price-high', label: 'Precio: mayor a menor' },
    { value: 'data-high', label: 'Más datos' },
    { value: 'duration-long', label: 'Mayor duración' }
  ];

  const dataPlans: DataPlan[] = [
    {
      id: 1,
      name: 'Europa Esencial',
      region: 'europe',
      countries: ['España', 'Francia', 'Italia', 'Alemania', 'Reino Unido', '+25 más'],
      data: '10 GB',
      duration: '30 días',
      price: 45,
      originalPrice: 60,
      features: ['4G/5G', 'Hotspot incluido', 'Activación instantánea', 'Soporte 24/7'],
      popular: true,
      bestValue: false,
      coverage: '30 países',
      speed: '4G/5G',
      image: '🇪🇺',
      rating: 4.9,
      reviews: 2847
    },
    {
      id: 2,
      name: 'Global Premium',
      region: 'global',
      countries: ['USA', 'España', 'Francia', 'Japón', 'Australia', '+100 más'],
      data: '20 GB',
      duration: '30 días',
      price: 89,
      originalPrice: 120,
      features: ['5G Ultra', 'Hotspot ilimitado', 'Llamadas incluidas', 'Soporte VIP'],
      popular: false,
      bestValue: true,
      coverage: '120+ países',
      speed: '5G',
      image: '🌐',
      rating: 4.8,
      reviews: 1205
    },
    {
      id: 3,
      name: 'Asia Explorer',
      region: 'asia',
      countries: ['Japón', 'Corea del Sur', 'Tailandia', 'Singapur', 'China', '+15 más'],
      data: '15 GB',
      duration: '15 días',
      price: 52,
      features: ['4G/5G', 'Hotspot incluido', 'Sin restricciones', 'App móvil'],
      popular: false,
      bestValue: false,
      coverage: '20 países',
      speed: '4G/5G',
      image: '🌏',
      rating: 4.7,
      reviews: 892
    },
    {
      id: 4,
      name: 'Américas Total',
      region: 'americas',
      countries: ['USA', 'Canadá', 'México', 'Brasil', 'Argentina', '+20 más'],
      data: '25 GB',
      duration: '30 días',
      price: 67,
      originalPrice: 85,
      features: ['5G', 'Llamadas ilimitadas', 'Hotspot', 'Roaming gratis'],
      popular: true,
      bestValue: false,
      coverage: '25 países',
      speed: '5G',
      image: '🌎',
      rating: 4.9,
      reviews: 1563
    },
    {
      id: 5,
      name: 'Europa Express',
      region: 'europe',
      countries: ['España', 'Francia', 'Italia', 'Alemania', '+15 más'],
      data: '5 GB',
      duration: '7 días',
      price: 19,
      features: ['4G', 'Hotspot', 'Activación rápida', 'Soporte chat'],
      popular: false,
      bestValue: false,
      coverage: '19 países',
      speed: '4G',
      image: '🇪🇺',
      rating: 4.6,
      reviews: 743
    },
    {
      id: 6,
      name: 'Global Business',
      region: 'global',
      countries: ['Todos los países disponibles'],
      data: 'Ilimitado',
      duration: '90 días',
      price: 199,
      originalPrice: 299,
      features: ['5G Premium', 'Hotspot ilimitado', 'Llamadas globales', 'Soporte ejecutivo'],
      popular: false,
      bestValue: true,
      coverage: '180+ países',
      speed: '5G Premium',
      image: '🌐',
      rating: 4.9,
      reviews: 421
    }
  ];

  const filteredPlans = dataPlans.filter(plan => {
    const regionMatch = selectedRegion === 'all' || plan.region === selectedRegion;
    const durationMatch = selectedDuration === 'all' || plan.duration.includes(selectedDuration);
    const dataMatch = selectedData === 'all' || 
      (selectedData === 'unlimited' && plan.data === 'Ilimitado') ||
      (selectedData === '1' && parseInt(plan.data) <= 5) ||
      (selectedData === '5' && parseInt(plan.data) > 5 && parseInt(plan.data) <= 10) ||
      (selectedData === '10' && parseInt(plan.data) > 10 && parseInt(plan.data) <= 20) ||
      (selectedData === '20' && parseInt(plan.data) > 20);
    
    return regionMatch && durationMatch && dataMatch;
  });

  const sortedPlans = [...filteredPlans].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'data-high':
        return (b.data === 'Ilimitado' ? 999 : parseInt(b.data)) - (a.data === 'Ilimitado' ? 999 : parseInt(a.data));
      case 'duration-long':
        return parseInt(b.duration) - parseInt(a.duration);
      default:
        return b.popular ? 1 : -1;
    }
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Success Message */}
      {showLoginSuccess && (
        <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg animate-pulse">
          <div className="flex items-center space-x-2">
            <span>✅</span>
            <span>¡Bienvenido! Ya puedes comprar eSIMs.</span>
            <button 
              onClick={() => setShowLoginSuccess(false)}
              className="ml-2 text-white hover:text-gray-200"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-2xl font-bold text-indigo-600">
                Hablaris eSIM
              </Link>
              <nav className="hidden md:flex space-x-8">
                <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">Dashboard</Link>
                <span className="text-indigo-600 font-medium">Tienda</span>
              </nav>
            </div>
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-gray-700">Hola, {user.name}</span>
                <Link href="/dashboard" className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition duration-200">
                  Mi Cuenta
                </Link>
              </div>
            ) : (
              <Link href="/auth/login" className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition duration-200">
                Iniciar Sesión
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Conecta con el mundo
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-300">
                sin límites
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-indigo-100 mb-8 max-w-3xl mx-auto">
              eSIMs instantáneas para más de 180 países. Activación en segundos, conexión garantizada.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <div className="flex items-center space-x-2 bg-white/20 rounded-full px-4 py-2">
                <span>⚡</span>
                <span>Activación instantánea</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/20 rounded-full px-4 py-2">
                <span>🌐</span>
                <span>180+ países</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/20 rounded-full px-4 py-2">
                <span>🔒</span>
                <span>100% seguro</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/20 rounded-full px-4 py-2">
                <span>📱</span>
                <span>Compatible con todos los dispositivos</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
            {/* Mobile Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2"
            >
              <span>🔍</span>
              <span>Filtros</span>
            </button>

            {/* Desktop Filters */}
            <div className={`${showFilters ? 'block' : 'hidden'} lg:block`}>
              <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-6">
                {/* Region Filter */}
                <div className="min-w-[200px]">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Región</label>
                  <select
                    value={selectedRegion}
                    onChange={(e) => setSelectedRegion(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    {regions.map(region => (
                      <option key={region.value} value={region.value}>
                        {region.icon} {region.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Duration Filter */}
                <div className="min-w-[180px]">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duración</label>
                  <select
                    value={selectedDuration}
                    onChange={(e) => setSelectedDuration(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    {durations.map(duration => (
                      <option key={duration.value} value={duration.value}>
                        {duration.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Data Filter */}
                <div className="min-w-[160px]">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Datos</label>
                  <select
                    value={selectedData}
                    onChange={(e) => setSelectedData(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    {dataOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Sort Options */}
            <div className="min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">Ordenar por</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between">
          <p className="text-gray-600">
            Mostrando {sortedPlans.length} de {dataPlans.length} planes disponibles
          </p>
          {(selectedRegion !== 'all' || selectedDuration !== 'all' || selectedData !== 'all') && (
            <button
              onClick={() => {
                setSelectedRegion('all');
                setSelectedDuration('all');
                setSelectedData('all');
              }}
              className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      </div>

      {/* Plans Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedPlans.map((plan) => (
            <div
              key={plan.id}
              className={`relative bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden ${
                plan.bestValue ? 'ring-2 ring-indigo-500' : ''
              }`}
            >
              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col space-y-2 z-10">
                {plan.popular && (
                  <span className="bg-gradient-to-r from-pink-500 to-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                    🔥 POPULAR
                  </span>
                )}
                {plan.bestValue && (
                  <span className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                    💎 MEJOR VALOR
                  </span>
                )}
              </div>

              {/* Card Header */}
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white p-6">
                <div className="text-center">
                  <div className="text-4xl mb-2">{plan.image}</div>
                  <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                  <p className="text-indigo-100 text-sm mb-4">{plan.coverage}</p>
                  
                  {/* Rating */}
                  <div className="flex items-center justify-center space-x-1 mb-4">
                    <div className="flex text-yellow-300">
                      {'★'.repeat(Math.floor(plan.rating))}
                      {'☆'.repeat(5 - Math.floor(plan.rating))}
                    </div>
                    <span className="text-indigo-100 text-sm">
                      {plan.rating} ({plan.reviews} reseñas)
                    </span>
                  </div>

                  {/* Price */}
                  <div className="text-center">
                    <div className="flex items-center justify-center space-x-2">
                      {plan.originalPrice && (
                        <span className="text-indigo-200 line-through text-lg">
                          ${plan.originalPrice}
                        </span>
                      )}
                      <span className="text-3xl font-bold">${plan.price}</span>
                    </div>
                    <p className="text-indigo-100 text-sm">por {plan.duration}</p>
                  </div>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6">
                {/* Data and Duration */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-indigo-600">{plan.data}</div>
                    <div className="text-sm text-gray-600">Datos</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-indigo-600">{plan.duration}</div>
                    <div className="text-sm text-gray-600">Duración</div>
                  </div>
                </div>

                {/* Countries */}
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-2">Países incluidos:</h4>
                  <div className="flex flex-wrap gap-1">
                    {plan.countries.map((country, index) => (
                      <span
                        key={index}
                        className="inline-block bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full"
                      >
                        {country}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Features */}
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Características:</h4>
                  <ul className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center space-x-2 text-sm">
                        <span className="text-green-500">✓</span>
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* CTA Button */}
                <button
                  onClick={() => handlePurchase(plan)}
                  disabled={purchaseLoading === plan.id}
                  className={`w-full py-3 px-6 rounded-xl font-semibold transition-all duration-200 shadow-lg ${
                    purchaseLoading === plan.id
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 transform hover:scale-105'
                  }`}
                >
                  {purchaseLoading === plan.id ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Procesando...</span>
                    </div>
                  ) : (
                    `Comprar ahora - $${plan.price}`
                  )}
                </button>

                {/* Additional Info */}
                <p className="text-center text-xs text-gray-500 mt-3">
                  Activación instantánea • Sin contratos • Cancelación gratuita
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* No Results */}
        {sortedPlans.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">😔</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No se encontraron planes
            </h3>
            <p className="text-gray-600 mb-6">
              Intenta ajustar tus filtros para ver más opciones
            </p>
            <button
              onClick={() => {
                setSelectedRegion('all');
                setSelectedDuration('all');
                setSelectedData('all');
              }}
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition duration-200"
            >
              Ver todos los planes
            </button>
          </div>
        )}
      </div>

      {/* Trust Section */}
      <div className="bg-white border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Más de 50,000 viajeros confían en nosotros
            </h2>
            <p className="text-xl text-gray-600">
              Únete a la comunidad de viajeros inteligentes
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl mb-4">⚡</div>
              <h3 className="font-semibold mb-2">Activación instantánea</h3>
              <p className="text-gray-600">Tu eSIM estará lista en menos de 2 minutos</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-4">🌐</div>
              <h3 className="font-semibold mb-2">Cobertura global</h3>
              <p className="text-gray-600">Más de 180 países y regiones disponibles</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-4">💰</div>
              <h3 className="font-semibold mb-2">Sin sorpresas</h3>
              <p className="text-gray-600">Precios fijos, sin tarifas ocultas</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-4">🔒</div>
              <h3 className="font-semibold mb-2">100% seguro</h3>
              <p className="text-gray-600">Pago seguro y datos protegidos</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
