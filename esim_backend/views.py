from django.http import JsonResponse, HttpResponse
from django.shortcuts import render, redirect
from django.core.management import call_command
from django.db import connection
import io

def emergency_migrate(request):
    """Vista de emergencia para aplicar migraciones en Railway"""
    import os
    import subprocess
    
    try:
        # Capturar output de las migraciones
        output = io.StringIO()
        output2 = io.StringIO()
        
        makemigrations_success = False
        migrate_success = False
        
        # Primero hacer makemigrations
        try:
            call_command('makemigrations', 'esim_backend', stdout=output, stderr=output)
            makemigrations_output = output.getvalue()
            makemigrations_success = True
        except Exception as e:
            makemigrations_output = f"❌ Error en makemigrations: {str(e)}"
        
        # Luego aplicar migrate
        try:
            call_command('migrate', stdout=output2, stderr=output2)
            migrate_output = output2.getvalue()
            migrate_success = True
        except Exception as e:
            migrate_output = f"❌ Error en migrate: {str(e)}"
        
        # Verificar si las tablas se crearon
        from django.db import connection
        cursor = connection.cursor()
        try:
            # Intentar SQLite primero
            cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name LIKE 'esim_backend_%';")
            esim_tables = cursor.fetchall()
        except:
            try:
                # Si falla, intentar PostgreSQL
                cursor.execute("SELECT table_name FROM information_schema.tables WHERE table_name LIKE 'esim_backend_%';")
                esim_tables = cursor.fetchall()
            except Exception as e:
                esim_tables = []
        
        # Verificar si los modelos están registrados en el admin
        from django.contrib import admin
        try:
            from .models import Country, Region, DataPlan, ESim
            registered_models = []
            for model in [Country, Region, DataPlan, ESim]:
                if model in admin.site._registry:
                    registered_models.append(f"✅ {model.__name__}")
                else:
                    registered_models.append(f"❌ {model.__name__} - No registrado")
        except Exception as e:
            registered_models = [f"❌ Error importando modelos: {str(e)}"]
        
        # Verificar admin user
        try:
            from django.contrib.auth.models import User
            admin_exists = User.objects.filter(username='admin').exists()
            admin_status = "✅ Admin existe" if admin_exists else "❌ Admin no existe"
        except:
            admin_status = "❌ Error verificando admin"
        
        success_count = sum([makemigrations_success, migrate_success, len(esim_tables) > 0, admin_exists])
        
        html = f"""
        <html>
        <head><title>🚀 MIGRACIONES RAILWAY</title></head>
        <body style="font-family: Arial; margin: 40px; background: #f8fafc;">
        
        <div style="background: white; padding: 30px; border-radius: 15px; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
        
        <h1 style="color: #1f2937;">🚀 MIGRACIONES Y DIAGNÓSTICO RAILWAY</h1>
        
        <div style="background: {'#d1fae5' if success_count >= 3 else '#fef3c7' if success_count >= 2 else '#fecaca'}; padding: 20px; border-radius: 10px; margin: 20px 0;">
            <h2>📊 RESULTADO GENERAL: {success_count}/4 ✅</h2>
        </div>
        
        <div style="background: #f3f4f6; padding: 20px; border-radius: 10px; margin: 20px 0;">
            <h3>📋 MAKEMIGRATIONS:</h3>
            <pre style="background: white; padding: 15px; border-radius: 5px; max-height: 200px; overflow-y: auto; border-left: 4px solid {'#10b981' if makemigrations_success else '#ef4444'};">
{makemigrations_output}
            </pre>
        </div>
        
        <div style="background: #f3f4f6; padding: 20px; border-radius: 10px; margin: 20px 0;">
            <h3>⚡ MIGRATE:</h3>
            <pre style="background: white; padding: 15px; border-radius: 5px; max-height: 200px; overflow-y: auto; border-left: 4px solid {'#10b981' if migrate_success else '#ef4444'};">
{migrate_output}
            </pre>
        </div>
        
        <div style="background: #f3f4f6; padding: 20px; border-radius: 10px; margin: 20px 0;">
            <h3>🗄️ TABLAS EN BASE DE DATOS:</h3>
            <ul style="background: white; padding: 15px; border-radius: 5px; margin: 0;">
                {(''.join([f"<li style='color: #10b981;'>✅ {table[0]}</li>" for table in esim_tables]) if esim_tables else "<li style='color: #ef4444;'>❌ No hay tablas esim_backend creadas</li>")}
            </ul>
        </div>
        
        <div style="background: #f3f4f6; padding: 20px; border-radius: 10px; margin: 20px 0;">
            <h3>📝 MODELOS EN ADMIN:</h3>
            <ul style="background: white; padding: 15px; border-radius: 5px; margin: 0;">
                {''.join([f"<li>{model}</li>" for model in registered_models])}
            </ul>
        </div>
        
        <div style="background: #f3f4f6; padding: 20px; border-radius: 10px; margin: 20px 0;">
            <h3>👤 ADMIN USER:</h3>
            <p style="background: white; padding: 15px; border-radius: 5px; margin: 0;">{admin_status}</p>
        </div>
        """
        
        if success_count >= 3:
            html += f"""
            <div style="background: #d1fae5; padding: 20px; border-radius: 10px; text-align: center; margin: 20px 0;">
                <h3 style="color: #10b981;">🎉 ¡ÉXITO! Todo listo para usar</h3>
                <a href="/admin/" 
                   style="background: #10b981; color: white; padding: 15px 30px; 
                          text-decoration: none; border-radius: 8px; font-size: 18px; font-weight: bold;
                          display: inline-block; margin: 10px;">
                    🎯 IR AL ADMIN AHORA
                </a>
            </div>
            """
        else:
            html += f"""
            <div style="background: #fef3c7; padding: 20px; border-radius: 10px; text-align: center; margin: 20px 0;">
                <h3 style="color: #d97706;">⚠️ Faltan pasos por completar</h3>
                <a href="/create-admin-emergency/" 
                   style="background: #d97706; color: white; padding: 10px 20px; 
                          text-decoration: none; border-radius: 5px; margin: 10px;">
                    🔧 CREAR ADMIN
                </a>
                <a href="/emergency-migrate/" 
                   style="background: #dc3545; color: white; padding: 10px 20px; 
                          text-decoration: none; border-radius: 5px; margin: 10px;">
                    🔄 REINTENTAR
                </a>
            </div>
            """
        
        html += """
        </div>
        </body>
        </html>
        """
        return HttpResponse(html)
        
    except Exception as e:
        return HttpResponse(f'''
        <h1>❌ Error crítico en migraciones</h1>
        <div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px;">
            <h2>Error técnico:</h2>
            <pre style="color: #dc2626;">{str(e)}</pre>
        </div>
        <div style="text-align: center;">
            <a href="/create-admin-emergency/" style="background: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
                🔧 IR A DIAGNÓSTICO
            </a>
        </div>
        ''')

