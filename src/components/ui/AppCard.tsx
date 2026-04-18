import { View, ViewProps, StyleSheet } from 'react-native';
import { colors } from '@theme/colors';
import { getWidth, getHeight } from '@theme/responsive';

interface AppCardProps extends ViewProps {
  children: React.ReactNode;
}

export const AppCard: React.FC<AppCardProps> = ({
  style,
  children,
  ...rest
}) => {
  return (
    <View style={[styles.card, style]} {...rest}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: getHeight(20),
    padding: getWidth(20),
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: getHeight(10) },
    shadowOpacity: 0.5,
    shadowRadius: getHeight(20),
    elevation: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
});
