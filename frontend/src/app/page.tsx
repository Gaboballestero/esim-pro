'use client';

import Link from 'next/link';

export default function HomePage() {
  const popularDestinations = [
    { name: 'Europa', countries: '35 países', price: 'Desde $25', emoji: '🇪🇺', color: 'from-blue-500 to-purple-600' },
    { name: 'Estados Unidos', countries: 'Costa a costa', price: 'Desde $35', emoji: '🇺🇸', color: 'from-red-500 to-blue-600' },
    { name: 'Asia', countries: '20 países', price: 'Desde $45', emoji: '🌏', color: 'from-green-500 to-teal-600' },
    { name: 'Global', countries: '120+ países', price: 'Desde $75', emoji: '🌍', color: 'from-purple-500 to-pink-600' }
  ];

  const features = [
    { 
      icon: '⚡', 
      title: 'Activación Instantánea',
      description: 'Recibe tu eSIM por email y actívala en segundos con código QR'
    },
    {
      icon: '💰',
      title: 'Ahorra hasta 90%',
      description: 'Precios mucho más baratos que el roaming de tu operadora'
    },
    {
      icon: '🌍',
      title: 'Cobertura Mundial',
      description: 'Más de 120 países con las mejores redes locales'
    },
    {
      icon: '📱',
      title: 'Sin Cambio de SIM',
      description: 'Mantén tu número mientras usas datos de la eSIM'
    }
  ];

  const testimonials = [
    {
      name: 'María González',
      country: '🇪🇸 España',
      text: 'Increíble! Me conecté al llegar a París sin complicaciones. Ahorré más de €100 comparado con mi operadora.',
      rating: 5
    },
    {
      name: 'Carlos Rodríguez',
      country: '🇲🇽 México', 
      text: 'Perfecto para mi viaje de negocios por Europa. Funcionó en todos los países que visité.',
      rating: 5
    },
    {
      name: 'Ana Martínez',
      country: '🇦🇷 Argentina',
      text: 'Lo mejor para mis vacaciones en Japón. Internet rápido y sin sorpresas en la factura.',
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm fixed top-0 w-full z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center mr-3">
                <span className="text-white font-bold text-lg">H</span>
              </div>
              <span className="text-2xl font-bold text-gray-900">Hablaris</span>
            </div>
            
            <nav className="hidden md:flex space-x-8">
              <a href="#destinos" className="text-gray-600 hover:text-indigo-600 transition-colors">Destinos</a>
              <a href="#como-funciona" className="text-gray-600 hover:text-indigo-600 transition-colors">¿Cómo funciona?</a>
              <a href="#precios" className="text-gray-600 hover:text-indigo-600 transition-colors">Precios</a>
              <a href="#testimonios" className="text-gray-600 hover:text-indigo-600 transition-colors">Testimonios</a>
            </nav>

            <div className="flex items-center space-x-4">
              <Link 
                href="/auth/login"
                className="text-gray-600 hover:text-indigo-600 font-medium transition-colors"
              >
                Iniciar Sesión
              </Link>
              <Link 
                href="/auth/register"
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
              >
                Registrarse
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-20 pb-16 bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
                Viaja 
                <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"> conectado</span>
                <br />sin límites
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                eSIMs instantáneas para más de 120 países. Internet rápido, precios justos, activación en segundos.
                <span className="font-semibold text-indigo-600"> ¡Olvídate del roaming caro!</span>
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Link 
                  href="/shop"
                  className="bg-indigo-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-indigo-700 transition-all transform hover:scale-105 shadow-lg hover:shadow-xl text-center"
                >
                  🚀 Explorar Planes
                </Link>
                <button className="border-2 border-indigo-600 text-indigo-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-indigo-50 transition-colors">
                  ▶️ Ver Demo
                </button>
              </div>

              <div className="flex items-center space-x-6 text-sm text-gray-500">
                <div className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Activación instantánea
                </div>
                <div className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Sin cambio de SIM
                </div>
                <div className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Soporte 24/7
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-300">
                <div className="text-center">
                  <div className="text-6xl mb-4">📱</div>
                  <h3 className="text-2xl font-bold mb-4">¡Tu próximo viaje empieza aquí!</h3>
                  <div className="bg-white/20 rounded-lg p-4 mb-4">
                    <div className="text-3xl font-bold">120+</div>
                    <div className="text-sm opacity-90">Países disponibles</div>
                  </div>
                  <div className="text-sm opacity-90">
                    Más de 1 millón de viajeros confían en nosotros
                  </div>
                </div>
              </div>
              
              {/* Floating elements */}
              <div className="absolute -top-4 -left-4 bg-yellow-400 text-black px-3 py-1 rounded-full text-sm font-bold animate-bounce">
                ¡Nuevo!
              </div>
              <div className="absolute -bottom-4 -right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                Desde $25
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-indigo-600 mb-2">120+</div>
              <div className="text-gray-600">Países</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-indigo-600 mb-2">1M+</div>
              <div className="text-gray-600">Usuarios Satisfechos</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-indigo-600 mb-2">90%</div>
              <div className="text-gray-600">Ahorro vs Roaming</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-indigo-600 mb-2">4.9⭐</div>
              <div className="text-gray-600">Valoración</div>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Destinations */}
      <section id="destinos" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Destinos Populares
            </h2>
            <p className="text-xl text-gray-600">
              Los destinos favoritos de nuestros viajeros
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {popularDestinations.map((destination, index) => (
              <Link key={index} href="/shop" className="group cursor-pointer">
                <div className={`bg-gradient-to-br ${destination.color} rounded-2xl p-6 text-white transform transition-all duration-300 group-hover:scale-105 group-hover:shadow-2xl`}>
                  <div className="text-4xl mb-4">{destination.emoji}</div>
                  <h3 className="text-2xl font-bold mb-2">{destination.name}</h3>
                  <p className="text-white/80 mb-3">{destination.countries}</p>
                  <div className="text-2xl font-bold">{destination.price}</div>
                  <div className="w-full mt-4 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg font-medium transition-colors text-center">
                    Ver Planes →
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="como-funciona" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              ¿Cómo funciona?
            </h2>
            <p className="text-xl text-gray-600">
              Tres simples pasos para estar conectado
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <span className="text-3xl text-white">🛒</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">1. Compra tu eSIM</h3>
              <p className="text-gray-600">
                Elige tu destino y plan de datos. Pago seguro con tarjeta o PayPal.
              </p>
            </div>

            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <span className="text-3xl text-white">📧</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">2. Recibe el QR</h3>
              <p className="text-gray-600">
                Recibirás tu eSIM con código QR por email al instante.
              </p>
            </div>

            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <span className="text-3xl text-white">🌍</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">3. ¡Conéctate!</h3>
              <p className="text-gray-600">
                Escanea el QR y disfruta de internet rápido en tu destino.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              ¿Por qué elegir Hablaris?
            </h2>
            <p className="text-xl text-gray-600">
              La mejor experiencia de conectividad para viajeros
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonios" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Lo que dicen nuestros viajeros
            </h2>
            <p className="text-xl text-gray-600">
              Miles de personas ya confían en nosotros
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-gray-50 rounded-xl p-6 hover:bg-gray-100 transition-colors">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <span key={i} className="text-yellow-400 text-xl">⭐</span>
                  ))}
                </div>
                <p className="text-gray-700 mb-4 italic">"{testimonial.text}"</p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center mr-3">
                    <span className="text-white font-bold">{testimonial.name.charAt(0)}</span>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-600">{testimonial.country}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-indigo-600 to-purple-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            ¿Listo para tu próxima aventura?
          </h2>
          <p className="text-xl text-indigo-100 mb-8">
            Únete a más de 1 millón de viajeros que ya disfrutan de internet sin límites
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/shop"
              className="bg-white text-indigo-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition-colors transform hover:scale-105"
            >
              🚀 Comprar eSIM Ahora
            </Link>
            <Link 
              href="/auth/register"
              className="border-2 border-white text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-white/10 transition-colors"
            >
              📝 Crear Cuenta Gratis
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center mr-2">
                  <span className="text-white font-bold">H</span>
                </div>
                <span className="text-xl font-bold">Hablaris</span>
              </div>
              <p className="text-gray-400">
                Conectividad global sin fronteras para viajeros inteligentes.
              </p>
            </div>
            
            <div>
              <h3 className="font-bold mb-4">Destinos</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="/shop" className="hover:text-white">Europa</a></li>
                <li><a href="/shop" className="hover:text-white">Estados Unidos</a></li>
                <li><a href="/shop" className="hover:text-white">Asia</a></li>
                <li><a href="/shop" className="hover:text-white">Global</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-bold mb-4">Soporte</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Centro de Ayuda</a></li>
                <li><a href="#" className="hover:text-white">Contacto</a></li>
                <li><a href="#" className="hover:text-white">Dispositivos Compatibles</a></li>
                <li><a href="#" className="hover:text-white">Guías</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-bold mb-4">Empresa</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Sobre Nosotros</a></li>
                <li><a href="#" className="hover:text-white">Términos</a></li>
                <li><a href="#" className="hover:text-white">Privacidad</a></li>
                <li><a href="#" className="hover:text-white">Blog</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 mt-8 text-center text-gray-400">
            <p>&copy; 2025 Hablaris. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
