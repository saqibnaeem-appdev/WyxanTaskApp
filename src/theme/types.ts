import { TextStyle } from 'react-native';

export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  teal: string;
  gold: string;
  background: string;
  card: string;
  textMain: string;
  textSecondary: string;
  grayLight: string;
  grayMedium: string;
  success: string;
  warning: string;
  error: string;
  white: string;
  black: string;
  transparent: string;
  bottomTabBackground: string;
  activeTab: string;
  inActiveTab: string;
  searchBackground: string;
  borderColor: string;
  placeholderColor: string;
}

export interface ThemeFonts {
  poppins: {
    poppins400: string;
    poppins500: string;
    poppins600: string;
    poppins700: string;
  };
  roboto: {
    roboto400: string;
    roboto700: string;
  };
}

export interface ThemeDimensions {
  screenWidth: number;
  screenHeight: number;
  spacing: {
    xs: number;
    s: number;
    m: number;
    l: number;
    xl: number;
    xxl: number;
  };
  borderRadius: {
    s: number;
    m: number;
    l: number;
    xl: number;
    round: number;
  };
  iconSize: {
    s: number;
    m: number;
    l: number;
  };
}

export interface ThemeTypography {
  h1: TextStyle;
  h2: TextStyle;
  h3: TextStyle;
  h4: TextStyle;
  body1: TextStyle;
  button: TextStyle;
  activeTab: TextStyle;
  inActiveTab: TextStyle;
  [key: string]: TextStyle;
}
