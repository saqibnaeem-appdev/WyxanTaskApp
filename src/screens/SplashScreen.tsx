import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@theme/colors';
import { AppImage } from '@components/ui/AppImage';
import { getWidth } from '@theme/responsive';

const SplashScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <AppImage
          source={require('@assets/images/app_logo.png')}
          imageStyle={styles.logo}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: getWidth(180),
    height: getWidth(180),
    resizeMode: 'contain',
  },
});

export default SplashScreen;
