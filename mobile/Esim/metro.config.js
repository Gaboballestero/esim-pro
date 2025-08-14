const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Configuración básica para React Native Web
config.resolver.alias = {
  'react-native$': 'react-native-web',
};

// Ignorar ciertos módulos problemáticos para web
config.resolver.blacklistRE = /node_modules\/.*\/react-native\/Libraries\/.*Platform.*/;

module.exports = config;
