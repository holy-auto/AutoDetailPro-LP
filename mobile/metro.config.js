const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

const nativeOnlyModules = [
  'react-native-maps',
];

// On web, redirect native-only modules to web shims
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (platform === 'web' && nativeOnlyModules.includes(moduleName)) {
    const shimPath = path.resolve(__dirname, 'shims', moduleName + '.tsx');
    return { filePath: shimPath, type: 'sourceFile' };
  }
  // Let Metro handle everything else
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
