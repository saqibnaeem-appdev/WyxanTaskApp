import { Dimensions } from 'react-native';
import { ThemeDimensions } from './types';

const { width, height } = Dimensions.get('window');

export const dimensions: ThemeDimensions = {
  screenWidth: width,
  screenHeight: height,

  spacing: {
    xs: 4,
    s: 8,
    m: 16,
    l: 24,
    xl: 32,
    xxl: 48,
  },

  borderRadius: {
    s: 4,
    m: 8,
    l: 16,
    xl: 24,
    round: 9999,
  },

  iconSize: {
    s: 16,
    m: 24,
    l: 32,
  },
};
