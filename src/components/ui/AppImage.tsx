import React from 'react';
import { Image, ImageProps, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { getWidth } from '@theme/responsive';

interface AppImageProps extends Omit<ImageProps, 'style'> {
  containerStyle?: StyleProp<ViewStyle>;
  imageStyle?: StyleProp<any>;
  variant?: 'icon' | 'logo' | 'full';
}

export const AppImage: React.FC<AppImageProps> = ({
  source,
  imageStyle,
  variant = 'icon',
  ...rest
}) => {
  return (
    <Image
      source={source}
      style={[styles.base, styles[variant], imageStyle]}
      {...rest}
    />
  );
};

const styles = StyleSheet.create({
  base: {
    resizeMode: 'contain',
  },
  icon: {
    width: getWidth(24),
    height: getWidth(24),
  },
  logo: {
    width: getWidth(80),
    height: getWidth(80),
    borderRadius: getWidth(20),
  },
  full: {
    width: '100%',
    height: '100%',
  },
});
