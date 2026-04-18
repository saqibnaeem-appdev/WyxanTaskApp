import React, { FC, ReactNode } from 'react';
import { View, StatusBar, StyleSheet, ScrollView, ViewStyle, StatusBarStyle } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@theme/colors';

interface CustomContainerProps {
  children: ReactNode;
  backgroundColor?: string;
  barStyle?: StatusBarStyle;
  scroll?: boolean;
  style?: ViewStyle;
  headerTransparent?: boolean;
}

export const CustomContainer: FC<CustomContainerProps> = ({
  children,
  backgroundColor = Colors.background,
  barStyle = 'light-content',
  scroll = false,
  style,
  headerTransparent = false
}) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.wrapper, { backgroundColor }]}>
      {/* Dynamic Status Bar spacer to absorb Notch/Dynamic Island accurately */}
      {!headerTransparent && <View style={{ height: insets.top, backgroundColor, zIndex: 1 }} />}
      
      <StatusBar translucent backgroundColor="transparent" barStyle={barStyle} />
      
      {/* Wrapping remaining screen bounds */}
      <SafeAreaView edges={['bottom', 'left', 'right']} style={styles.flex}>
          {scroll ? (
            <ScrollView
              style={[styles.flex, style]}
              contentContainerStyle={styles.contentContainer}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {children}
            </ScrollView>
          ) : (
            <View style={[styles.flex, style]}>{children}</View>
          )}
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  wrapper: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
  }
});
