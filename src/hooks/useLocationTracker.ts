import { useEffect } from 'react';
import Geolocation from 'react-native-geolocation-service';
import { useRunStore } from '@store/useRunStore';
import { requestLocationPermission } from '@utils/permissions';
import { isUserInPolygon } from '@utils/geoUtils';
import { Vibration, Platform } from 'react-native';
import { Toast } from 'toastify-react-native';

export const useLocationTracker = () => {
  const setLocation = useRunStore(s => s.setLocation);
  const isSimulationMode = useRunStore(s => s.isSimulationMode);

  useEffect(() => {
    // Skip natural GPS updates if developer is simulating them manually
    if (isSimulationMode) return;

    let watchId: number | null = null;

    const startWatching = async () => {
      const hasPermission = await requestLocationPermission();
      if (!hasPermission) {
        console.warn('Location permission denied');
        return;
      }

      // Get initial position first
      Geolocation.getCurrentPosition(
        position => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setLocation({
            latitude: lat,
            longitude: lng,
          });
        },
        error => {
          console.warn('Error getting initial location', error);
        },
        { enableHighAccuracy: false, timeout: 15000, maximumAge: 10000 },
      );

      watchId = Geolocation.watchPosition(
        position => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setLocation({
            latitude: lat,
            longitude: lng,
          });
        },
        error => {
          console.error(error);
        },
        {
          enableHighAccuracy: false, // Must be false for some Fake GPS apps on Android to work
          distanceFilter: 0,
          interval: 500,
          fastestInterval: 200,
        },
      );
    };

    startWatching();

    return () => {
      if (watchId !== null) {
        Geolocation.clearWatch(watchId);
      }
    };
  }, [setLocation, isSimulationMode]);
};

// Internal logic for Geofencing verification bounds
export const useGeofencingEngine = () => {
  const currentLocation = useRunStore(s => s.currentLocation);
  const sequence = useRunStore(s => s.sequence);
  const activeSequenceIndex = useRunStore(s => s.activeSequenceIndex);
  const advanceCheckpoint = useRunStore(s => s.advanceCheckpoint);
  const runState = useRunStore(s => s.runState);

  useEffect(() => {
    if (!currentLocation || runState !== 'ACTIVE') return;

    // Check if user is in polygon of the active target (for CP auto-complete)
    const activeTarget = sequence[activeSequenceIndex];

    // Only auto-complete for Checkpoints (SP and EP require manual button press)
    if (activeTarget.nodeType === 'CP') {
      const isInZone = isUserInPolygon(
        currentLocation,
        activeTarget.node.polygon,
      );
      if (isInZone) {
        try {
          Vibration.vibrate(Platform.OS === 'ios' ? 0 : 400);
        } catch (e) {
          // Vibration may not be supported on simulator
        }
        Toast.success(`Hit Checkpoint: ${activeTarget.node.name}`);
        // Defer advanceCheckpoint to next tick to avoid state update during render
        setTimeout(() => advanceCheckpoint(), 0);
      }
    }
  }, [
    currentLocation,
    activeSequenceIndex,
    sequence,
    runState,
    advanceCheckpoint,
  ]);
};
