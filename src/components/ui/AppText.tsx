import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';
import { colors } from '@theme/colors';
import { textStyles } from '@theme/textStyles';

interface AppTextProps extends TextProps {
  color?: keyof typeof colors;
  variant?: keyof typeof textStyles;
  align?: 'auto' | 'left' | 'right' | 'center' | 'justify';
}

export const AppText: React.FC<AppTextProps> = ({
  style,
  color,
  variant = 'body1',
  align = 'left',
  children,
  ...rest
}) => {
  return (
    <Text
      style={[
        textStyles[variant],
        color && { color: colors[color] },
        { textAlign: align },
        style,
      ]}
      {...rest}
    >
      {children}
    </Text>
  );
};
