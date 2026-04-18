import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Toast } from 'toastify-react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

import RouteMap from '@components/map/RouteMap';
import DevTeleporter from '@components/ui/DevTeleporter';
import { AppText } from '@components/ui/AppText';
import { AppButton } from '@components/ui/AppButton';
import { AppCard } from '@components/ui/AppCard';
import { AppModal } from '@components/ui/AppModal';
import { CustomContainer } from '@components/ui/CustomContainer';
import { AppHeader } from '@components/ui/AppHeader';
import { Colors } from '@theme/colors';
import { getWidth, getHeight, getFontSize } from '@theme/responsive';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useLocationTracker, useGeofencingEngine } from '@hooks/useLocationTracker';
import { useActiveTargetNode, useRunStore } from '@store/useRunStore';
import { isUserInPolygon } from '@utils/geoUtils';

const TrackingScreen = () => {
  const insets = useSafeAreaInsets();

  // Navigation / location mounts
  useLocationTracker();
  useGeofencingEngine();

  const runState = useRunStore(s => s.runState);
  const activeNode = useActiveTargetNode();
  const currentLocation = useRunStore(s => s.currentLocation);
  const startRun = useRunStore(s => s.startRun);
  const endRun = useRunStore(s => s.endRun);
  const resetRun = useRunStore(s => s.resetRun);

  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<'START' | 'END' | 'GENERAL'>('GENERAL');

  // Conditionals
  const canStart = React.useMemo(() => {
    if (runState !== 'IDLE' || !currentLocation || activeNode.nodeType !== 'SP') return false;
    return isUserInPolygon(currentLocation, activeNode.node.polygon);
  }, [runState, currentLocation, activeNode]);

  const canEnd = React.useMemo(() => {
    if (runState !== 'ACTIVE' || !currentLocation || activeNode.nodeType !== 'EP') return false;
    return isUserInPolygon(currentLocation, activeNode.node.polygon);
  }, [runState, currentLocation, activeNode]);

  const handleStartAttempt = () => {
    try {
      if (canStart) {
        startRun();
        setTimeout(() => Toast.success('Mission Started! Follow the route.'), 100);
      } else {
        setModalType('START');
        setModalVisible(true);
      }
    } catch (error) {
      console.error('handleStartAttempt crashed:', error);
    }
  };

  const handleEndAttempt = () => {
    if (canEnd) {
      endRun();
      setTimeout(() => Toast.success('Mission Completed Successfully!'), 100);
    } else {
      setModalType('END');
      setModalVisible(true);
    }
  };

  const renderBottomOverlay = () => {
    if (runState === 'COMPLETED') {
      return (
        <AppCard style={styles.bottomCard}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.iconBox}>
              <Ionicons name="checkmark" color={Colors.surfaceHighlight} size={28} />
            </View>
            <View style={styles.textStack}>
               <AppText variant="h2" color="primary">Run Completed! 🎉</AppText>
               <AppText color="textSecondary" style={styles.subtitle}>You finished the entire patrol sequence.</AppText>
            </View>
          </View>
          <AppButton 
            title="Start New Run" 
            variant="primary" 
            icon={<Ionicons name="refresh" color={Colors.black} size={20} />}
            onPress={() => {
              resetRun();
              setTimeout(() => Toast.info('Sequence Reset.'), 100);
            }}
          />
        </AppCard>
      );
    }

    if (runState === 'IDLE') {
      return (
        <AppCard style={styles.bottomCard}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.iconBox}>
              <Ionicons name="bicycle" color={Colors.primary} size={28} />
            </View>
            <View style={styles.textStack}>
              <AppText variant="h2">Welcome to Patrol</AppText>
              <AppText color="textMuted" style={styles.subtitle}>
                {canStart 
                  ? 'At the Start Point. Ready to begin?' 
                  : 'Head to the Start Point to begin.'}
              </AppText>
            </View>
          </View>
          
          <AppButton 
            title={canStart ? "Start Run" : "Move to Start Zone"} 
            variant={canStart ? "primary" : "secondary"}
            icon={<Ionicons name="play" color={canStart ? Colors.black : Colors.textMain} size={20} />}
            onPress={handleStartAttempt}
          />
        </AppCard>
      );
    }

    // ACTIVE State
    if (activeNode.nodeType === 'EP') {
      return (
        <AppCard style={styles.bottomCard}>
           <View style={styles.cardHeaderRow}>
            <View style={styles.iconBox}>
              <Ionicons name="checkmark" color={Colors.black} size={28} />
            </View>
            <View style={styles.textStack}>
              <AppText variant="h2" color="primary">Final Step!</AppText>
              <AppText color="textMuted" style={styles.subtitle}>
                {canEnd ? 'Arrived. End your run now.' : 'Head to End Point to finish.'}
              </AppText>
            </View>
          </View>
          
          <AppButton 
            title={canEnd ? "End Run" : "Move to End Zone"} 
            variant={canEnd ? "primary" : "secondary"} 
            icon={<Ionicons name="checkmark" color={canEnd ? Colors.black : Colors.textMain} size={20} />}
            onPress={handleEndAttempt}
          />
        </AppCard>
      );
    }

    return (
      <AppCard style={styles.bottomCard}>
         <View style={styles.cardHeaderRow}>
            <View style={styles.iconBox}>
              <Ionicons name="navigate" color={Colors.primary} size={28} />
            </View>
            <View style={styles.textStack}>
              <AppText variant="h2">Target: {activeNode.node.name}</AppText>
              <AppText color="textMuted" style={styles.subtitle}>Hit Requirement: {activeNode.targetHitIndex} of {activeNode.node.hits}</AppText>
            </View>
         </View>
         <View style={styles.instructionRow}>
            <Ionicons name="location" color={Colors.primary} size={20} />
            <AppText color="primary" style={styles.metricsText}> Proceed to the highlighted zone.</AppText>
         </View>
      </AppCard>
    );
  };

  return (
    <CustomContainer headerTransparent scroll={false} style={styles.screenWrapper}>
      <RouteMap />
      
      {/* Generic Top Header aligned perfectly over Map */}
      <AppHeader 
        showBackButton 
        style={{ paddingTop: insets.top + getHeight(10) }}
        centerNode={
          <View style={styles.topHud}>
            <AppText color="primary" style={styles.hudText}>Status: {runState}</AppText>
          </View>
        }
        rightNode={<DevTeleporter />}
      />

      {/* Bottom Action Components */}
      <View style={styles.bottomOverlayContainer} pointerEvents="box-none">
        {renderBottomOverlay()}
      </View>

      {/* Out of Bounds Custom Modals */}
      <AppModal visible={modalVisible} onClose={() => setModalVisible(false)}>
        <View style={styles.modalContent}>
          <View style={styles.iconCircle}>
            <Ionicons name="warning" color={Colors.danger} size={32} />
          </View>
          <AppText variant="h1" align="center" style={styles.modalTitle}>Out of Bounds</AppText>
          <AppText align="center" color="textSecondary" style={styles.modalBody}>
            {modalType === 'START' 
              ? 'You are not inside the Start Point zone. Please move into the required area to begin the run.' 
              : 'You have not reached the End Point zone yet. Keep going!'}
          </AppText>
          
          <AppButton 
            title="Acknowledge" 
            variant="danger" 
            onPress={() => setModalVisible(false)} 
            style={{ marginTop: 20 }}
          />
        </View>
      </AppModal>
    </CustomContainer>
  );
};

