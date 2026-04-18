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
  const activeSequenceIndex = useRunStore(s => s.activeSequenceIndex);
  const sequence = useRunStore(s => s.sequence);

  const toggleSimulation = () => {
    setSimulationMode(!isSimulationMode);
  };

  const handleTeleport = (checkpointId: string) => {
    if (!isSimulationMode) setSimulationMode(true);

    if (checkpointId === 'sp-1') {
      setLocation(getPolygonCentroid(MOCK_ROUTE.startPoint.polygon));
    } else if (checkpointId === 'ep-1') {
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
      latitude: 51.52, // Safe distance away from the Base coordinates
      longitude: -0.15,
    });
    setIsOpen(false);
  };

  const getStatusIcon = (nodeId: string) => {
    const activeNode = sequence[activeSequenceIndex];
    if (activeNode && activeNode.node.id === nodeId) {
      return (
        <Ionicons
          name="radio-button-on"
          color={Colors.primary}
          size={20}
          style={{ marginRight: 10 }}
        />
      );
    }

    const hasRemaining = sequence
      .slice(activeSequenceIndex)
      .some(seq => seq.node.id === nodeId);
    if (!hasRemaining) {
      return (
        <Ionicons
          name="checkmark-circle"
          color={Colors.primary}
          size={20}
          style={{ marginRight: 10 }}
        />
      );
    }

    return (
      <Ionicons
        name="ellipse-outline"
        color={Colors.textMuted}
        size={20}
        style={{ marginRight: 10 }}
      />
    );
  };

  return (
    <>
      <TouchableOpacity
        style={[styles.fab, isSimulationMode && styles.fabActive]}
        onPress={() => setIsOpen(true)}
      >
        <Ionicons
          name="bug"
          color={isSimulationMode ? Colors.black : Colors.primary}
          size={24}
        />
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

            <TouchableOpacity
              style={styles.simToggle}
              onPress={toggleSimulation}
            >
              <AppText color="primary" variant="button">
                Simulation Mode:{' '}
                {isSimulationMode ? 'ON (Override GPS)' : 'OFF (Live GPS)'}
              </AppText>
            </TouchableOpacity>

            <AppText
              color="textMuted"
              variant="activeTab"
              style={styles.sectionHeader}
            >
              Locations
            </AppText>

            <TouchableOpacity
              style={styles.locationBtn}
              onPress={() => handleTeleport('sp-1')}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                {getStatusIcon('sp-1')}
                <AppText variant="body1">1. Start Point (Base)</AppText>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.locationBtn}
              onPress={() => handleTeleport('cp-1')}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                {getStatusIcon('cp-1')}
                <AppText variant="body1">2. Checkpoint 1 (Front Gate)</AppText>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.locationBtn}
              onPress={() => handleTeleport('cp-2')}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                {getStatusIcon('cp-2')}
                <AppText variant="body1">
                  3. Checkpoint 2 (Loading Bay)
                </AppText>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.locationBtn}
              onPress={() => handleTeleport('ep-1')}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                {getStatusIcon('ep-1')}
                <AppText variant="body1">4. End Point (Base)</AppText>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.locationBtn, styles.locationBtnRed]}
              onPress={jumpOutsideZone}
            >
              <AppText color="danger" variant="button" align="center">
                Jump Outside Bounds
              </AppText>
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
    padding: getWidth(20),
  },
  modalContent: {
    backgroundColor: Colors.background,
    borderRadius: getHeight(24),
    padding: getWidth(24),
    borderWidth: 1,
    borderColor: Colors.border,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: getHeight(20),
  },
  simToggle: {
    backgroundColor: '#333',
    padding: getWidth(12),
    borderRadius: getHeight(12),
    alignItems: 'center',
    marginBottom: getHeight(20),
  },
  sectionHeader: {
    marginBottom: getHeight(10),
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  locationBtn: {
    paddingVertical: getHeight(14),
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  locationBtnRed: {
    marginTop: getHeight(10),
    borderBottomWidth: 0,
    backgroundColor: Colors.dangerSurface,
    borderRadius: getHeight(12),
  },
});

export default DevTeleporter;
