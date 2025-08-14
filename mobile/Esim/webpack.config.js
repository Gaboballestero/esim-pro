const createExpoWebpackConfigAsync = require('@expo/webpack-config');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync({
    ...env,
    mode: env.mode || 'development',
  }, argv);

  // Configuración personalizada para resolver problemas de React Native Web
  config.resolve.alias = {
    ...config.resolve.alias,
    'react-native$': 'react-native-web',
    'react-native/Libraries/Utilities/Platform$': 'react-native-web/dist/exports/Platform',
    'react-native/Libraries/EventEmitter/NativeEventEmitter$': 'react-native-web/dist/exports/NativeEventEmitter',
    'react-native/Libraries/ReactNative/BridgelessUIManager$': 'react-native-web/dist/modules/UIManager',
    'react-native/Libraries/ReactNative/PaperUIManager$': 'react-native-web/dist/modules/UIManager',
  };

  // Ignorar módulos que causan problemas en web
  config.resolve.fallback = {
    ...config.resolve.fallback,
    'crypto': false,
    'stream': false,
    'path': false,
    'fs': false,
  };

  return config;
};
