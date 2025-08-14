// Script para registrar usuario manualmente
const fs = require('fs');
const path = require('path');

const STORAGE_FILE = path.join(__dirname, 'frontend', 'temp_users.json');

// Usuario a registrar
const newUser = {
  id: Date.now() + Math.floor(Math.random() * 1000),
  email: 'gabo@gabo.com',
  password: '123456',
  firstName: 'Gabo',
  lastName: 'Test',
  createdAt: new Date().toISOString(),
  isActive: true,
  source: 'mobile'
};

// Cargar usuarios existentes o crear array vacío
let users = [];
if (fs.existsSync(STORAGE_FILE)) {
  try {
    const data = fs.readFileSync(STORAGE_FILE, 'utf8');
    users = JSON.parse(data);
  } catch (error) {
    console.error('Error leyendo archivo:', error);
  }
}

// Verificar si el usuario ya existe
const existingUser = users.find(u => u.email.toLowerCase() === newUser.email.toLowerCase());
if (existingUser) {
  console.log('El usuario ya existe:', existingUser);
} else {
  // Agregar el nuevo usuario
  users.push(newUser);
  
  // Guardar en archivo
  fs.writeFileSync(STORAGE_FILE, JSON.stringify(users, null, 2));
  console.log('Usuario registrado exitosamente:', newUser);
  console.log('Total de usuarios:', users.length);
}