def emergency_admin(request):
    """Vista de emergencia para crear admin en Railway"""
    try:
        from django.contrib.auth.models import User
        from django.db import connection
        
        # Verificar si las tablas de modelos eSIM existen
        cursor = connection.cursor()
        try:
            cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name LIKE 'esim_backend_%';")
            esim_tables = cursor.fetchall()
            tables_exist = len(esim_tables) > 0
        except:
            # Si es PostgreSQL en lugar de SQLite
            try:
                cursor.execute("SELECT table_name FROM information_schema.tables WHERE table_name LIKE 'esim_backend_%';")
                esim_tables = cursor.fetchall()
                tables_exist = len(esim_tables) > 0
            except:
                tables_exist = False
                esim_tables = []
        
        # Verificar si admin existe
        try:
            admin_exists = User.objects.filter(username='admin').exists()
            if not admin_exists:
                user = User.objects.create_superuser('admin', 'admin@hablaris.com', 'admin123')
                admin_status = "✅ ADMIN CREADO"
            else:
                user = User.objects.get(username='admin')
                user.set_password('admin123')
                user.is_superuser = True
                user.is_staff = True
                user.save()
                admin_status = "🔄 ADMIN ACTUALIZADO"
        except Exception as e:
            admin_status = f"❌ ERROR ADMIN: {str(e)}"
            user = None
        
        # Si no existen las tablas, necesitamos migrar
        if not tables_exist:
            migration_needed = True
            migration_msg = "🚨 NECESITA MIGRACIONES - Tablas eSIM no existen"
        else:
            migration_needed = False
            migration_msg = f"✅ TABLAS ENCONTRADAS: {len(esim_tables)}"
        
        html = f"""
        <html>
        <head><title>� DIAGNÓSTICO RAILWAY</title></head>
        <body style="font-family: Arial; margin: 40px; background: #f0f8ff;">
        
        <div style="background: white; padding: 30px; border-radius: 15px; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
        
        <h1 style="color: #3b82f6;">� DIAGNÓSTICO COMPLETO RAILWAY</h1>
        
        <div style="background: {'#fecaca' if migration_needed else '#d1fae5'}; padding: 20px; border-radius: 10px; margin: 20px 0;">
            <h2>📊 ESTADO BASE DE DATOS</h2>
            <p><strong>{migration_msg}</strong></p>
            <p><strong>Tablas encontradas:</strong> {[table[0] for table in esim_tables] if esim_tables else 'Ninguna'}</p>
        </div>
        
        <div style="background: #e0f2fe; padding: 20px; border-radius: 10px; margin: 20px 0;">
            <h2>� ESTADO ADMIN</h2>
            <p><strong>{admin_status}</strong></p>
            {'<p><strong>Credenciales:</strong> admin / admin123</p>' if user else ''}
        </div>
        """
        
        if migration_needed:
            html += f"""
            <div style="background: #fff3cd; padding: 20px; border-radius: 10px; border-left: 5px solid #ffc107;">
                <h3>⚡ SOLUCIÓN REQUERIDA</h3>
                <p><strong>Las tablas eSIM no existen. Necesitas aplicar migraciones.</strong></p>
                
                <div style="text-align: center; margin: 20px 0;">
                    <a href="/emergency-migrate/" 
                       style="background: #dc3545; color: white; padding: 15px 30px; 
                              text-decoration: none; border-radius: 8px; font-size: 18px; font-weight: bold;
                              display: inline-block; box-shadow: 0 4px 10px rgba(220, 53, 69, 0.3);">
                        🚨 APLICAR MIGRACIONES AHORA
                    </a>
                </div>
            </div>
            """
        else:
            html += f"""
            <div style="text-align: center; margin: 30px 0;">
                <a href="/admin/" 
                   style="background: #28a745; color: white; padding: 15px 30px; 
                          text-decoration: none; border-radius: 8px; font-size: 18px; font-weight: bold;
                          display: inline-block; box-shadow: 0 4px 10px rgba(40, 167, 69, 0.3);">
                    ✅ IR AL ADMIN - TODO LISTO
                </a>
            </div>
            """
        
        html += """
        </div>
        </body>
        </html>
        """
        return HttpResponse(html)
        
    except Exception as e:
        return HttpResponse(f'''
        <h1>❌ Error en diagnóstico</h1>
        <div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2>Error técnico:</h2>
            <pre style="color: #dc2626;">{str(e)}</pre>
        </div>
        <div style="text-align: center;">
            <a href="/emergency-migrate/" style="background: #dc3545; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
                🚨 INTENTAR MIGRACIONES
            </a>
        </div>
        ''')

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

