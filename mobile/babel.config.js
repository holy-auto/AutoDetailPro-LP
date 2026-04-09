module.exports = function (api) {
  api.cache(true);

  const plugins = [];

  // Only add reanimated plugin if worklets dependency is available
  try {
    require.resolve('react-native-worklets/plugin');
    plugins.push('react-native-reanimated/plugin');
  } catch {
    // react-native-worklets not installed — skip reanimated babel plugin
    // This is fine for web builds and Expo Go
  }

  return {
    presets: ['babel-preset-expo'],
    plugins,
  };
};
