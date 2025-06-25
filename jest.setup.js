// jest.setup.js

const mockDimensions = {
  width: 375,
  height: 812,
  scale: 3,
  fontScale: 1,
};

jest.mock('react-native/Libraries/Utilities/Platform', () => ({
  OS: 'ios',
  select: (objs) => objs.ios,
}));

jest.mock('react-native/Libraries/Utilities/Dimensions', () => ({
  get: jest.fn(() => mockDimensions),
  set: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
}));

jest.mock('react-native/Libraries/TurboModule/TurboModuleRegistry', () => ({
  getEnforcing: () => ({}),
  get: () => ({}),
}));

jest.mock('react-native/Libraries/Components/ProgressBarAndroid/ProgressBarAndroid', () => 'ProgressBarAndroid');
jest.mock('react-native/Libraries/Components/Clipboard/Clipboard', () => ({
  getString: jest.fn(),
  setString: jest.fn(),
}));

jest.mock('react-native/Libraries/Utilities/NativeDeviceInfo', () => ({
  getConstants: () => ({}),
})); 