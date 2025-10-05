module.exports = {
  preset: 'react-native',
  // Transform problematic node_modules that ship modern JS (ESM)
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@react-navigation|react-native-vector-icons|react-native-gesture-handler)/)'
  ],
  setupFiles: ['<rootDir>/node_modules/react-native-gesture-handler/jestSetup.js', '<rootDir>/jest.setup.js'],
};
