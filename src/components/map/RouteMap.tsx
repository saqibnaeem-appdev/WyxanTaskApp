import React, { useState, useCallback } from 'react';
import { StyleSheet, View, Text, LayoutChangeEvent } from 'react-native';
import MapView, { Marker, Polygon, Polyline, PROVIDER_DEFAULT } from 'react-native-maps';
import { useRunStore } from '@store/useRunStore';
import { getPolygonCentroid } from '@utils/geoUtils';
import { Colors } from '@theme/colors';

const RouteMap = () => {
  const currentLocation = useRunStore(s => s.currentLocation);
  const sequence = useRunStore(s => s.sequence);
  const activeSequenceIndex = useRunStore(s => s.activeSequenceIndex);
  const runState = useRunStore(s => s.runState);

  // Guard against zero-size rendering which crashes CAMetalLayer on iOS simulators
  const [isLayoutReady, setIsLayoutReady] = useState(false);
  const onLayout = useCallback((e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    if (width > 0 && height > 0) {
      setIsLayoutReady(true);
    }
  }, []);

  // We want to show the full route path dynamically
  const routeCentroids = sequence.map(seq =>
    getPolygonCentroid(seq.node.polygon),
  );

  // Faint background line for the entire route
  const backgoundPath = routeCentroids;

  // Active highlighted line based on current progression
  const completedPath = routeCentroids.slice(0, activeSequenceIndex);

  // Active target segment connects user location to the next immediate centroid
  const activeTargetCentroid = routeCentroids[activeSequenceIndex];

  return (
    <View style={StyleSheet.absoluteFill} onLayout={onLayout}>
      {isLayoutReady ? (
      <MapView
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
                // Default fallback centered around Start Point
                latitude: 51.501,
                longitude: -0.142,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }
        }
        showsUserLocation={true}
        showsMyLocationButton={false}
        userInterfaceStyle="dark"
        showsCompass={false}
      >
        {/* Render Checkpoint Zones */}
        {sequence.map((seq, i) => {
          // Highlight the currently active node
          const isActive = i === activeSequenceIndex;
          const isComplete = i < activeSequenceIndex;

          let fillColor = 'rgba(100, 100, 100, 0.2)';
          let strokeColor = 'rgba(100, 100, 100, 0.5)';

          if (isActive) {
            fillColor = 'rgba(0, 230, 118, 0.3)'; // Vibrant green for active target
            strokeColor = Colors.primary;
          } else if (isComplete) {
            fillColor = Colors.surfaceHighlight;
            strokeColor = 'rgba(255, 255, 255, 0.4)';
          }

          return (
            <Polygon
              key={`${seq.node.id}-${i}`}
              coordinates={seq.node.polygon}
              fillColor={fillColor}
              strokeColor={strokeColor}
              strokeWidth={2}
            />
          );
        })}

        {/* Global Route Line (Faded) */}
        <Polyline
          coordinates={backgoundPath}
          strokeColor={Colors.borderLight}
          strokeWidth={4}
          lineDashPattern={[10, 10]}
        />

        {/* Dynamic Leading Line (User -> Target) */}
        {currentLocation && runState === 'ACTIVE' && (
          <Polyline
            coordinates={[currentLocation, activeTargetCentroid]}
            strokeColor="rgba(0, 230, 118, 0.8)"
            strokeWidth={4}
          />
        )}

        {/* Custom 3D Bike User Marker */}
        {currentLocation && (
          <Marker coordinate={currentLocation} anchor={{ x: 0.5, y: 0.5 }}>
            <View style={styles.bikeMarker}>
               <Text style={styles.emojiMarker}>🚴‍♂️</Text>
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
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(30, 30, 30, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 8,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  emojiMarker: {
    fontSize: 24,
    marginLeft: 2, /* visual centering for bike optical alignment */
  }
});

export default RouteMap;
