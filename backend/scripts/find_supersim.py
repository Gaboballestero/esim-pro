"""
Guía interactiva para encontrar Super SIM en Twilio Console
Ejecutar desde navegador (F12 → Console)
"""

# Script JavaScript para ejecutar en el navegador
BROWSER_HELPER_SCRIPT = """
// Script para ayudar a encontrar Super SIM en Twilio Console
// Ejecutar en F12 → Console

console.log("🔍 BUSCANDO SUPER SIM EN TWILIO...");

// Buscar links que contengan palabras clave
const searchTerms = ['supersim', 'iot', 'connectivity', 'programmable', 'mobile'];
const foundLinks = [];

searchTerms.forEach(term => {
    const links = Array.from(document.querySelectorAll('a')).filter(link => 
        link.href.toLowerCase().includes(term) || 
        link.textContent.toLowerCase().includes(term)
    );
    
    if (links.length > 0) {
        console.log(`✅ Encontrados ${links.length} links para "${term}":`);
        links.forEach(link => {
            console.log(`   → ${link.textContent.trim()} (${link.href})`);
            foundLinks.push({term, text: link.textContent.trim(), href: link.href});
        });
    }
});

// Buscar botones/divs que contengan las palabras
const buttons = Array.from(document.querySelectorAll('button, div[role="button"], .menu-item')).filter(el => 
    searchTerms.some(term => el.textContent.toLowerCase().includes(term))
);

if (buttons.length > 0) {
    console.log("🔘 Botones/elementos encontrados:");
    buttons.forEach(btn => console.log(`   → ${btn.textContent.trim()}`));
}

// Verificar si Super SIM está disponible
if (foundLinks.length === 0 && buttons.length === 0) {
    console.log("❌ Super SIM no encontrado. Posibles causas:");
    console.log("   1. No está habilitado en tu cuenta");
    console.log("   2. Necesitas añadir crédito (mínimo $10)");
    console.log("   3. Está en una ubicación diferente");
    console.log("");
    console.log("💡 SOLUCIONES:");
    console.log("   → Buscar 'Billing' → 'Add-ons' → Habilitar Super SIM");
    console.log("   → Contactar soporte de Twilio");
    console.log("   → Verificar que tu cuenta esté verificada");
} else {
    console.log("🎉 ¡Super SIM encontrado! Revisa los links arriba.");
}
"""

# URLs directas para probar
DIRECT_URLS = {
    "super_sim_main": "https://console.twilio.com/us1/develop/iot/supersim",
    "programmable_connectivity": "https://console.twilio.com/us1/develop/iot/programmable-connectivity",
    "iot_overview": "https://console.twilio.com/us1/develop/iot",
    "connectivity": "https://console.twilio.com/us1/develop/connectivity"
}

def generate_direct_access_guide():
    """Generar guía con URLs directas"""
    
    print("🔗 URLS DIRECTAS PARA PROBAR:")
    print("="*50)
    
    for name, url in DIRECT_URLS.items():
        print(f"📱 {name.replace('_', ' ').title()}:")
        print(f"   {url}")
        print("")
    
    print("💡 INSTRUCCIONES:")
    print("1. Copia cada URL una por una")
    print("2. Pégala en tu navegador")
    print("3. Si alguna funciona, ¡ya tienes acceso!")
    print("4. Si ninguna funciona, Super SIM no está habilitado")

if __name__ == "__main__":
    print("🚀 TWILIO SUPER SIM FINDER")
    print("="*50)
    print("")
    print("OPCIÓN 1: Script de navegador")
    print("- Abre F12 en tu navegador") 
    print("- Ve a la pestaña 'Console'")
    print("- Copia y pega este código:")
    print("")
    print(BROWSER_HELPER_SCRIPT)
    print("")
    print("OPCIÓN 2: URLs directas")
    generate_direct_access_guide()
