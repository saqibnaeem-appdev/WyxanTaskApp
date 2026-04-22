import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  LayoutChangeEvent,
  Animated,
  Platform,
} from 'react-native';
import MapView, {
  Marker,
  Polygon,
  AnimatedRegion,
  PROVIDER_GOOGLE,
} from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useRunStore } from '@store/useRunStore';
import { getPolygonCentroid } from '@utils/geoUtils';
import { MOCK_ROUTE, Coordinate } from '@mocks/routeData';
import { colors, Colors } from '@theme/colors';
import { getWidth, getFontSize } from '@theme/responsive';
import { AppText } from '@components/ui/AppText';

const GOOGLE_MAPS_API_KEY = 'Google Api Key';

const ZONE_STYLES = {
  activeFill: 'rgba(0, 230, 118, 0.22)',
  completeFill: 'rgba(0, 230, 118, 0.06)',
  idleFill: 'rgba(100, 100, 100, 0.12)',
  activeStroke: Colors.primary,
  completeStroke: 'rgba(0, 230, 118, 0.35)',
  idleStroke: 'rgba(100, 100, 100, 0.4)',
};

const getBearing = (
  start: { latitude: number; longitude: number } | null,
  dest: { latitude: number; longitude: number } | null,
): number => {
  if (!start || !dest) return 0;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const toDeg = (rad: number) => (rad * 180) / Math.PI;
  const startLat = toRad(start.latitude);
  const destLat = toRad(dest.latitude);
  const dLng = toRad(dest.longitude - start.longitude);
  const y = Math.sin(dLng) * Math.cos(destLat);
  const x =
    Math.cos(startLat) * Math.sin(destLat) -
    Math.sin(startLat) * Math.cos(destLat) * Math.cos(dLng);
  return (toDeg(Math.atan2(y, x)) + 360) % 360;
};

const BicycleMarker = React.memo(() => (
  <View style={arrowStyles.outer}>
    <Ionicons name="arrow-up" color={colors.primary} size={getWidth(28)} />
  </View>
));

const arrowStyles = StyleSheet.create({
  outer: {
    width: getWidth(44),
    height: getWidth(44),
    borderRadius: getWidth(22),
    backgroundColor: 'rgba(30, 30, 30, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: getWidth(10),
    elevation: 8,
  },
});

interface CPMarkerProps {
  label: string;
  isActive: boolean;
  isComplete: boolean;
  isStart?: boolean;
  isEnd?: boolean;
}

const CheckpointMarker = React.memo(
  ({ label, isActive, isComplete, isStart, isEnd }: CPMarkerProps) => {
    const scaleAnim = useRef(new Animated.Value(isActive ? 1 : 0.85)).current;

    useEffect(() => {
      Animated.spring(scaleAnim, {
        toValue: isActive ? 1 : 0.85,
        useNativeDriver: true,
        tension: 80,
        friction: 8,
      }).start();
    }, [isActive, scaleAnim]);

    const iconName = isStart
      ? 'flag'
      : isEnd
      ? 'home'
      : isComplete
      ? 'checkmark'
      : 'radio-button-on';

    const bgColor = isActive
      ? Colors.primary
      : isComplete
      ? 'rgba(0,230,118,0.18)'
      : 'rgba(30,30,30,0.88)';

    const borderColor = isActive
      ? Colors.primary
      : isComplete
      ? 'rgba(0,230,118,0.55)'
      : 'rgba(120,120,120,0.5)';

    const iconColor = isActive
      ? Colors.black
      : isComplete
      ? Colors.primary
      : 'rgba(180,180,180,0.9)';

    return (
      <Animated.View
        style={[
          styles.cpMarkerOuter,
          {
            backgroundColor: bgColor,
            borderColor,
            transform: [{ scale: scaleAnim }],
          },
          isActive && styles.cpMarkerActiveShadow,
        ]}
      >
        <Ionicons name={iconName} color={iconColor} size={getFontSize(15)} />
        {!isStart && !isEnd && (
          <AppText
            style={[
              styles.cpMarkerLabel,
              {
                color: isActive
                  ? Colors.black
                  : isComplete
                  ? Colors.primary
                  : 'rgba(200,200,200,0.9)',
              },
            ]}
          >
            {label}
          </AppText>
        )}
      </Animated.View>
    );
  },
);

