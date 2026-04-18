import React, { useState, useCallback, useEffect, useRef } from 'react';
import { StyleSheet, View, LayoutChangeEvent } from 'react-native';
import MapView, { Marker, Polygon, Polyline, PROVIDER_DEFAULT } from 'react-native-maps';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useRunStore } from '@store/useRunStore';
import { getPolygonCentroid } from '@utils/geoUtils';
import { MOCK_ROUTE } from '@mocks/routeData';
import { Colors } from '@theme/colors';
import { getWidth, getFontSize } from '@theme/responsive';
import { AppText } from '@components/ui/AppText';

const ZONE_STYLES = {
  activeFill: 'rgba(0, 230, 118, 0.3)',
  completeFill: Colors.surfaceHighlight,
  idleFill: 'rgba(100, 100, 100, 0.2)',
  activeStroke: Colors.primary,
  completeStroke: 'rgba(255, 255, 255, 0.4)',
  idleStroke: 'rgba(100, 100, 100, 0.5)',
};

const RouteMap = () => {
  const currentLocation = useRunStore(s => s.currentLocation);
  const sequence = useRunStore(s => s.sequence);
  const activeSequenceIndex = useRunStore(s => s.activeSequenceIndex);
  const runState = useRunStore(s => s.runState);

  const mapRef = useRef<MapView>(null);

  const [isLayoutReady, setIsLayoutReady] = useState(false);
  const onLayout = useCallback((e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    if (width > 0 && height > 0) {
      setIsLayoutReady(true);
    }
  }, []);

  useEffect(() => {
    if (currentLocation && isLayoutReady) {
      if (runState === 'ACTIVE') {
        mapRef.current?.animateCamera(
          {
            center: currentLocation,
          },
          { duration: 1000 },
        );
      }
    }
  }, [currentLocation, runState, isLayoutReady]);

  const routeCentroids = sequence.map(seq =>
    getPolygonCentroid(seq.node.polygon),
  );
  const activeTargetCentroid = routeCentroids[activeSequenceIndex];

  const getBearing = (start: any, dest: any) => {
    if (!start || !dest) return 0;
    const startLat = start.latitude * (Math.PI / 180);
    const startLng = start.longitude * (Math.PI / 180);
    const destLat = dest.latitude * (Math.PI / 180);
    const destLng = dest.longitude * (Math.PI / 180);

    const y = Math.sin(destLng - startLng) * Math.cos(destLat);
    const x =
      Math.cos(startLat) * Math.sin(destLat) -
      Math.sin(startLat) * Math.cos(destLat) * Math.cos(destLng - startLng);
    let brng = Math.atan2(y, x);
    brng = brng * (180 / Math.PI);
    return (brng + 360) % 360;
  };

  const bearing =
    runState === 'ACTIVE'
      ? getBearing(currentLocation, activeTargetCentroid)
      : 0;

  return (
    <View style={StyleSheet.absoluteFill} onLayout={onLayout}>
      {isLayoutReady ? (
        <MapView
          ref={mapRef}
          provider={PROVIDER_DEFAULT}
          style={StyleSheet.absoluteFill}
          initialRegion={
            currentLocation
              ? {
                  latitude: currentLocation.latitude,
                  longitude: currentLocation.longitude,
                  latitudeDelta: 0.005,
                  longitudeDelta: 0.005,
                }
              : {
                  latitude: 51.501,
                  longitude: -0.142,
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01,
                }
          }
          showsUserLocation={false}
          showsMyLocationButton={false}
          userInterfaceStyle="dark"
          showsCompass={false}
        >
          {sequence.map((seq, i) => {
            const isActive = i === activeSequenceIndex;
            const isComplete = i < activeSequenceIndex;

            let fillColor = ZONE_STYLES.idleFill;
            let strokeColor = ZONE_STYLES.idleStroke;

            if (isActive) {
              fillColor = ZONE_STYLES.activeFill;
              strokeColor = ZONE_STYLES.activeStroke;
            } else if (isComplete) {
              fillColor = ZONE_STYLES.completeFill;
              strokeColor = ZONE_STYLES.completeStroke;
            }

            return (
              <Polygon
                key={`poly-${seq.node.id}-${i}`}
                coordinates={seq.node.polygon}
                fillColor={fillColor}
                strokeColor={strokeColor}
                strokeWidth={2}
              />
            );
          })}

          {[
            { node: MOCK_ROUTE.startPoint, label: 'Base' },
            ...MOCK_ROUTE.checkpoints.map((cp, idx) => ({
              node: cp,
              label: `CP${idx + 1}`,
            })),
          ].map((item, i) => {
            const centroid = getPolygonCentroid(item.node.polygon);

            const isActive =
              activeSequenceIndex < sequence.length &&
              sequence[activeSequenceIndex].node.id === item.node.id;

            let bgColor = Colors.surface;
            let textColor: keyof typeof Colors = 'textSecondary';
            let borderColor = Colors.borderLight;

            if (isActive) {
              bgColor = Colors.primary;
              textColor = 'black';
              borderColor = Colors.primary;
            } else if (runState === 'COMPLETED') {
              bgColor = Colors.surfaceHighlight;
              textColor = 'primary';
              borderColor = Colors.primary;
            }

            return (
              <Marker
                key={`static-marker-${item.node.id}`}
                coordinate={centroid}
                anchor={{ x: 0.5, y: 0.5 }}
              >
                <View
                  style={[
                    styles.sequenceMarker,
                    {
                      backgroundColor: bgColor,
                      borderColor: borderColor,
                    },
                    isActive && styles.activeSequenceMarker,
                  ]}
                >
                  <AppText color={textColor} variant="activeTab">
                    {item.label}
                  </AppText>
                </View>
              </Marker>
            );
          })}

          <Polyline
            coordinates={routeCentroids}
            strokeColor={Colors.borderLight}
            strokeWidth={4}
            lineDashPattern={[10, 10]}
          />

          {currentLocation && activeTargetCentroid && runState === 'ACTIVE' && (
            <Polyline
              coordinates={[currentLocation, activeTargetCentroid]}
              strokeColor={Colors.primary}
              strokeWidth={10}
            />
          )}

          {currentLocation && (
            <Marker
              coordinate={currentLocation}
              anchor={{ x: 0.5, y: 0.5 }}
              rotation={bearing}
              flat={true}
            >
              <View style={styles.bikeMarker}>
                <Ionicons name="arrow-up" color={Colors.primary} size={getWidth(28)} />
              </View>
            </Marker>
          )}
        </MapView>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  bikeMarker: {
    width: getWidth(44),
    height: getWidth(44),
    borderRadius: getWidth(22),
    backgroundColor: 'rgba(30, 30, 30, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: getWidth(10),
    elevation: 8,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  sequenceMarker: {
    width: getWidth(36),
    height: getWidth(36),
    borderRadius: getWidth(18),
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  activeSequenceMarker: {
    width: getWidth(44),
    height: getWidth(44),
    borderRadius: getWidth(22),
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: getWidth(8),
    elevation: 5,
  }
});

export default RouteMap;
