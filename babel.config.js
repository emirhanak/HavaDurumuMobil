module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Reanimated plugin'i animasyonlar için gereklidir
      'react-native-reanimated/plugin',
    ],
  };
};