from django.http import JsonResponse, HttpResponse
from django.shortcuts import render, redirect
from django.contrib.auth.models import User
from django.views.decorators.csrf import csrf_exempt

@csrf_exempt
@csrf_exempt
def admin_login_simple(request):
    """Vista de login simple que evita problemas CSRF"""
    if request.method == 'POST':
        from django.contrib.auth import authenticate, login
        username = request.POST.get('username')
        password = request.POST.get('password')
        
        user = authenticate(request, username=username, password=password)
        if user is not None and user.is_staff:
            login(request, user)
            return redirect('/admin/')
        else:
            return HttpResponse('''
            <h2>❌ Error de Login</h2>
            <p>Usuario o contraseña incorrectos</p>
            <p><strong>Usuario:</strong> admin</p>
            <p><strong>Contraseña:</strong> admin123</p>
            <a href="/admin-simple/">Intentar de nuevo</a>
            ''')
    
    return HttpResponse('''
    <!DOCTYPE html>
    <html>
    <head>
        <title>Login Simple Admin</title>
        <style>
            body { font-family: Arial; max-width: 400px; margin: 50px auto; padding: 20px; }
            input { width: 100%; padding: 10px; margin: 10px 0; }
            button { width: 100%; padding: 15px; background: #007cba; color: white; border: none; }
        </style>
    </head>
    <body>
        <h2>🚀 Hablaris Admin - Login Simple</h2>
        <p><strong>Credenciales:</strong> admin / admin123</p>
        <form method="post">
            <input type="text" name="username" placeholder="Usuario" value="admin">
            <input type="password" name="password" placeholder="Contraseña">
            <button type="submit">Entrar al Admin</button>
        </form>
    </body>
    </html>
    ''')

