import React from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  TouchableOpacityProps,
  View,
  StyleProp,
} from 'react-native';
import { AppText } from './AppText';
import { colors } from '@theme/colors';
import { getWidth, getHeight } from '@theme/responsive';

export interface AppButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'danger';
  icon?: React.ReactNode;
}

export const AppButton: React.FC<AppButtonProps> = ({
  title,
  variant = 'primary',
  icon,
  style,
  disabled,
  ...rest
}) => {
  const isPrimary = variant === 'primary';
  const isDanger = variant === 'danger';

  const containerStyle: StyleProp<ViewStyle> = [
    styles.container,
    isPrimary && styles.primary,
    variant === 'secondary' && styles.secondary,
    isDanger && styles.danger,
    disabled && styles.disabled,
    style,
  ];

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      style={containerStyle}
      disabled={disabled}
      {...rest}
    >
      <View style={styles.content}>
        {icon && <View style={styles.iconContainer}>{icon}</View>}
        <AppText
          variant="button"
          color={isPrimary || isDanger ? 'black' : 'textMain'}
        >
          {title}
        </AppText>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    height: getHeight(56),
    borderRadius: getHeight(16),
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: getWidth(20),
    borderWidth: 1,
    borderColor: 'transparent',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginRight: getWidth(8),
  },
  primary: {
    backgroundColor: colors.primary,
  },
  secondary: {
    backgroundColor: 'transparent',
    borderColor: colors.borderLight,
  },
  danger: {
    backgroundColor: colors.danger,
  },
  disabled: {
    backgroundColor: '#333333',
    borderColor: 'transparent',
  },
});
