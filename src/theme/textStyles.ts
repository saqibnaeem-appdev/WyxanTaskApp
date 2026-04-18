import { StyleSheet } from 'react-native';
import { colors } from './colors';
import { fonts } from './fonts';
import { ThemeTypography } from './types';
import { getLineHeight } from '@utils/lineHeight';
import { getFontSize } from './responsive';

export const textStyles: ThemeTypography = StyleSheet.create({
  h1: {
    fontFamily: fonts.poppins.poppins700,
    fontSize: getFontSize(26),
    lineHeight: getLineHeight(26, 140),
    paddingTop: 4, 
    color: colors.textMain,
  },
  h2: {
    fontFamily: fonts.poppins.poppins600,
    fontSize: getFontSize(22),
    lineHeight: 28,
    color: colors.white,
  },
  h3: {
    fontFamily: fonts.poppins.poppins500,
    fontSize: getFontSize(18),
    lineHeight: getLineHeight(18, 125),
    color: colors.white,
  },
  h4: {
    fontFamily: fonts.poppins.poppins400,
    fontSize: getFontSize(14),
    lineHeight: 20,
    color: 'rgba(255, 255, 255, 0.3)',
  },

  body1: {
    fontFamily: fonts.poppins.poppins400,
    fontSize: getFontSize(16),
    lineHeight: getLineHeight(16, 160),
    color: colors.textMain,
  },

  button: {
    fontFamily: fonts.poppins.poppins600,
    fontSize: getFontSize(16),
    lineHeight: 22,
    color: colors.black,
  },
  activeTab: {
    fontFamily: fonts.roboto.roboto700,
    fontSize: getFontSize(10),
    lineHeight: getLineHeight(10, 100),
    color: colors.activeTab,
  },
  inActiveTab: {
    fontFamily: fonts.roboto.roboto400,
    fontSize: getFontSize(10),
    lineHeight: getLineHeight(10, 100),
    color: colors.inActiveTab,
  },
});
