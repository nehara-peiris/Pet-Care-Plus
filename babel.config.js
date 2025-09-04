// babel.config.js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      // Expo preset with NativeWind’s JSX transform
      ['babel-preset-expo', { jsxImportSource: 'nativewind' }],
      // NativeWind **preset** (NOT in "plugins")
      'nativewind/babel',
    ],
    plugins: [
      // Reanimated v4 moved the plugin here; keep it LAST
      'react-native-worklets/plugin',
    ],
  };
};
