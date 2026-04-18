// Maintaining exactly the properties needed for textStyles.ts and our custom Tracking UI
export const colors = {
  primary: '#00E676', // Vibrant Neon Green for Cyclist Tracker App
  primaryDark: '#00B259',
  
  background: '#1E1E1E', // Slate Dark
  surface: 'rgba(40, 40, 40, 0.95)',
  surfaceHighlight: 'rgba(255,255,255,0.1)',
  
  // Specific mappings required by the tentwenty base UI structure
  black: '#000000',
  white: '#FFFFFF',
  textMain: '#FFFFFF', // Defaulted to white for dark mode
  activeTab: '#00E676',
  inActiveTab: '#A0A0A0',

  textSecondary: '#A0A0A0',
  textMuted: '#666666',
  
  danger: '#FF453A',
  dangerSurface: 'rgba(255,0,0,0.1)',
  
  border: 'rgba(255,255,255,0.05)',
  borderLight: 'rgba(255,255,255,0.15)',
  
  shadow: '#000000',
  blackOverlay: 'rgba(0,0,0,0.7)',
};

// Also exporting as Colors to support previous Wyxan implementation
export const Colors = colors;
