import React from 'react';
import { Image, ImageProps, StyleSheet, ViewStyle, StyleProp } from 'react-native';

interface AppImageProps extends Omit<ImageProps, 'style'> {
  containerStyle?: StyleProp<ViewStyle>;
  imageStyle?: StyleProp<any>; // using any to bypass strict ImageStyle matching for dynamic sizing
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
    width: 24,
    height: 24,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 20,
  },
  full: {
    width: '100%',
    height: '100%',
  },
});
