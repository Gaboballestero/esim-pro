from django.http import JsonResponse, HttpResponse
from django.shortcuts import render

def home(request):
    """Vista principal que sirve el frontend de Hablaris eSIM"""
    html_content = """<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Hablaris eSIM - Conectividad Internacional</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 min-h-screen">
    <header class="relative bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between items-center py-4">
                <div class="flex items-center space-x-3">
                    <div class="w-10 h-10 bg-gradient-to-r from-blue-400 to-purple-500 rounded-lg flex items-center justify-center">
                        <span class="text-white font-bold text-lg">H</span>
                    </div>
                    <span class="text-white text-xl font-bold">Hablaris eSIM</span>
                </div>
                <button class="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all">
                    Iniciar Sesión
                </button>
            </div>
        </div>
    </header>
    
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div class="text-center space-y-8">
            <h1 class="text-5xl md:text-6xl font-bold text-white leading-tight">
                Conectividad Global<br>
                <span class="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    Sin Fronteras
                </span>
            </h1>
            
            <p class="text-xl text-gray-300 max-w-3xl mx-auto">
                Viaja por el mundo sin preocuparte por la conectividad. Nuestros eSIMs te ofrecen 
                internet de alta velocidad en más de 190 países al instante.
            </p>

            <div class="flex flex-col sm:flex-row gap-4 justify-center">
                <a href="/shop/" class="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all text-center">
                    Explorar Planes
                </a>
                <button class="border border-white/30 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white/10 transition-all">
                    Ver Destinos
                </button>
            </div>
        </div>

        <div class="grid md:grid-cols-3 gap-8 mt-20">
            <div class="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-center">
                <div class="w-16 h-16 bg-gradient-to-r from-green-400 to-blue-500 rounded-full mx-auto mb-6 flex items-center justify-center">
                    <span class="text-2xl">📶</span>
                </div>
                <h3 class="text-xl font-bold text-white mb-4">Activación Instantánea</h3>
                <p class="text-gray-300">Activa tu eSIM en segundos mediante código QR. Sin esperas, sin complicaciones.</p>
            </div>

            <div class="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-center">
                <div class="w-16 h-16 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full mx-auto mb-6 flex items-center justify-center">
                    <span class="text-2xl">🌍</span>
                </div>
                <h3 class="text-xl font-bold text-white mb-4">190+ Países</h3>
                <p class="text-gray-300">Cobertura global en los principales destinos turísticos y de negocios del mundo.</p>
            </div>

            <div class="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-center">
                <div class="w-16 h-16 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full mx-auto mb-6 flex items-center justify-center">
                    <span class="text-2xl">💰</span>
                </div>
                <h3 class="text-xl font-bold text-white mb-4">Precios Transparentes</h3>
                <p class="text-gray-300">Sin tarifas ocultas ni sorpresas. Paga solo por lo que necesitas para tu viaje.</p>
            </div>
        </div>
        
        <div class="mt-20 bg-white/5 rounded-3xl p-8 text-center">
            <h2 class="text-3xl font-bold text-white mb-4">¡Aplicación funcionando en Railway!</h2>
            <p class="text-gray-300 mb-6">Django backend desplegado exitosamente con todas las funcionalidades.</p>
            <div class="flex justify-center space-x-4">
                <a href="/admin/" class="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-all">Panel Admin</a>
                <a href="/api/" class="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-all">API REST</a>
                <a href="/health/" class="bg-purple-500 text-white px-6 py-3 rounded-lg hover:bg-purple-600 transition-all">Health Check</a>
            </div>
        </div>
    </main>

    <footer class="mt-20 bg-black/20 backdrop-blur-sm border-t border-white/10 py-8">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p class="text-gray-400">© 2025 Hablaris eSIM. Conectando viajeros al mundo.</p>
            <p class="text-gray-500 text-sm mt-2">Powered by Django + Railway</p>
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
<body class="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
    <div class="flex items-center justify-center min-h-screen">
        <div class="text-center bg-white p-12 rounded-2xl shadow-2xl max-w-2xl mx-4">
            <div class="text-6xl mb-6">🚀</div>
            <h1 class="text-4xl font-bold text-gray-800 mb-4">
                ¡Tienda eSIM en Desarrollo!
            </h1>
            <p class="text-xl text-gray-600 mb-8">
                Estamos preparando una experiencia increíble para ti.<br>
                Muy pronto podrás explorar nuestros planes eSIM.
            </p>
            <div class="space-y-4">
                <div class="flex items-center justify-center space-x-4 text-lg">
                    <span>🌍 180+ países</span>
                    <span>⚡ Activación instantánea</span>
                    <span>💰 Mejores precios</span>
                </div>
                <a href="/" class="inline-block bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all">
                    ← Volver al Inicio
                </a>
            </div>
        </div>
    </div>
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
