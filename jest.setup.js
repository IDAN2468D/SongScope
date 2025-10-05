// Jest setup - mock native modules that are not available in the test environment
// Mock react-native-document-picker
jest.mock('react-native-document-picker', () => ({
  pickSingle: jest.fn(() => Promise.resolve({ uri: 'file://mock/audio.mp3' })),
  types: { audio: 'audio/*' },
  isCancel: jest.fn(() => false),
}));

// NOTE: mocks for audio recorder and RNFS removed since native recording library was removed.

// Mock react-native-vector-icons to a plain component
jest.mock('react-native-vector-icons/MaterialCommunityIcons', () => {
  return () => null;
});

// Mock other potential native modules used in screens (no-op)
jest.mock('react-native-sound', () => {
  return function Sound() {
    return { play: jest.fn(), pause: jest.fn(), release: jest.fn() };
  };
});
// Mock AsyncStorage for tests
jest.mock('@react-native-async-storage/async-storage', () => {
  let storage = {};
  return {
    setItem: jest.fn(async (key, value) => {
      storage[key] = value;
      return Promise.resolve();
    }),
    getItem: jest.fn(async (key) => {
      return Promise.resolve(Object.prototype.hasOwnProperty.call(storage, key) ? storage[key] : null);
    }),
    removeItem: jest.fn(async (key) => {
      delete storage[key];
      return Promise.resolve();
    }),
    clear: jest.fn(async () => {
      storage = {};
      return Promise.resolve();
    }),
    getAllKeys: jest.fn(async () => Object.keys(storage)),
  };
});

// Mock react-native-share
jest.mock('react-native-share', () => ({
  open: jest.fn(() => Promise.resolve()),
  shareSingle: jest.fn(() => Promise.resolve()),
}));
