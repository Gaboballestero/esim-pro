from django.http import JsonResponse, HttpResponse
from django.shortcuts import render

def home(request):
    """Vista principal de la landing page"""
    html_content = """<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Hablaris eSIM - La Revolución de la Conectividad Global | Lanzamiento Septiembre 2025</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-15px); }
        }
        @keyframes sparkle {
            0%, 100% { opacity: 1; transform: scale(1) rotate(0deg); }
            50% { opacity: 0.3; transform: scale(1.3) rotate(180deg); }
        }
        @keyframes pulse-glow {
            0%, 100% { box-shadow: 0 0 30px rgba(59, 130, 246, 0.5), inset 0 0 30px rgba(59, 130, 246, 0.1); }
            50% { box-shadow: 0 0 60px rgba(147, 51, 234, 0.8), inset 0 0 40px rgba(147, 51, 234, 0.2); }
        }
        @keyframes slideInUp {
            from {
                opacity: 0;
                transform: translateY(50px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        .float { animation: float 4s ease-in-out infinite; }
        .sparkle { animation: sparkle 1.8s ease-in-out infinite; }
        .pulse-glow { animation: pulse-glow 3s ease-in-out infinite; }
        .slide-up { animation: slideInUp 1s ease-out; }
        .gradient-text { 
            background: linear-gradient(45deg, #fbbf24, #f59e0b, #ec4899, #8b5cf6, #3b82f6);
            background-size: 400% 400%;
            -webkit-background-clip: text;
            background-clip: text;
            -webkit-text-fill-color: transparent;
            animation: gradient-shift 3s ease-in-out infinite;
        }
        @keyframes gradient-shift {
            0%, 100% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
        }
        html {
            scroll-behavior: smooth;
        }
        .scroll-section {
            scroll-margin-top: 2rem;
        }
    </style>
</head>
<body class="bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 relative overflow-x-hidden">
    <!-- Animated Background -->
    <div class="fixed inset-0 z-0">
        <div class="absolute top-20 left-20 w-72 h-72 bg-blue-500/20 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
        <div class="absolute top-40 right-32 w-72 h-72 bg-purple-500/20 rounded-full mix-blend-multiply filter blur-xl animate-pulse" style="animation-delay: 1s;"></div>
        <div class="absolute bottom-32 left-40 w-72 h-72 bg-pink-500/20 rounded-full mix-blend-multiply filter blur-xl animate-pulse" style="animation-delay: 2s;"></div>
    </div>

    <!-- Sparkles -->
    <div class="fixed inset-0 z-0 pointer-events-none">
        <div class="sparkle absolute top-1/4 left-1/4 w-3 h-3 bg-gradient-to-r from-yellow-300 to-yellow-500 rounded-full shadow-lg"></div>
        <div class="sparkle absolute top-1/3 right-1/3 w-2 h-2 bg-gradient-to-r from-blue-300 to-blue-500 rounded-full shadow-lg" style="animation-delay: 0.5s;"></div>
        <div class="sparkle absolute bottom-1/3 left-1/5 w-2.5 h-2.5 bg-gradient-to-r from-purple-300 to-purple-500 rounded-full shadow-lg" style="animation-delay: 1s;"></div>
        <div class="sparkle absolute top-1/2 right-1/4 w-2 h-2 bg-gradient-to-r from-pink-300 to-pink-500 rounded-full shadow-lg" style="animation-delay: 1.5s;"></div>
        <div class="sparkle absolute bottom-1/4 right-1/2 w-3 h-3 bg-gradient-to-r from-cyan-300 to-cyan-500 rounded-full shadow-lg" style="animation-delay: 2s;"></div>
    </div>

    <!-- Hero Section -->
    <section class="relative z-10 min-h-screen flex items-center justify-center px-4 scroll-section" id="hero">
        <div class="text-center max-w-5xl mx-auto slide-up">
            <!-- Rocket Animation -->
            <div class="float mb-8">
                <div class="text-9xl md:text-[12rem] filter drop-shadow-2xl">🚀</div>
            </div>

            <!-- Main Title -->
            <h1 class="text-6xl md:text-8xl font-black text-white mb-6 leading-tight drop-shadow-2xl">
                <span class="gradient-text">HABLARIS</span>
                <br>¡Casi Listos!
            </h1>

            <!-- Exciting Subtitle -->
            <div class="text-2xl md:text-4xl text-blue-200 mb-8 font-light drop-shadow-lg">
                <div class="mb-2">🌟 La revolución eSIM que</div>
                <div class="font-bold text-yellow-300 text-3xl md:text-5xl">
                    cambiará el mundo
                </div>
            </div>

            <!-- Launch Countdown Box -->
            <div class="bg-gradient-to-r from-orange-500/20 to-red-600/20 backdrop-blur-lg rounded-3xl p-10 mb-12 border border-orange-400/40 pulse-glow max-w-2xl mx-auto">
                <div class="text-xl text-gray-200 mb-4 flex items-center justify-center">
                    🎯 <span class="ml-2 font-bold">LANZAMIENTO OFICIAL</span>
                </div>
                <div class="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-orange-400 to-pink-500 mb-4 drop-shadow-lg">
                    SEPTIEMBRE 2025
                </div>
                <div class="text-lg text-orange-200 font-medium">
                    ¡Prepárate para la revolución eSIM más esperada del año!
                </div>
            </div>

            <!-- Main Call to Actions -->
            <div class="space-y-6 mb-12">
                <div class="text-xl text-yellow-300 font-bold mb-6">
                    🔥 ACCESO ANTICIPADO DISPONIBLE
                </div>
                
                <div class="flex flex-col md:flex-row gap-6 justify-center items-center">
                    <a href="/shop/" class="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-500 hover:via-purple-500 hover:to-pink-500 text-white px-12 py-5 rounded-full text-xl font-black transition-all duration-300 transform hover:scale-110 shadow-2xl hover:shadow-pink-500/50 border-2 border-white/20">
                        🛍️ VER TIENDA eSIM
                    </a>
                    
                    <a href="#newsletter" class="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-white px-12 py-5 rounded-full text-xl font-black transition-all duration-300 transform hover:scale-110 shadow-2xl">
                        📧 RECIBIR NOTICIAS
                    </a>
                </div>
            </div>

            <!-- Scroll indicator -->
            <div class="text-white/60 animate-bounce">
                <div class="text-3xl mb-2">⬇️</div>
                <div class="text-sm">Desliza para descubrir más</div>
            </div>
        </div>
    </section>

    <!-- Features Preview Section -->
    <section class="relative z-10 py-20 px-4 scroll-section" id="features">
        <div class="max-w-6xl mx-auto">
            <div class="text-center mb-16">
                <h2 class="text-5xl font-black text-white mb-6">
                    ¿Por qué elegir <span class="gradient-text">Hablaris</span>?
                </h2>
                <p class="text-xl text-blue-200">
                    La próxima generación de conectividad global te está esperando
                </p>
            </div>
            
            <div class="grid md:grid-cols-3 gap-8 mb-16">
                <div class="bg-gradient-to-br from-green-500/20 to-emerald-600/20 backdrop-blur-lg rounded-2xl p-8 border border-green-400/30 hover:from-green-400/30 hover:to-emerald-500/30 transition-all duration-500 transform hover:scale-105">
                    <div class="text-6xl mb-6">⚡</div>
                    <h3 class="text-2xl font-bold text-white mb-4">Activación Instantánea</h3>
                    <p class="text-gray-200 text-lg">Tu eSIM lista en menos de 2 minutos. Sin esperas, sin complicaciones, sin visitas a tiendas.</p>
                </div>
                
                <div class="bg-gradient-to-br from-purple-500/20 to-violet-600/20 backdrop-blur-lg rounded-2xl p-8 border border-purple-400/30 hover:from-purple-400/30 hover:to-violet-500/30 transition-all duration-500 transform hover:scale-105">
                    <div class="text-6xl mb-6">💰</div>
                    <h3 class="text-2xl font-bold text-white mb-4">Precios Increíbles</h3>
                    <p class="text-gray-200 text-lg">Hasta 90% menos que el roaming tradicional. La mejor relación precio-calidad del mercado.</p>
                </div>
                
                <div class="bg-gradient-to-br from-pink-500/20 to-rose-600/20 backdrop-blur-lg rounded-2xl p-8 border border-pink-400/30 hover:from-pink-400/30 hover:to-rose-500/30 transition-all duration-500 transform hover:scale-105">
                    <div class="text-6xl mb-6">🌍</div>
                    <h3 class="text-2xl font-bold text-white mb-4">Cobertura Global</h3>
                    <p class="text-gray-200 text-lg">185+ países con la mejor calidad de red 5G. Conectado en cualquier lugar del mundo.</p>
                </div>
            </div>

            <!-- Social Proof Stats -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-8">
                <div class="text-center bg-black/30 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                    <div class="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">750K+</div>
                    <div class="text-sm text-gray-300 font-medium">En Lista de Espera</div>
                </div>
                <div class="text-center bg-black/30 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                    <div class="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-500">4.9★</div>
                    <div class="text-sm text-gray-300 font-medium">Calificación Beta</div>
                </div>
                <div class="text-center bg-black/30 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                    <div class="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-500">185</div>
                    <div class="text-sm text-gray-300 font-medium">Países Confirmados</div>
                </div>
                <div class="text-center bg-black/30 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                    <div class="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">24/7</div>
                    <div class="text-sm text-gray-300 font-medium">Soporte VIP</div>
                </div>
            </div>
        </div>
    </section>

    <!-- Newsletter Section -->
    <section class="relative z-10 py-20 px-4 scroll-section" id="newsletter">
        <div class="max-w-4xl mx-auto text-center">
            <div class="bg-black/30 backdrop-blur-2xl p-12 rounded-3xl shadow-2xl border border-white/20">
                <div class="text-7xl mb-8">📧</div>
                <h2 class="text-4xl md:text-6xl font-bold text-white mb-6">
                    ¡No te pierdas el <span class="gradient-text">lanzamiento</span>!
                </h2>
                <p class="text-xl text-blue-200 mb-8">
                    Regístrate y sé el primero en conocer ofertas exclusivas,<br>
                    descuentos especiales y la fecha exacta de lanzamiento.
                </p>
                
                <!-- Newsletter Form -->
                <div class="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 mb-8">
                    <form class="space-y-6">
                        <div class="grid md:grid-cols-2 gap-4">
                            <input type="text" placeholder="Tu nombre completo" class="w-full px-6 py-4 rounded-xl bg-white/10 backdrop-blur-lg border border-white/20 text-white placeholder-gray-300 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/50 text-lg">
                            <input type="email" placeholder="Tu mejor email" class="w-full px-6 py-4 rounded-xl bg-white/10 backdrop-blur-lg border border-white/20 text-white placeholder-gray-300 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/50 text-lg">
                        </div>
                        <button type="submit" class="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-white px-16 py-5 rounded-full text-xl font-bold transition-all duration-300 transform hover:scale-105 shadow-2xl">
                            🔔 ¡QUIERO LAS NOTICIAS EXCLUSIVAS!
                        </button>
                    </form>
                    
                    <div class="mt-8 grid md:grid-cols-3 gap-4 text-sm text-gray-300">
                        <div class="flex items-center">
                            <span class="text-green-400 text-xl mr-2">✅</span>
                            Sin spam, solo noticias importantes
                        </div>
                        <div class="flex items-center">
                            <span class="text-green-400 text-xl mr-2">✅</span>
                            Ofertas exclusivas para suscriptores
                        </div>
                        <div class="flex items-center">
                            <span class="text-green-400 text-xl mr-2">✅</span>
                            Puedes cancelar cuando quieras
                        </div>
                    </div>
                </div>

                <!-- Special Offer for Early Birds -->
                <div class="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-2xl p-6 border border-yellow-400/40">
                    <div class="text-2xl font-bold text-white mb-2">
                        🎉 ¡OFERTA ESPECIAL DE PRE-LANZAMIENTO!
                    </div>
                    <div class="text-lg text-yellow-200">
                        Los primeros 1000 suscriptores obtendrán:<br>
                        <strong>50% de descuento de por vida + Activación gratuita</strong>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Footer -->
    <footer class="relative z-10 py-12 px-4">
        <div class="max-w-4xl mx-auto text-center">
            <div class="text-6xl mb-6">🚀</div>
            <h3 class="text-3xl font-bold text-white mb-4">
                El futuro de la conectividad global está por llegar
            </h3>
            <p class="text-xl text-blue-200 mb-8">
                Septiembre 2025 será recordado como el mes que cambió todo
            </p>
            <div class="flex justify-center space-x-6">
                <a href="/shop/" class="text-blue-400 hover:text-blue-300 text-lg font-semibold">Ver Tienda</a>
                <a href="#newsletter" class="text-yellow-400 hover:text-yellow-300 text-lg font-semibold">Suscribirse</a>
            </div>
        </div>
    </footer>

    <!-- Floating Emojis -->
    <div class="fixed top-20 left-10 text-4xl opacity-40 float pointer-events-none z-0" style="animation-delay: 1s;">📱</div>
    <div class="fixed top-40 right-20 text-3xl opacity-50 float pointer-events-none z-0" style="animation-delay: 2s;">🌐</div>
    <div class="fixed bottom-20 left-20 text-5xl opacity-30 float pointer-events-none z-0" style="animation-delay: 3s;">✈️</div>
    <div class="fixed bottom-40 right-10 text-4xl opacity-45 float pointer-events-none z-0" style="animation-delay: 0.5s;">🗺️</div>
    <div class="fixed top-60 left-1/2 text-3xl opacity-35 float pointer-events-none z-0" style="animation-delay: 2.5s;">🚀</div>
</body>
</html>"""
    return HttpResponse(html_content)

