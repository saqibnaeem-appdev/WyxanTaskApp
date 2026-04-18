module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        root: ['./src'],
        extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
        alias: {
          '@assets': './src/assets',
          '@components': './src/components',
          '@mocks': './src/mocks',
          '@theme': './src/theme',
          '@utils': './src/utils',
          '@store': './src/store',
          '@hooks': './src/hooks'
        }
      }
    ]
  ]
};
