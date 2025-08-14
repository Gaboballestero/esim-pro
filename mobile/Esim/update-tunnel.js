#!/usr/bin/env node

/**
 * Script para actualizar automáticamente la URL del túnel en la configuración
 * Uso: node update-tunnel.js <tunnel-url>
 */

const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, 'src', 'config', 'app.ts');
const tunnelUrl = process.argv[2];

if (!tunnelUrl) {
  console.error('❌ Error: Proporciona la URL del túnel');
  console.log('📝 Uso: node update-tunnel.js https://abc123.ngrok.io');
  process.exit(1);
}

// Validar formato de URL
if (!tunnelUrl.startsWith('https://') && !tunnelUrl.startsWith('http://')) {
  console.error('❌ Error: La URL debe empezar con https:// o http://');
  process.exit(1);
}

try {
  // Leer el archivo de configuración
  let config = fs.readFileSync(configPath, 'utf8');
  
  // Actualizar la URL del túnel
  const apiUrl = tunnelUrl.endsWith('/api') ? tunnelUrl : `${tunnelUrl}/api`;
  const newConfig = config.replace(
    /tunnel: '.*?'/,
    `tunnel: '${apiUrl}'`
  );
  
  // Escribir el archivo actualizado
  fs.writeFileSync(configPath, newConfig);
  
  console.log('✅ Configuración actualizada exitosamente');
  console.log(`🔗 Nueva URL del túnel: ${apiUrl}`);
  console.log('📱 Reinicia la app móvil para aplicar los cambios');
  
} catch (error) {
  console.error('❌ Error al actualizar configuración:', error.message);
  process.exit(1);
}
