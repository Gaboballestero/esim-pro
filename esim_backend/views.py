from django.http import JsonResponse, HttpResponse
from django.shortcuts import render

def home(request):
    """Vista principal que sirve el frontend de Hablaris eSIM"""
    html_content = """<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Hablaris eSIM - ¡Próximo Lanzamiento!</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-20px) rotate(3deg); }
        }
        @keyframes pulse-glow {
            0%, 100% { box-shadow: 0 0 30px rgba(59, 130, 246, 0.5); }
            50% { box-shadow: 0 0 60px rgba(59, 130, 246, 0.9), 0 0 100px rgba(147, 51, 234, 0.5); }
        }
        @keyframes sparkle {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.3; transform: scale(1.2); }
        }
        @keyframes slideInUp {
            from { opacity: 0; transform: translateY(50px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .float { animation: float 4s ease-in-out infinite; }
        .pulse-glow { animation: pulse-glow 3s ease-in-out infinite; }
        .sparkle { animation: sparkle 2s ease-in-out infinite; }
        .slide-up { animation: slideInUp 1s ease-out; }
        .gradient-text { 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%); 
            -webkit-background-clip: text; 
            -webkit-text-fill-color: transparent; 
        }
        .countdown-glow {
            background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(147, 51, 234, 0.1));
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.2);
        }
    </style>
</head>
<body class="bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 min-h-screen overflow-hidden relative">
    <!-- Animated Background Elements -->
    <div class="absolute inset-0 overflow-hidden">
        <div class="absolute -inset-10 opacity-40">
            <div class="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-500/40 to-cyan-500/40 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
            <div class="absolute top-1/3 right-1/4 w-96 h-96 bg-gradient-to-r from-purple-500/40 to-pink-500/40 rounded-full mix-blend-multiply filter blur-xl animate-pulse" style="animation-delay: 1s;"></div>
            <div class="absolute bottom-1/4 left-1/3 w-96 h-96 bg-gradient-to-r from-pink-500/40 to-rose-500/40 rounded-full mix-blend-multiply filter blur-xl animate-pulse" style="animation-delay: 2s;"></div>
        </div>
    </div>

    <!-- Floating Stars -->
    <div class="absolute inset-0 pointer-events-none">
        <div class="sparkle absolute top-1/4 left-1/4 w-3 h-3 bg-gradient-to-r from-yellow-300 to-yellow-500 rounded-full shadow-lg"></div>
        <div class="sparkle absolute top-1/3 right-1/3 w-2 h-2 bg-gradient-to-r from-blue-300 to-blue-500 rounded-full shadow-lg" style="animation-delay: 0.5s;"></div>
        <div class="sparkle absolute bottom-1/3 left-1/5 w-2.5 h-2.5 bg-gradient-to-r from-purple-300 to-purple-500 rounded-full shadow-lg" style="animation-delay: 1s;"></div>
        <div class="sparkle absolute top-1/2 right-1/4 w-2 h-2 bg-gradient-to-r from-pink-300 to-pink-500 rounded-full shadow-lg" style="animation-delay: 1.5s;"></div>
        <div class="sparkle absolute bottom-1/4 right-1/2 w-3 h-3 bg-gradient-to-r from-cyan-300 to-cyan-500 rounded-full shadow-lg" style="animation-delay: 2s;"></div>
    </div>

    <div class="relative z-10 min-h-screen flex items-center justify-center px-4">
        <div class="text-center max-w-5xl mx-auto slide-up">
            <!-- Rocket Animation -->
            <div class="float mb-8">
                <div class="text-9xl md:text-[12rem] filter drop-shadow-2xl">🚀</div>
            </div>

            <!-- Main Title -->
            <h1 class="text-6xl md:text-8xl font-black text-white mb-6 leading-tight drop-shadow-2xl">
                ¡Estamos a Punto 
                <br>de <span class="gradient-text">DESPEGAR!</span>
            </h1>

            <!-- Exciting Subtitle -->
            <div class="text-2xl md:text-4xl text-blue-200 mb-8 font-light drop-shadow-lg">
                <div class="mb-2">🌟 Hablaris eSIM revolucionará</div>
                <div class="font-bold text-yellow-300 text-3xl md:text-5xl">
                    la conectividad mundial
                </div>
            </div>

            <!-- Launch Countdown Box -->
            <div class="countdown-glow rounded-3xl p-10 mb-12 pulse-glow max-w-2xl mx-auto">
                <div class="text-xl text-gray-200 mb-4 flex items-center justify-center">
                    🎯 <span class="ml-2 font-bold">LANZAMIENTO OFICIAL</span>
                </div>
                <div class="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-orange-400 to-pink-500 mb-4 drop-shadow-lg">
                    SEPTIEMBRE 2025
                </div>
                <div class="text-lg text-blue-300 font-medium">
                    ¡Prepárate para la revolución eSIM más esperada del año!
                </div>
            </div>

            <!-- Amazing Features Grid -->
            <div class="grid md:grid-cols-3 gap-8 mb-12">
                <div class="bg-gradient-to-br from-green-500/20 to-emerald-600/20 backdrop-blur-lg rounded-2xl p-8 border border-green-400/30 hover:from-green-400/30 hover:to-emerald-500/30 transition-all duration-500 transform hover:scale-105">
                    <div class="text-5xl mb-4">🌍</div>
                    <h3 class="text-2xl font-bold text-white mb-3">180+ Países</h3>
                    <p class="text-gray-200 text-lg">Conectividad global instantánea en cada rincón del planeta</p>
                </div>
                
                <div class="bg-gradient-to-br from-purple-500/20 to-violet-600/20 backdrop-blur-lg rounded-2xl p-8 border border-purple-400/30 hover:from-purple-400/30 hover:to-violet-500/30 transition-all duration-500 transform hover:scale-105">
                    <div class="text-5xl mb-4">⚡</div>
                    <h3 class="text-2xl font-bold text-white mb-3">5G Ultra Rápido</h3>
                    <p class="text-gray-200 text-lg">Velocidades de vértigo que cambiarán tu forma de viajar</p>
                </div>
                
                <div class="bg-gradient-to-br from-pink-500/20 to-rose-600/20 backdrop-blur-lg rounded-2xl p-8 border border-pink-400/30 hover:from-pink-400/30 hover:to-rose-500/30 transition-all duration-500 transform hover:scale-105">
                    <div class="text-5xl mb-4">💎</div>
                    <h3 class="text-2xl font-bold text-white mb-3">Precios Revolucionarios</h3>
                    <p class="text-gray-200 text-lg">Ahorra hasta 90% comparado con el roaming tradicional</p>
                </div>
            </div>

            <!-- Call to Action -->
            <div class="space-y-8">
                <a href="/shop/" class="inline-block bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-500 hover:via-purple-500 hover:to-pink-500 text-white px-16 py-6 rounded-full text-2xl font-black transition-all duration-300 transform hover:scale-110 shadow-2xl hover:shadow-pink-500/50 border-2 border-white/20">
                    🎉 ¡ACCESO ANTICIPADO YA DISPONIBLE!
                </a>
                
                <div class="text-gray-300 text-lg">
                    <p class="font-bold">🔥 Oferta limitada para early adopters</p>
                    <p>Sé de los primeros en vivir el futuro de la conectividad</p>
                </div>
            </div>

            <!-- Social Proof Stats -->
            <div class="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8">
                <div class="text-center">
                    <div class="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">750K+</div>
                    <div class="text-sm text-gray-400 font-medium">En Lista de Espera</div>
                </div>
                <div class="text-center">
                    <div class="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-500">4.9★</div>
                    <div class="text-sm text-gray-400 font-medium">Calificación Beta</div>
                </div>
                <div class="text-center">
                    <div class="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-500">185</div>
                    <div class="text-sm text-gray-400 font-medium">Países Confirmados</div>
                </div>
                <div class="text-center">
                    <div class="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">24/7</div>
                    <div class="text-sm text-gray-400 font-medium">Soporte VIP</div>
                </div>
            </div>
        </div>
    </div>

    <!-- Floating Emojis -->
    <div class="absolute top-20 left-10 text-4xl opacity-40 float" style="animation-delay: 1s;">📱</div>
    <div class="absolute top-40 right-20 text-3xl opacity-50 float" style="animation-delay: 2s;">🌐</div>
    <div class="absolute bottom-20 left-20 text-5xl opacity-30 float" style="animation-delay: 3s;">✈️</div>
    <div class="absolute bottom-40 right-10 text-4xl opacity-45 float" style="animation-delay: 0.5s;">🗺️</div>
    <div class="absolute top-60 left-1/2 text-3xl opacity-35 float" style="animation-delay: 2.5s;">🚀</div>
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
    """Health check endpoint"""
    return JsonResponse({
        'status': 'healthy',
        'service': 'Hablaris eSIM Backend',
        'version': '1.0.0'
    })
