const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add resolver for native-only modules on web
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (platform === 'web' && moduleName === 'react-native-maps') {
    return {
      filePath: require.resolve('./web-map-stub.js'),
      type: 'sourceFile',
    };
  }
  
  if (platform === 'web' && moduleName === 'react-native/Libraries/Utilities/codegenNativeCommands') {
    return {
      filePath: require.resolve('./web-native-module-stub.js'),
      type: 'sourceFile',
    };
  }
  
  // Use default resolver for all other modules
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;