const styles = StyleSheet.create({
  screenWrapper: {
    justifyContent: 'space-between',
  },
  topHud: {
    backgroundColor: Colors.surface,
    paddingHorizontal: getWidth(16),
    paddingVertical: getHeight(8),
    borderRadius: getHeight(16),
    borderWidth: 1,
    borderColor: Colors.borderLight
  },
  hudText: {
    fontWeight: '700',
    fontSize: getFontSize(12),
    letterSpacing: 1,
  },
  bottomOverlayContainer: {
    width: '100%',
    padding: getWidth(20),
  },
  bottomCard: {
    width: '100%',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: getHeight(20),
  },
  iconBox: {
    width: getWidth(48),
    height: getWidth(48),
    borderRadius: getHeight(16),
    backgroundColor: 'rgba(0, 230, 118, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: getWidth(16),
    borderWidth: 1,
    borderColor: 'rgba(0, 230, 118, 0.3)',
  },
  textStack: {
    flex: 1,
  },
  subtitle: {
    marginTop: getHeight(4),
    lineHeight: getFontSize(20),
  },
  instructionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 230, 118, 0.1)',
    padding: getWidth(12),
    borderRadius: getHeight(12),
  },
  metricsText: {
    marginLeft: getWidth(10),
  },
  modalContent: {
    alignItems: 'center',
    paddingTop: getHeight(10),
  },
  iconCircle: {
    width: getWidth(64),
    height: getWidth(64),
    borderRadius: getWidth(32),
    backgroundColor: Colors.dangerSurface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: getHeight(20),
  },
  modalTitle: {
    marginBottom: getHeight(10),
  },
  modalBody: {
    marginBottom: getHeight(10),
  }
});

export default TrackingScreen;
