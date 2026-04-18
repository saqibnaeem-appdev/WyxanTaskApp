import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { MOCK_ROUTE } from '@mocks/routeData';
import { Colors } from '@theme/colors';
import { AppText } from '@components/ui/AppText';
import { AppImage } from '@components/ui/AppImage';
import { AppCard } from '@components/ui/AppCard';
import { AppButton } from '@components/ui/AppButton';
import { CustomContainer } from '@components/ui/CustomContainer';
import { Target } from 'lucide-react-native';
import { getWidth, getHeight, getFontSize } from '@theme/responsive';

// We define our stack parameter list here (or in a separate types file)
export type RootStackParamList = {
  Home: undefined;
  Tracking: undefined;
};

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

const HomeScreen = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();

  return (
    <CustomContainer scroll>
      <View style={styles.header}>
        <AppImage 
          source={require('../assets/images/app_logo.png')} 
          variant="logo"
          imageStyle={styles.brandLogo}
        />
        <AppText variant="h1" style={{ marginTop: getHeight(12) }}>Cyclist Tracker</AppText>
        <AppText color="textSecondary" style={{ marginTop: getHeight(4) }}>Select a mission to begin your route.</AppText>
      </View>

      <View style={styles.content}>
        <AppCard>
          <View style={styles.cardHeader}>
            <AppText variant="h2" color="primary" style={styles.cardTitle}>{MOCK_ROUTE.name}</AppText>
            <View style={styles.badge}>
              <AppText variant="h4" style={styles.badgeText}>ID: {MOCK_ROUTE.id}</AppText>
            </View>
          </View>
          
          <AppText style={styles.cardDescription}>
            Start Location: {MOCK_ROUTE.startPoint.name} {'\n'}
            Checkpoints: {MOCK_ROUTE.checkpoints.length}
          </AppText>

          {/* Progress Indication */}
          <View style={styles.progressTrack}>
            <View style={styles.progressFill} />
          </View>
          <AppText color="primary" style={styles.progressText}>0% Completed</AppText>
          
          <View style={styles.actionRow}>
            <AppButton 
              title="Start Mission" 
              variant="primary"
              icon={<Target color={Colors.black} size={20} />}
              onPress={() => navigation.navigate('Tracking')}
            />
          </View>
        </AppCard>
      </View>
    </CustomContainer>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 20,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  cardHeader: {
    marginBottom: getHeight(16),
  },
  cardTitle: {
    marginBottom: getHeight(8),
  },
  badge: {
    backgroundColor: Colors.surfaceHighlight,
    paddingHorizontal: getWidth(12),
    paddingVertical: getHeight(6),
    borderRadius: getHeight(12),
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontWeight: '600',
  },
  cardDescription: {
    color: '#CCC',
    marginBottom: getHeight(20),
  },
  progressTrack: {
    width: '100%',
    height: getHeight(8),
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: getHeight(4),
    marginBottom: getHeight(6),
  },
  progressFill: {
    width: '5%', // Give a tiny sliver just so it looks active!
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: getHeight(4),
  },
  progressText: {
    fontSize: getFontSize(12),
    marginBottom: getHeight(24),
    fontWeight: '600'
  },
  actionRow: {
    marginTop: getHeight(4),
  }
});

export default HomeScreen;