def create_admin_emergency(request):
    """Vista de emergencia para crear admin en Railway"""
    try:
        # Mostrar información de debugging
        total_users = User.objects.count()
        admin_exists = User.objects.filter(username='admin').exists()
        
        html_response = f'''
        <html>
        <head><title>Admin Emergency - Hablaris</title></head>
        <body style="font-family: Arial; padding: 20px; background: #f0f2f5;">
            <div style="max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
                <h1>🚨 Admin Emergency Creator</h1>
                <div style="background: #e8f5e8; padding: 15px; border-radius: 5px; margin: 20px 0;">
                    <h3>📊 Estado de la Base de Datos:</h3>
                    <p><strong>Total usuarios:</strong> {total_users}</p>
                    <p><strong>Admin existe:</strong> {"SÍ" if admin_exists else "NO"}</p>
                </div>
        '''
        
        # Verificar si ya existe
        if User.objects.filter(username='admin').exists():
            # Eliminar y recrear para estar seguros
            User.objects.filter(username='admin').delete()
            
            admin_user = User.objects.create_superuser(
                username='admin',
                email='admin@hablaris.com',
                password='admin123'
            )
            
            # Test de autenticación
            from django.contrib.auth import authenticate
            test_login = authenticate(username='admin', password='admin123')
            
            html_response += f'''
                <div style="background: #d4edda; border: 1px solid #c3e6cb; color: #155724; padding: 15px; border-radius: 5px;">
                    <h3>✅ ADMIN RECREADO EXITOSAMENTE</h3>
                    <p><strong>Usuario:</strong> admin</p>
                    <p><strong>Contraseña:</strong> admin123</p>
                    <p><strong>Superuser:</strong> {admin_user.is_superuser}</p>
                    <p><strong>Staff:</strong> {admin_user.is_staff}</p>
                    <p><strong>Test Login:</strong> {"✅ FUNCIONA" if test_login else "❌ FALLA"}</p>
                </div>
            '''
        else:
            # Crear nuevo admin FORZADO
            # Eliminar cualquier admin existente primero
            User.objects.filter(username='admin').delete()
            
            admin_user = User.objects.create_superuser(
                username='admin',
                email='admin@hablaris.com',
                password='admin123'
            )
            
            # Verificar que funciona la autenticación
            from django.contrib.auth import authenticate
            test_login = authenticate(username='admin', password='admin123')
            
            html_response += f'''
                <div style="background: #d1ecf1; border: 1px solid #bee5eb; color: #0c5460; padding: 15px; border-radius: 5px;">
                    <h3>✅ ADMIN CREADO EXITOSAMENTE</h3>
                    <p><strong>Usuario:</strong> admin</p>
                    <p><strong>Contraseña:</strong> admin123</p>
                    <p><strong>Email:</strong> admin@hablaris.com</p>
                    <p><strong>Superuser:</strong> {admin_user.is_superuser}</p>
                    <p><strong>Staff:</strong> {admin_user.is_staff}</p>
                    <p><strong>Test Login:</strong> {"✅ FUNCIONA" if test_login else "❌ FALLA"}</p>
                </div>
            '''
        
        html_response += f'''
                <div style="margin-top: 30px; text-align: center;">
                    <a href="/admin/" style="background: #007bff; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px;">
                        🚀 Ir al Admin Panel
                    </a>
                    <br><br>
                    <a href="/" style="color: #6c757d;">← Volver al inicio</a>
                </div>
            </div>
        </body>
        </html>
        '''
        
        return HttpResponse(html_response)
        
    except Exception as e:
        return HttpResponse(f'''
        <html>
        <body style="font-family: Arial; padding: 20px; background: #f8d7da;">
            <div style="max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px;">
                <h1>❌ ERROR</h1>
                <p><strong>Error:</strong> {str(e)}</p>
                <a href="/admin/">Intentar ir al admin</a>
            </div>
        </body>
        </html>
        ''')

def health(request):
    """Health check endpoint para Railway"""
    return JsonResponse({
        "status": "healthy",
        "service": "esim-backend",
        "message": "Hablaris eSIM Backend funcionando correctamente"
    })

