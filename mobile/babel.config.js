module.exports = function (api) {
  api.cache(true);

  return {
    presets: ['babel-preset-expo'],
    // react-native-reanimated/plugin must be listed last.
    // It is always required — reanimated 4.x depends on react-native-worklets
    // (now a direct dependency in package.json) and needs the Babel transform
    // to convert worklet functions on every platform including web.
    plugins: ['react-native-reanimated/plugin'],
  };
};
