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
            from { opacity: 0; transform: translateY(50px); }
            to { opacity: 1; transform: translateY(0); }
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
        html { scroll-behavior: smooth; }
        .scroll-section { scroll-margin-top: 2rem; }
    </style>
</head>
<body class="bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 relative overflow-x-hidden">
    <!-- Animated Background -->
    <div class="fixed inset-0 z-0">
        <div class="absolute top-20 left-20 w-72 h-72 bg-blue-500/20 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
        <div class="absolute top-40 right-32 w-72 h-72 bg-purple-500/20 rounded-full mix-blend-multiply filter blur-xl animate-pulse" style="animation-delay: 1s;"></div>
        <div class="absolute bottom-32 left-40 w-72 h-72 bg-pink-500/20 rounded-full mix-blend-multiply filter blur-xl animate-pulse" style="animation-delay: 2s;"></div>
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

    <!-- Newsletter Section -->
    <section class="relative z-10 py-20 px-4 scroll-section" id="newsletter">
        <div class="max-w-4xl mx-auto text-center">
            <div class="bg-black/30 backdrop-blur-2xl p-12 rounded-3xl shadow-2xl border border-white/20">
                <div class="text-7xl mb-8">📧</div>
                <h2 class="text-4xl md:text-6xl font-bold text-white mb-6">
                    ¡No te pierdas el <span class="gradient-text">lanzamiento</span>!
                </h2>
                
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
        </div>
    </footer>
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
    <title>Tienda eSIM - Hablaris</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
    <div class="flex items-center justify-center min-h-screen px-4">
        <div class="text-center bg-black/20 backdrop-blur-2xl p-12 rounded-3xl shadow-2xl max-w-4xl border border-white/20">
            <div class="text-8xl mb-8">🛍️</div>
            
            <h1 class="text-5xl md:text-7xl font-black text-white mb-6">
                🔥 <span class="bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 bg-clip-text text-transparent">ACCESO ANTICIPADO</span>
            </h1>
            
            <div class="text-2xl md:text-3xl text-blue-200 mb-8">
                ¡La tienda eSIM más esperada del año!
            </div>
            
            <div class="space-y-6">
                <a href="/" class="inline-block bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white px-12 py-4 rounded-full text-xl font-bold hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-105 shadow-2xl">
                    ⬅️ Volver al Inicio
                </a>
                
                <div class="text-gray-400 text-sm">
                    <p class="text-green-400">🔔 Te avisaremos cuando esté listo</p>
                </div>
            </div>
        </div>
    </div>
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