const RouteMap = () => {
  const currentLocation = useRunStore(s => s.currentLocation);
  const sequence = useRunStore(s => s.sequence);
  const activeSequenceIndex = useRunStore(s => s.activeSequenceIndex);
  const runState = useRunStore(s => s.runState);

  const mapRef = useRef<MapView>(null);
  const prevRunState = useRef<string>(runState);

  const [isLayoutReady, setIsLayoutReady] = useState(false);
  const [isUserInteracting, setIsUserInteracting] = useState(false);
  const interactionTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const markerRef = useRef<any>(null);
  const prevLocRef = useRef<Coordinate | null>(null);
  const isFirstLocRef = useRef(true);
  const [heading, setHeading] = useState(0);

  const [coordinate] = useState(
    new AnimatedRegion({
      latitude: currentLocation?.latitude || 51.5,
      longitude: currentLocation?.longitude || -0.1,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    }),
  );

  useEffect(() => {
    if (currentLocation) {
      if (prevLocRef.current) {
        const dLat = currentLocation.latitude - prevLocRef.current.latitude;
        const dLng = currentLocation.longitude - prevLocRef.current.longitude;
        if (Math.abs(dLat) > 0.0001 || Math.abs(dLng) > 0.0001) {
          const bearing = getBearing(prevLocRef.current, currentLocation);
          setHeading(bearing);
        }
      }
      prevLocRef.current = currentLocation;

      if (isFirstLocRef.current) {
        coordinate.setValue({
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude,
          latitudeDelta: 0,
          longitudeDelta: 0,
        });
        isFirstLocRef.current = false;
        return;
      }

      if (Platform.OS === 'android') {
        if (markerRef.current && markerRef.current.animateMarkerToCoordinate) {
          markerRef.current.animateMarkerToCoordinate(currentLocation, 1000);
        }
      } else {
        coordinate
          .timing({
            latitude: currentLocation.latitude,
            longitude: currentLocation.longitude,
            useNativeDriver: false,
            duration: 1000,
          } as any)
          .start();
      }
    }
  }, [currentLocation, coordinate]);

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    if (width > 0 && height > 0) setIsLayoutReady(true);
  }, []);

  const handleInteraction = useCallback(() => {
    setIsUserInteracting(true);
    if (interactionTimeout.current) clearTimeout(interactionTimeout.current);
    interactionTimeout.current = setTimeout(
      () => setIsUserInteracting(false),
      4000,
    );
  }, []);

  const routeCentroids = sequence.map(seq =>
    getPolygonCentroid(seq.node.polygon),
  );
  const activeTargetCentroid = routeCentroids[activeSequenceIndex] ?? null;

  useEffect(() => {
    const wasIdle = prevRunState.current === 'IDLE';
    const isNowActive = runState === 'ACTIVE';

    if (
      wasIdle &&
      isNowActive &&
      isLayoutReady &&
      currentLocation &&
      activeTargetCentroid
    ) {
      setTimeout(() => {
        mapRef.current?.fitToCoordinates(
          [currentLocation, activeTargetCentroid],
          {
            edgePadding: { top: 120, right: 60, bottom: 320, left: 60 },
            animated: true,
          },
        );
      }, 400);
    }

    prevRunState.current = runState;
  }, [runState, isLayoutReady, currentLocation, activeTargetCentroid]);

  useEffect(() => {
    if (
      !currentLocation ||
      !isLayoutReady ||
      isUserInteracting ||
      runState !== 'ACTIVE'
    )
      return;

    mapRef.current?.animateCamera(
      {
        center: currentLocation,
        pitch: 50,
        heading: heading,
        zoom: 17,
      },
      { duration: 900 },
    );
  }, [currentLocation, isLayoutReady, isUserInteracting, runState, heading]);

  return (
    <View style={StyleSheet.absoluteFill} onLayout={onLayout}>
      {isLayoutReady && (
        <MapView
          ref={mapRef}
          provider={PROVIDER_GOOGLE}
          style={StyleSheet.absoluteFill}
          onPanDrag={handleInteraction}
          onTouchStart={handleInteraction}
          initialRegion={
            currentLocation
              ? {
                  latitude: currentLocation.latitude,
                  longitude: currentLocation.longitude,
                  latitudeDelta: 0.008,
                  longitudeDelta: 0.008,
                }
              : {
                  latitude: 51.501,
                  longitude: -0.142,
                  latitudeDelta: 0.025,
                  longitudeDelta: 0.025,
                }
          }
          showsUserLocation={false}
          showsMyLocationButton={false}
          userInterfaceStyle="dark"
          showsCompass={false}
          showsTraffic={false}
          showsBuildings={true}
          pitchEnabled={true}
          rotateEnabled={true}
        >
          {sequence.map((seq, i) => {
            const isActive = i === activeSequenceIndex;
            const isComplete = i < activeSequenceIndex;
            return (
              <Polygon
                key={`poly-${seq.node.id}-${i}`}
                coordinates={seq.node.polygon}
                fillColor={
                  isActive
                    ? ZONE_STYLES.activeFill
                    : isComplete
                    ? ZONE_STYLES.completeFill
                    : ZONE_STYLES.idleFill
                }
                strokeColor={
                  isActive
                    ? ZONE_STYLES.activeStroke
                    : isComplete
                    ? ZONE_STYLES.completeStroke
                    : ZONE_STYLES.idleStroke
                }
                strokeWidth={isActive ? 2.5 : 1.5}
              />
            );
          })}

          {routeCentroids.length > 1 && (
            <MapViewDirections
              origin={routeCentroids[0]}
              destination={routeCentroids[routeCentroids.length - 1]}
              waypoints={
                routeCentroids.length > 2
                  ? routeCentroids.slice(1, -1)
                  : undefined
              }
              apikey={GOOGLE_MAPS_API_KEY}
              strokeWidth={5}
              strokeColor={colors.primary}
              lineDashPattern={[2, 8]}
              mode="BICYCLING"
              precision="high"
            />
          )}

          {runState !== 'COMPLETED' &&
            currentLocation &&
            activeTargetCentroid && (
              <MapViewDirections
                origin={currentLocation}
                destination={activeTargetCentroid}
                apikey={GOOGLE_MAPS_API_KEY}
                strokeWidth={6}
                strokeColor={Colors.primary}
                mode="BICYCLING"
                precision="high"
                lineJoin="round"
                lineCap="round"
                resetOnChange={false}
              />
            )}

          {[
            {
              node: MOCK_ROUTE.startPoint,
              label: 'S',
              isStart: true,
              isEnd: false,
            },
            ...MOCK_ROUTE.checkpoints
              .sort((a, b) => a.order - b.order)
              .map((cp, idx) => ({
                node: cp,
                label: `CP${idx + 1}`,
                isStart: false,
                isEnd: false,
              })),
            {
              node: MOCK_ROUTE.endPoint,
              label: 'E',
              isStart: false,
              isEnd: true,
            },
          ].map((item, i) => {
            const centroid = getPolygonCentroid(item.node.polygon);
            const seqIndex = sequence.findIndex(
              s => s.node.id === item.node.id,
            );
            const isActive =
              seqIndex !== -1 && seqIndex === activeSequenceIndex;
            const isComplete =
              seqIndex !== -1 && seqIndex < activeSequenceIndex;

            return (
              <Marker
                key={`marker-${item.node.id}-${i}`}
                coordinate={centroid}
                anchor={{ x: 0.5, y: 0.5 }}
                tracksViewChanges={isActive}
              >
                <CheckpointMarker
                  label={item.label}
                  isActive={isActive}
                  isComplete={isComplete}
                  isStart={item.isStart}
                  isEnd={item.isEnd}
                />
              </Marker>
            );
          })}

          {currentLocation && (
            <Marker.Animated
              ref={markerRef}
              coordinate={coordinate as any}
              anchor={{ x: 0.5, y: 0.5 }}
              flat={false}
              rotation={heading}
              tracksViewChanges={false}
            >
              <BicycleMarker />
            </Marker.Animated>
          )}
        </MapView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  cpMarkerOuter: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: getWidth(9),
    paddingVertical: getWidth(5),
    borderRadius: getWidth(14),
    borderWidth: 1.5,
    gap: getWidth(4),
    minWidth: getWidth(36),
    justifyContent: 'center',
  },
  cpMarkerActiveShadow: {
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.85,
    shadowRadius: getWidth(10),
    elevation: 8,
  },
  cpMarkerLabel: {
    fontSize: getFontSize(11),
    fontWeight: '700',
    letterSpacing: 0.4,
  },
});

export default RouteMap;
