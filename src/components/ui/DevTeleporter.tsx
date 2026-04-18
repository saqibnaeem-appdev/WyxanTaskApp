import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useRunStore } from '@store/useRunStore';
import { MOCK_ROUTE } from '@mocks/routeData';
import { getPolygonCentroid } from '@utils/geoUtils';
import { AppText } from './AppText';
import { Colors } from '@theme/colors';
import { getWidth, getHeight } from '@theme/responsive';

const DevTeleporter = () => {
  const [isOpen, setIsOpen] = useState(false);
  const isSimulationMode = useRunStore(s => s.isSimulationMode);
  const setSimulationMode = useRunStore(s => s.setSimulationMode);
  const setLocation = useRunStore(s => s.setLocation);

  const toggleSimulation = () => {
    setSimulationMode(!isSimulationMode);
  };

  const handleTeleport = (checkpointId: string) => {
    if (!isSimulationMode) setSimulationMode(true);
    
    if (checkpointId === 'SP') {
      setLocation(getPolygonCentroid(MOCK_ROUTE.startPoint.polygon));
    } else if (checkpointId === 'EP') {
      setLocation(getPolygonCentroid(MOCK_ROUTE.endPoint.polygon));
    } else {
      const cp = MOCK_ROUTE.checkpoints.find(c => c.id === checkpointId);
      if (cp) {
        setLocation(getPolygonCentroid(cp.polygon));
      }
    }
    setIsOpen(false);
  };

  const jumpOutsideZone = () => {
    if (!isSimulationMode) setSimulationMode(true);
    setLocation({
      latitude: 51.5200, // Safe distance away from the Base coordinates
      longitude: -0.1500
    });
    setIsOpen(false);
  };

  return (
    <>
      <TouchableOpacity 
        style={[styles.fab, isSimulationMode && styles.fabActive]} 
        onPress={() => setIsOpen(true)}
      >
        <Ionicons name="bug" color={isSimulationMode ? Colors.black : Colors.primary} size={24} />
      </TouchableOpacity>

      <Modal visible={isOpen} transparent={true} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <AppText variant="h2">Dev Teleporter</AppText>
              <TouchableOpacity onPress={() => setIsOpen(false)}>
                <Ionicons name="close" color={Colors.danger} size={24} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.simToggle} onPress={toggleSimulation}>
              <AppText color="primary" style={styles.simToggleText}>
                Simulation Mode: {isSimulationMode ? 'ON (Override GPS)' : 'OFF (Live GPS)'}
              </AppText>
            </TouchableOpacity>

            <AppText color="textMuted" style={styles.sectionHeader}>Locations</AppText>
            
            <TouchableOpacity style={styles.locationBtn} onPress={() => handleTeleport('SP')}>
              <AppText style={styles.locationText}>1. Start Point (Base)</AppText>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.locationBtn} onPress={() => handleTeleport('cp-1')}>
              <AppText style={styles.locationText}>2. Checkpoint 1 (Front Gate)</AppText>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.locationBtn} onPress={() => handleTeleport('cp-2')}>
              <AppText style={styles.locationText}>3. Checkpoint 2 (Loading Bay)</AppText>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.locationBtn} onPress={() => handleTeleport('EP')}>
              <AppText style={styles.locationText}>4. End Point (Base)</AppText>
            </TouchableOpacity>
            
            <TouchableOpacity style={[styles.locationBtn, styles.locationBtnRed]} onPress={jumpOutsideZone}>
              <AppText color="danger" style={styles.locationTextRed}>Jump Outside Bounds</AppText>
            </TouchableOpacity>

          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  fab: {
    width: getWidth(40),
    height: getWidth(40),
    borderRadius: getWidth(20),
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  fabActive: {
    backgroundColor: Colors.primary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: Colors.blackOverlay,
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: Colors.background,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  simToggle: {
    backgroundColor: '#333',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  simToggleText: {
    fontWeight: '700',
  },
  sectionHeader: {
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontSize: 12,
  },
  locationBtn: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  locationBtnRed: {
    marginTop: 10,
    borderBottomWidth: 0,
    backgroundColor: Colors.dangerSurface,
    borderRadius: 12,
  },
  locationText: {
    fontSize: 16,
    fontWeight: '500',
  },
  locationTextRed: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  }
});

export default DevTeleporter;
