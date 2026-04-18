// Mock native modules that are not available in the Jest environment

// react-native-maps requires native TurboModule registration
jest.mock('react-native-maps', () => {
  const React = require('react');
  const MockMapView = (props) => React.createElement('MapView', props, props.children);
  MockMapView.Marker = (props) => React.createElement('Marker', props, props.children);
  MockMapView.Polygon = (props) => React.createElement('Polygon', props);
  MockMapView.Polyline = (props) => React.createElement('Polyline', props);

  return {
    __esModule: true,
    default: MockMapView,
    Marker: MockMapView.Marker,
    Polygon: MockMapView.Polygon,
    Polyline: MockMapView.Polyline,
    PROVIDER_GOOGLE: 'google',
  };
});

// react-native-geolocation-service requires native GPS module
jest.mock('react-native-geolocation-service', () => ({
  getCurrentPosition: jest.fn(),
  watchPosition: jest.fn(() => 1),
  clearWatch: jest.fn(),
  requestAuthorization: jest.fn(() => Promise.resolve('granted')),
}));

// Toast notifications
jest.mock('toastify-react-native', () => ({
  __esModule: true,
  default: (props) => null, // ToastManager component
  Toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
  },
}));

// lucide-react-native icons — return simple View stubs
jest.mock('lucide-react-native', () => {
  const React = require('react');
  const createMockIcon = (name) => (props) => React.createElement('Icon', { ...props, testID: name });

  return new Proxy({}, {
    get: (_, name) => createMockIcon(name),
  });
});