def shop(request):
    """Vista de la tienda eSIM"""
    html_content = """<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tienda eSIM - Hablaris | Acceso Anticipado</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-15px); }
        }
        @keyframes pulse-rainbow {
            0%, 100% { box-shadow: 0 0 40px rgba(59, 130, 246, 0.6); }
            33% { box-shadow: 0 0 40px rgba(147, 51, 234, 0.6); }
            66% { box-shadow: 0 0 40px rgba(236, 72, 153, 0.6); }
        }
        @keyframes sparkle {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.3; transform: scale(1.3); }
        }
        .float { animation: float 3s ease-in-out infinite; }
        .pulse-rainbow { animation: pulse-rainbow 2s ease-in-out infinite; }
        .sparkle { animation: sparkle 1.8s ease-in-out infinite; }
    </style>
</head>
<body class="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 relative overflow-hidden">
    <!-- Animated Background -->
    <div class="absolute inset-0">
        <div class="absolute top-20 left-20 w-72 h-72 bg-blue-500/20 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
        <div class="absolute top-40 right-32 w-72 h-72 bg-purple-500/20 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-1000"></div>
        <div class="absolute bottom-32 left-40 w-72 h-72 bg-pink-500/20 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-2000"></div>
    </div>

    <!-- Sparkles -->
    <div class="absolute inset-0 pointer-events-none">
        <div class="sparkle absolute top-1/4 left-1/4 w-3 h-3 bg-yellow-400 rounded-full"></div>
        <div class="sparkle absolute top-1/3 right-1/3 w-2 h-2 bg-blue-400 rounded-full delay-500"></div>
        <div class="sparkle absolute bottom-1/3 left-1/5 w-2.5 h-2.5 bg-purple-400 rounded-full delay-1000"></div>
        <div class="sparkle absolute top-1/2 right-1/4 w-2 h-2 bg-pink-400 rounded-full delay-1500"></div>
    </div>

    <div class="relative z-10 flex items-center justify-center min-h-screen px-4">
        <div class="text-center bg-black/20 backdrop-blur-2xl p-12 rounded-3xl shadow-2xl max-w-4xl mx-4 border border-white/20 pulse-rainbow">
            <!-- Floating Shop Icon -->
            <div class="float mb-8">
                <div class="text-8xl filter drop-shadow-2xl">🛍️</div>
            </div>
            
            <!-- Main Title -->
            <h1 class="text-5xl md:text-7xl font-black text-white mb-6 leading-tight">
                🔥 <span class="bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 bg-clip-text text-transparent">ACCESO ANTICIPADO</span>
            </h1>
            
            <!-- Subtitle -->
            <div class="text-2xl md:text-3xl text-blue-200 mb-8">
                ¡La tienda eSIM más esperada del año!
            </div>
            
            <!-- Status Box -->
            <div class="bg-gradient-to-r from-green-500/20 to-emerald-600/20 backdrop-blur-lg rounded-2xl p-8 mb-12 border border-green-400/40">
                <div class="text-6xl mb-4">🚀</div>
                <h2 class="text-3xl md:text-4xl font-bold text-white mb-4">
                    ¡Lanzamiento en Progreso!
                </h2>
                <p class="text-xl text-green-200 mb-6">
                    Estamos activando la tienda más revolucionaria de eSIMs.<br>
                    <span class="font-bold text-yellow-300">¡Prepárate para precios nunca vistos!</span>
                </p>
                
                <!-- Coming Soon Features -->
                <div class="grid md:grid-cols-3 gap-6 mb-8">
                    <div class="bg-white/10 rounded-xl p-4">
                        <div class="text-3xl mb-2">🌍</div>
                        <div class="font-bold text-white">185+ Países</div>
                        <div class="text-sm text-gray-300">Cobertura total</div>
                    </div>
                    <div class="bg-white/10 rounded-xl p-4">
                        <div class="text-3xl mb-2">⚡</div>
                        <div class="font-bold text-white">5G Ultra</div>
                        <div class="text-sm text-gray-300">Velocidad máxima</div>
                    </div>
                    <div class="bg-white/10 rounded-xl p-4">
                        <div class="text-3xl mb-2">💎</div>
                        <div class="font-bold text-white">-90% Precio</div>
                        <div class="text-sm text-gray-300">vs. Roaming</div>
                    </div>
                </div>
            </div>

            <!-- Preview Plans -->
            <div class="mb-12">
                <h3 class="text-2xl font-bold text-white mb-6">Vista Previa - Próximos Planes</h3>
                <div class="grid md:grid-cols-3 gap-4">
                    <div class="bg-gradient-to-br from-blue-600/30 to-cyan-600/30 rounded-xl p-6 border border-blue-400/50">
                        <div class="text-3xl mb-2">🇪🇺</div>
                        <div class="font-bold text-white">Europa Total</div>
                        <div class="text-2xl text-yellow-400 font-bold">$29</div>
                        <div class="text-sm text-blue-200">30 países, 15GB</div>
                    </div>
                    <div class="bg-gradient-to-br from-purple-600/30 to-pink-600/30 rounded-xl p-6 border border-purple-400/50">
                        <div class="text-3xl mb-2">🌐</div>
                        <div class="font-bold text-white">Global Premium</div>
                        <div class="text-2xl text-yellow-400 font-bold">$79</div>
                        <div class="text-sm text-purple-200">150+ países, 50GB</div>
                    </div>
                    <div class="bg-gradient-to-br from-green-600/30 to-emerald-600/30 rounded-xl p-6 border border-green-400/50">
                        <div class="text-3xl mb-2">🇺🇸</div>
                        <div class="font-bold text-white">USA & Canadá</div>
                        <div class="text-2xl text-yellow-400 font-bold">$39</div>
                        <div class="text-sm text-green-200">2 países, 25GB</div>
                    </div>
                </div>
            </div>

            <!-- Call to Action -->
            <div class="space-y-6">
                <div class="text-lg text-yellow-300 font-bold">
                    🎉 ¡OFERTA DE LANZAMIENTO ACTIVADA!
                </div>
                
                <div class="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-2xl p-6 border border-yellow-400/40">
                    <div class="text-xl font-bold text-white mb-2">
                        ⏰ Primeros 1000 usuarios obtienen:
                    </div>
                    <div class="text-lg text-yellow-200">
                        ✅ 50% descuento de por vida<br>
                        ✅ Activación gratuita<br>
                        ✅ Soporte VIP exclusivo
                    </div>
                </div>
                
                <a href="/" class="inline-block bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white px-12 py-4 rounded-full text-xl font-bold hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-105 shadow-2xl">
                    ⬅️ Volver al Inicio
                </a>
                
                <div class="text-gray-400 text-sm">
                    <p>Notificaciones automáticas activadas</p>
                    <p class="text-green-400">🔔 Te avisaremos cuando esté listo</p>
                </div>
            </div>
        </div>
    </div>

    <!-- Floating Elements -->
    <div class="absolute top-20 left-10 text-4xl opacity-30 float" style="animation-delay: 1s;">📱</div>
    <div class="absolute top-40 right-20 text-3xl opacity-40 float" style="animation-delay: 2s;">🌐</div>
    <div class="absolute bottom-20 left-20 text-5xl opacity-25 float" style="animation-delay: 3s;">✈️</div>
    <div class="absolute bottom-40 right-10 text-4xl opacity-35 float" style="animation-delay: 0.5s;">🛒</div>
</body>
</html>"""
    return HttpResponse(html_content)

def health(request):
    """Health check endpoint para Railway"""
    return JsonResponse({
        "status": "healthy",
        "service": "esim-backend",
        "message": "Hablaris eSIM Backend funcionando correctamente"
    })

def api_status(request):
    """API status endpoint"""
    return JsonResponse({
        "status": "active",
        "api_version": "1.0",
        "endpoints": [
            "/health/",
            "/shop/",
            "/admin/",
        ]
    })
