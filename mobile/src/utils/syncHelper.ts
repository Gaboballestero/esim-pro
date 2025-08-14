// Script para agregar usuario casa@casa.com a la app móvil
// Este script simula la sincronización exitosa

import AsyncStorage from '@react-native-async-storage/async-storage';

export async function addCasaUserToMobile() {
  try {
    console.log('🔧 Agregando usuario casa@casa.com a la app móvil...');
    
    // Obtener usuarios existentes
    const existingUsersJson = await AsyncStorage.getItem('@hablaris_mock_users');
    let existingUsers = [];
    
    if (existingUsersJson) {
      existingUsers = JSON.parse(existingUsersJson);
    }
    
    // Verificar si el usuario ya existe
    const userExists = existingUsers.find(user => user.email === 'casa@casa.com');
    
    if (!userExists) {
      // Agregar el usuario casa@casa.com
      const newUser = {
        id: 1754669367264,
        email: 'casa@casa.com',
        password: '123456',
        first_name: 'casa',
        last_name: 'grande',
        username: 'casa@casa.com',
        created_at: '2025-08-08T16:09:27.073Z',
        is_mobile_user: false, // Vino de la web
        is_email_verified: true,
        synced_from_web: true // Marca especial
      };
      
      existingUsers.push(newUser);
      
      // Guardar usuarios actualizados
      await AsyncStorage.setItem('@hablaris_mock_users', JSON.stringify(existingUsers));
      
      console.log('✅ Usuario casa@casa.com agregado exitosamente a la app móvil');
      console.log(`📊 Total usuarios en móvil: ${existingUsers.length}`);
      
      return true;
    } else {
      console.log('ℹ️ Usuario casa@casa.com ya existe en la app móvil');
      return false;
    }
    
  } catch (error) {
    console.error('❌ Error agregando usuario a la app móvil:', error);
    return false;
  }
}

// Función para verificar usuarios en móvil
export async function checkMobileUsers() {
  try {
    const usersJson = await AsyncStorage.getItem('@hablaris_mock_users');
    if (usersJson) {
      const users = JSON.parse(usersJson);
      console.log('📱 Usuarios en app móvil:');
      users.forEach(user => {
        console.log(`- ${user.email} (${user.is_mobile_user ? 'móvil' : 'web'})`);
      });
      return users;
    }
    return [];
  } catch (error) {
    console.error('Error verificando usuarios móviles:', error);
    return [];
  }
}
