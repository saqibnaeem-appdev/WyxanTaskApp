import React from 'react';
import { View, StyleSheet, SafeAreaView, Dimensions } from 'react-native';
import { Colors } from '@theme/colors';
import { AppImage } from '@components/ui/AppImage';

const { width } = Dimensions.get('window');

const SplashScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <AppImage 
          source={require('../assets/images/app_logo.png')} 
          variant="logo" 
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
    width: width * 0.4,
    height: width * 0.4,
    resizeMode: 'contain',
  }
});

export default SplashScreen;