def store_auth(request):
    """Login oculto para acceso a la tienda en desarrollo"""
    if request.method == 'POST':
        # Credenciales temporales para desarrollo
        username = request.POST.get('username')
        password = request.POST.get('password')
        
        if username == 'hablaris_dev' and password == 'Store2025!':
            # Establecer sesión temporal
            request.session['store_access'] = True
            request.session['dev_user'] = username
            return redirect('/store/')
        else:
            # Error con mensaje más claro - usar template si existe, sino HTML inline
            error_msg = 'Credenciales incorrectas. Usuario: hablaris_dev'
            try:
                return render(request, 'store_auth.html', {'error': error_msg})
            except:
                # Fallback HTML inline si los templates fallan
                return HttpResponse(f'''
                <!DOCTYPE html>
                <html lang="es">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Error - Hablaris Store</title>
                    <script src="https://cdn.tailwindcss.com"></script>
                </head>
                <body class="min-h-screen bg-gradient-to-br from-red-900 via-red-800 to-gray-900 flex items-center justify-center">
                    <div class="bg-black/30 backdrop-blur-xl p-8 rounded-2xl shadow-2xl border border-red-500/30 max-w-md w-full mx-4">
                        <div class="text-center">
                            <div class="text-6xl mb-4">❌</div>
                            <h1 class="text-2xl font-bold text-white mb-4">Error de Acceso</h1>
                            <div class="bg-red-900/40 border border-red-500 rounded-lg p-4 mb-6">
                                <div class="text-red-300">{error_msg}</div>
                            </div>
                            <a href="/store/auth/" class="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 inline-block">
                                🔄 Intentar de Nuevo
                            </a>
                        </div>
                    </div>
                </body>
                </html>
                ''')
    
    # Template principal o fallback
    try:
        return render(request, 'store_auth.html')
    except:
        # HTML inline como fallback
        return HttpResponse('''
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Acceso Restringido - Hablaris Store</title>
            <script src="https://cdn.tailwindcss.com"></script>
        </head>
        <body class="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
            <div class="bg-black/20 backdrop-blur-2xl p-8 rounded-2xl shadow-2xl border border-white/20 max-w-md w-full mx-4">
                <div class="text-center mb-8">
                    <div class="text-6xl mb-4">🔐</div>
                    <h1 class="text-2xl font-bold text-white mb-2">Acceso de Desarrollo</h1>
                    <p class="text-gray-300 mb-4">Tienda en desarrollo - Solo personal autorizado</p>
                    
                    <div class="bg-blue-900/30 rounded-lg p-4 text-left text-sm">
                        <div class="text-blue-200 font-bold mb-2">🔑 Credenciales:</div>
                        <div class="text-green-300">Usuario: <strong>hablaris_dev</strong></div>
                        <div class="text-green-300">Contraseña: <strong>Store2025!</strong></div>
                    </div>
                </div>
                
                <form method="post" class="space-y-4">
                    <input type="hidden" name="csrfmiddlewaretoken" value="''' + request.META.get('CSRF_COOKIE', 'dummy') + '''">
                    <div>
                        <input type="text" name="username" placeholder="Usuario" value="hablaris_dev" class="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-blue-400" required>
                    </div>
                    <div>
                        <input type="password" name="password" placeholder="Contraseña" class="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-blue-400" required>
                    </div>
                    <button type="submit" class="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all">
                        🚀 Acceder a la Tienda Beta
                    </button>
                </form>
                
                <div class="text-center mt-6">
                    <div class="text-yellow-300 text-sm mb-2">⚠️ Después del login → /store/</div>
                    <a href="/" class="text-blue-400 hover:text-blue-300 text-sm">← Volver al inicio</a>
                </div>
            </div>
        </body>
        </html>
        ''')

