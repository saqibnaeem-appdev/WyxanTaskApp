module.exports = {
  preset: '@react-native/jest-preset',
  moduleNameMapper: {
    '^@assets/(.*)$': '<rootDir>/src/assets/$1',
    '^@components/(.*)$': '<rootDir>/src/components/$1',
    '^@mocks/(.*)$': '<rootDir>/src/mocks/$1',
    '^@theme/(.*)$': '<rootDir>/src/theme/$1',
    '^@utils/(.*)$': '<rootDir>/src/utils/$1',
    '^@store/(.*)$': '<rootDir>/src/store/$1',
    '^@hooks/(.*)$': '<rootDir>/src/hooks/$1',
  },
  // Exclude the cloned reference repo from test discovery
  testPathIgnorePatterns: ['/node_modules/', '/.temp_repo/'],
  // Allow Jest to transform ESM packages from node_modules
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@react-navigation|react-native-safe-area-context|react-native-screens|react-native-maps|react-native-geolocation-service|react-native-svg|lucide-react-native|toastify-react-native)/)',
  ],
  // Setup file to mock native modules not available in Jest environment
  setupFiles: ['<rootDir>/jest.setup.js'],
};
