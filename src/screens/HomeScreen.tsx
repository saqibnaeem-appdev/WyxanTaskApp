import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { MOCK_ROUTE } from '@mocks/routeData';
import { Colors } from '@theme/colors';
import { AppText } from '@components/ui/AppText';
import { AppImage } from '@components/ui/AppImage';
import { AppCard } from '@components/ui/AppCard';
import { AppButton } from '@components/ui/AppButton';
import { CustomContainer } from '@components/ui/CustomContainer';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { getWidth, getHeight, getFontSize } from '@theme/responsive';
import { useRunStore } from '@store/useRunStore';

export type RootStackParamList = {
  Home: undefined;
  Tracking: undefined;
};

type HomeScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Home'
>;

const HomeScreen = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();

  const runState = useRunStore(s => s.runState);
  const activeSequenceIndex = useRunStore(s => s.activeSequenceIndex);
  const sequence = useRunStore(s => s.sequence);
  const resetRun = useRunStore(s => s.resetRun);

  let progressPct = 0;
  if (runState === 'COMPLETED') {
    progressPct = 100;
  } else if (sequence.length > 0 && runState === 'ACTIVE') {
    progressPct = Math.round((activeSequenceIndex / sequence.length) * 100);
  }

  const fillWidth = Math.max(5, progressPct);

  return (
    <CustomContainer scroll>
      <View style={styles.header}>
        <AppImage
          source={require('@assets/images/app_logo.png')}
          variant="logo"
        />
        <AppText variant="h1" style={{ marginTop: getHeight(12) }}>
          Cyclist Tracker
        </AppText>
        <AppText color="textSecondary" style={{ marginTop: getHeight(4) }}>
          Select a mission to begin your route.
        </AppText>
      </View>

      <View style={styles.content}>
        <AppCard>
          <View style={styles.cardHeader}>
            <AppText variant="h2" color="primary" style={styles.cardTitle}>
              {MOCK_ROUTE.name}
            </AppText>
            <View style={styles.badge}>
              <AppText variant="h4" color="textMain">
                ID: {MOCK_ROUTE.id}
              </AppText>
            </View>
          </View>

          <AppText style={styles.cardDescription}>
            Start Location: {MOCK_ROUTE.startPoint.name} {'\n'}
            Checkpoints: {MOCK_ROUTE.checkpoints.length}
          </AppText>

          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${fillWidth}%` }]} />
          </View>
          <AppText color="primary" variant="button" style={styles.progressText}>
            {progressPct}% Completed
          </AppText>

          <View style={styles.actionRow}>
            {runState === 'COMPLETED' ? (
              <AppButton
                title="Start New Mission"
                variant="primary"
                icon={
                  <Ionicons name="refresh" color={Colors.black} size={20} />
                }
                onPress={() => {
                  resetRun();
                  navigation.navigate('Tracking');
                }}
              />
            ) : (
              <AppButton
                title={
                  runState === 'ACTIVE' ? 'Resume Mission' : 'Start Mission'
                }
                variant="primary"
                icon={<Ionicons name="locate" color={Colors.black} size={20} />}
                onPress={() => navigation.navigate('Tracking')}
              />
            )}
          </View>
        </AppCard>
      </View>
    </CustomContainer>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: getWidth(24),
    paddingTop: getHeight(32),
    paddingBottom: getHeight(20),
  },
  content: {
    flex: 1,
    paddingHorizontal: getWidth(24),
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
  cardDescription: {
    color: Colors.textSecondary,
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
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: getHeight(4),
  },
  progressText: {
    marginBottom: getHeight(24),
  },
  actionRow: {
    marginTop: getHeight(4),
  },
});

export default HomeScreen;