def store(request):
    """Tienda eSIM funcional con filtros avanzados inspirada en Holafly/Nomad pero mejorada"""
    
    # Verificar acceso (comentar esta línea para producción)
    # if not request.session.get('store_access'):
    #     return HttpResponse('<script>window.location.href="/store/auth/"</script>')
    
    html_content = """<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Hablaris Store - Tienda eSIM Global</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <style>
        .gradient-bg { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
        .card-hover:hover { transform: translateY(-8px); }
        .filter-active { background: linear-gradient(135deg, #4f46e5, #7c3aed); }
        html { scroll-behavior: smooth; }
        .flag-emoji { font-size: 2rem; }
        .price-highlight { background: linear-gradient(135deg, #fbbf24, #f59e0b); }
    </style>
</head>
<body class="bg-gray-50 min-h-screen">

    <!-- Header con navegación -->
    <header class="bg-white shadow-lg sticky top-0 z-50">
        <div class="max-w-7xl mx-auto px-4">
            <div class="flex justify-between items-center py-4">
                <div class="flex items-center space-x-4">
                    <a href="/" class="text-2xl font-black text-indigo-600">🚀 HABLARIS</a>
                    <span class="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">STORE BETA</span>
                </div>
                
                <nav class="hidden md:flex items-center space-x-6">
                    <a href="#plans" class="text-gray-700 hover:text-indigo-600 font-medium">Planes</a>
                    <a href="#coverage" class="text-gray-700 hover:text-indigo-600 font-medium">Cobertura</a>
                    <a href="#support" class="text-gray-700 hover:text-indigo-600 font-medium">Soporte</a>
                    <button class="bg-indigo-600 text-white px-6 py-2 rounded-full hover:bg-indigo-700 transition-all">
                        <i class="fas fa-shopping-cart mr-2"></i>Carrito (0)
                    </button>
                </nav>
                
                <div class="md:hidden">
                    <button id="mobile-menu" class="text-gray-700">
                        <i class="fas fa-bars text-xl"></i>
                    </button>
                </div>
            </div>
        </div>
    </header>

    <!-- Hero Section -->
    <section class="gradient-bg text-white py-20">
        <div class="max-w-7xl mx-auto px-4 text-center">
            <h1 class="text-5xl md:text-7xl font-black mb-6">
                ¡Conectividad Global <span class="text-yellow-300">Sin Límites!</span>
            </h1>
            <p class="text-xl md:text-2xl mb-8 text-blue-100">
                Más de 185 países • Activación instantánea • Precios revolucionarios
            </p>
            
            <div class="flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-8 mb-12">
                <div class="flex items-center space-x-2">
                    <div class="text-3xl">⭐</div>
                    <div>
                        <div class="font-bold text-lg">4.9/5</div>
                        <div class="text-sm text-blue-200">+60K reseñas</div>
                    </div>
                </div>
                <div class="flex items-center space-x-2">
                    <div class="text-3xl">🚀</div>
                    <div>
                        <div class="font-bold text-lg">2 minutos</div>
                        <div class="text-sm text-blue-200">Activación</div>
                    </div>
                </div>
                <div class="flex items-center space-x-2">
                    <div class="text-3xl">💰</div>
                    <div>
                        <div class="font-bold text-lg">90% menos</div>
                        <div class="text-sm text-blue-200">que roaming</div>
                    </div>
                </div>
            </div>
            
            <a href="#plans" class="inline-block bg-yellow-400 text-gray-900 px-12 py-4 rounded-full text-xl font-bold hover:bg-yellow-300 transition-all transform hover:scale-105 shadow-2xl">
                🛍️ Explorar Planes eSIM
            </a>
        </div>
    </section>

    <!-- Filtros Avanzados -->
    <section class="py-12 bg-white shadow-inner" id="filters">
        <div class="max-w-7xl mx-auto px-4">
            <div class="text-center mb-8">
                <h2 class="text-3xl font-bold text-gray-800 mb-4">¿A dónde viajas?</h2>
                <p class="text-gray-600">Encuentra el plan perfecto para tu destino</p>
            </div>
            
            <!-- Barra de búsqueda -->
            <div class="max-w-2xl mx-auto mb-8">
                <div class="relative">
                    <input type="text" id="country-search" placeholder="Busca tu destino... (ej: España, Europa, Global)" 
                           class="w-full px-6 py-4 rounded-full border-2 border-gray-200 focus:border-indigo-500 focus:outline-none text-lg pl-14">
                    <i class="fas fa-search absolute left-5 top-5 text-gray-400 text-lg"></i>
                </div>
            </div>
            
            <!-- Filtros por tipo -->
            <div class="flex flex-wrap justify-center gap-4 mb-8">
                <button class="filter-btn filter-active px-6 py-3 rounded-full font-semibold text-white" data-filter="all">
                    🌍 Todos los Destinos
                </button>
                <button class="filter-btn bg-gray-200 text-gray-700 px-6 py-3 rounded-full font-semibold hover:bg-gray-300" data-filter="region">
                    🌎 Por Región
                </button>
                <button class="filter-btn bg-gray-200 text-gray-700 px-6 py-3 rounded-full font-semibold hover:bg-gray-300" data-filter="popular">
                    ⭐ Populares
                </button>
                <button class="filter-btn bg-gray-200 text-gray-700 px-6 py-3 rounded-full font-semibold hover:bg-gray-300" data-filter="unlimited">
                    ♾️ Datos Ilimitados
                </button>
                <button class="filter-btn bg-gray-200 text-gray-700 px-6 py-3 rounded-full font-semibold hover:bg-gray-300" data-filter="budget">
                    💰 Económicos
                </button>
            </div>
            
            <!-- Filtros por precio y duración -->
            <div class="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Duración del viaje</label>
                    <select class="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-indigo-500 focus:outline-none">
                        <option>Cualquier duración</option>
                        <option>1-7 días</option>
                        <option>8-15 días</option>
                        <option>16-30 días</option>
                        <option>30+ días</option>
                    </select>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Presupuesto</label>
                    <select class="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-indigo-500 focus:outline-none">
                        <option>Cualquier precio</option>
                        <option>Menos de $20</option>
                        <option>$20 - $50</option>
                        <option>$50 - $100</option>
                        <option>$100+</option>
                    </select>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Datos necesarios</label>
                    <select class="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-indigo-500 focus:outline-none">
                        <option>Cualquier cantidad</option>
                        <option>1-5 GB</option>
                        <option>5-15 GB</option>
                        <option>15-50 GB</option>
                        <option>Ilimitado</option>
                    </select>
                </div>
            </div>
        </div>
    </section>

    <!-- Destinos Populares - Cards Grandes -->
    <section class="py-16" id="plans">
        <div class="max-w-7xl mx-auto px-4">
            <h2 class="text-4xl font-bold text-center text-gray-800 mb-4">Destinos Más Populares</h2>
            <p class="text-center text-gray-600 mb-12">Los favoritos de nuestros viajeros</p>
            
            <div class="grid md:grid-cols-3 gap-8 mb-16">
                <!-- Europa -->
                <div class="bg-white rounded-2xl shadow-xl card-hover transition-all duration-300 overflow-hidden">
                    <div class="relative">
                        <div class="gradient-bg p-6 text-white">
                            <div class="flag-emoji mb-4">🇪🇺</div>
                            <h3 class="text-2xl font-bold mb-2">Europa Total</h3>
                            <p class="text-blue-100">30 países incluidos</p>
                        </div>
                        <div class="absolute -bottom-4 right-4 bg-yellow-400 text-gray-900 px-4 py-2 rounded-full font-bold text-lg shadow-lg">
                            Desde $19
                        </div>
                    </div>
                    
                    <div class="p-6">
                        <div class="grid grid-cols-2 gap-4 mb-6">
                            <div class="text-center">
                                <div class="text-2xl font-bold text-indigo-600">15GB</div>
                                <div class="text-sm text-gray-500">Datos incluidos</div>
                            </div>
                            <div class="text-center">
                                <div class="text-2xl font-bold text-indigo-600">30</div>
                                <div class="text-sm text-gray-500">Días válido</div>
                            </div>
                        </div>
                        
                        <ul class="space-y-2 mb-6 text-sm">
                            <li class="flex items-center"><i class="fas fa-check text-green-500 mr-2"></i> España, Francia, Italia, Alemania</li>
                            <li class="flex items-center"><i class="fas fa-check text-green-500 mr-2"></i> 5G en ciudades principales</li>
                            <li class="flex items-center"><i class="fas fa-check text-green-500 mr-2"></i> Activación instantánea</li>
                            <li class="flex items-center"><i class="fas fa-check text-green-500 mr-2"></i> Hotspot incluido</li>
                        </ul>
                        
                        <div class="flex space-x-2">
                            <button class="flex-1 bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-all">
                                Comprar Ahora
                            </button>
                            <button class="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all">
                                <i class="fas fa-heart text-gray-400"></i>
                            </button>
                        </div>
                    </div>
                </div>
                
                <!-- Global -->
                <div class="bg-white rounded-2xl shadow-xl card-hover transition-all duration-300 overflow-hidden relative">
                    <div class="absolute -top-2 -right-2 bg-red-500 text-white px-4 py-2 rounded-full text-sm font-bold z-10">
                        MÁS POPULAR
                    </div>
                    <div class="relative">
                        <div class="bg-gradient-to-r from-purple-600 to-pink-600 p-6 text-white">
                            <div class="flag-emoji mb-4">🌍</div>
                            <h3 class="text-2xl font-bold mb-2">Global Premium</h3>
                            <p class="text-purple-100">150+ países incluidos</p>
                        </div>
                        <div class="absolute -bottom-4 right-4 price-highlight text-white px-4 py-2 rounded-full font-bold text-lg shadow-lg">
                            Desde $49
                        </div>
                    </div>
                    
                    <div class="p-6">
                        <div class="grid grid-cols-2 gap-4 mb-6">
                            <div class="text-center">
                                <div class="text-2xl font-bold text-purple-600">50GB</div>
                                <div class="text-sm text-gray-500">Datos incluidos</div>
                            </div>
                            <div class="text-center">
                                <div class="text-2xl font-bold text-purple-600">90</div>
                                <div class="text-sm text-gray-500">Días válido</div>
                            </div>
                        </div>
                        
                        <ul class="space-y-2 mb-6 text-sm">
                            <li class="flex items-center"><i class="fas fa-check text-green-500 mr-2"></i> Cobertura mundial completa</li>
                            <li class="flex items-center"><i class="fas fa-check text-green-500 mr-2"></i> 5G en 80+ países</li>
                            <li class="flex items-center"><i class="fas fa-check text-green-500 mr-2"></i> Soporte 24/7 VIP</li>
                            <li class="flex items-center"><i class="fas fa-crown text-yellow-500 mr-2"></i> Sin límite de velocidad</li>
                        </ul>
                        
                        <div class="flex space-x-2">
                            <button class="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all">
                                Comprar Premium
                            </button>
                            <button class="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all">
                                <i class="fas fa-heart text-gray-400"></i>
                            </button>
                        </div>
                    </div>
                </div>
                
                <!-- USA -->
                <div class="bg-white rounded-2xl shadow-xl card-hover transition-all duration-300 overflow-hidden">
                    <div class="relative">
                        <div class="bg-gradient-to-r from-blue-600 to-cyan-600 p-6 text-white">
                            <div class="flag-emoji mb-4">🇺🇸</div>
                            <h3 class="text-2xl font-bold mb-2">USA & Canadá</h3>
                            <p class="text-blue-100">2 países, máxima calidad</p>
                        </div>
                        <div class="absolute -bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-full font-bold text-lg shadow-lg">
                            Desde $29
                        </div>
                    </div>
                    
                    <div class="p-6">
                        <div class="grid grid-cols-2 gap-4 mb-6">
                            <div class="text-center">
                                <div class="text-2xl font-bold text-blue-600">25GB</div>
                                <div class="text-sm text-gray-500">Datos incluidos</div>
                            </div>
                            <div class="text-center">
                                <div class="text-2xl font-bold text-blue-600">60</div>
                                <div class="text-sm text-gray-500">Días válido</div>
                            </div>
                        </div>
                        
                        <ul class="space-y-2 mb-6 text-sm">
                            <li class="flex items-center"><i class="fas fa-check text-green-500 mr-2"></i> Redes Verizon y AT&T</li>
                            <li class="flex items-center"><i class="fas fa-check text-green-500 mr-2"></i> 5G Ultra Wide Band</li>
                            <li class="flex items-center"><i class="fas fa-check text-green-500 mr-2"></i> Roaming en Canadá</li>
                            <li class="flex items-center"><i class="fas fa-phone text-blue-500 mr-2"></i> Llamadas incluidas</li>
                        </ul>
                        
                        <div class="flex space-x-2">
                            <button class="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all">
                                Comprar Ahora
                            </button>
                            <button class="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all">
                                <i class="fas fa-heart text-gray-400"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Ventajas Competitivas -->
    <section class="py-16 bg-gray-50">
        <div class="max-w-7xl mx-auto px-4 text-center">
            <h2 class="text-4xl font-bold text-gray-800 mb-12">¿Por qué elegir Hablaris?</h2>
            
            <div class="grid md:grid-cols-4 gap-8">
                <div class="bg-white p-8 rounded-xl shadow-lg">
                    <div class="text-5xl mb-4">⚡</div>
                    <h3 class="text-xl font-bold mb-4">2 Min Activación</h3>
                    <p class="text-gray-600">La activación más rápida del mercado. Lista para usar al instante.</p>
                </div>
                
                <div class="bg-white p-8 rounded-xl shadow-lg">
                    <div class="text-5xl mb-4">💰</div>
                    <h3 class="text-xl font-bold mb-4">90% Más Barato</h3>
                    <p class="text-gray-600">Precios hasta 90% menores que el roaming tradicional.</p>
                </div>
                
                <div class="bg-white p-8 rounded-xl shadow-lg">
                    <div class="text-5xl mb-4">🌍</div>
                    <h3 class="text-xl font-bold mb-4">185+ Países</h3>
                    <p class="text-gray-600">La cobertura más amplia del mercado mundial.</p>
                </div>
                
                <div class="bg-white p-8 rounded-xl shadow-lg">
                    <div class="text-5xl mb-4">🛡️</div>
                    <h3 class="text-xl font-bold mb-4">Garantía Total</h3>
                    <p class="text-gray-600">Reembolso completo si no funciona en tu destino.</p>
                </div>
            </div>
        </div>
    </section>

    <!-- Footer -->
    <footer class="bg-gray-900 text-white py-12">
        <div class="max-w-7xl mx-auto px-4 text-center">
            <div class="text-4xl mb-4">🚀</div>
            <h3 class="text-2xl font-bold mb-4">Hablaris Store Beta</h3>
            <p class="text-gray-400 mb-8">Versión en desarrollo - Funcionalidades limitadas</p>
            
            <div class="flex justify-center space-x-6">
                <a href="/" class="text-blue-400 hover:text-blue-300">← Volver al Landing</a>
                <a href="/shop/" class="text-purple-400 hover:text-purple-300">Vista Previa</a>
                <a href="/store/auth/" class="text-yellow-400 hover:text-yellow-300">Acceso Dev</a>
            </div>
        </div>
    </footer>

    <script>
        // Funcionalidad de filtros
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                // Remover clase activa de todos
                document.querySelectorAll('.filter-btn').forEach(b => {
                    b.classList.remove('filter-active');
                    b.classList.add('bg-gray-200', 'text-gray-700');
                });
                
                // Agregar clase activa al seleccionado
                this.classList.add('filter-active');
                this.classList.remove('bg-gray-200', 'text-gray-700');
                
                // Aquí iría la lógica de filtrado
                console.log('Filtro seleccionado:', this.dataset.filter);
            });
        });

        // Búsqueda de países
        document.getElementById('country-search').addEventListener('input', function(e) {
            const searchTerm = e.target.value.toLowerCase();
            console.log('Buscando:', searchTerm);
            // Aquí iría la lógica de búsqueda en tiempo real
        });
    </script>

</body>
</html>"""
    return HttpResponse(html_content)
