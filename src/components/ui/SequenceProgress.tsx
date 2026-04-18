import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Animated } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Colors } from '@theme/colors';
import { getWidth, getHeight } from '@theme/responsive';
import { AppText } from './AppText';
import { SequenceNode } from '@store/useRunStore';

interface SequenceProgressProps {
  sequence: SequenceNode[];
  activeIndex: number;
}

export const SequenceProgress: React.FC<SequenceProgressProps> = ({
  sequence,
  activeIndex,
}) => {
  const scrollViewRef = useRef<ScrollView>(null);

  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.5,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [pulseAnim]);

  useEffect(() => {
    if (scrollViewRef.current && activeIndex >= 0) {
      const offset = Math.max(0, activeIndex * 70 - 100);
      scrollViewRef.current.scrollTo({ x: offset, animated: true });
    }
  }, [activeIndex]);

  const getStepLabel = (nodeInfo: SequenceNode) => {
    if (nodeInfo.nodeType === 'SP') return 'Start';
    if (nodeInfo.nodeType === 'EP') return 'End';
    return `CP${nodeInfo.node.order - 1} (${nodeInfo.targetHitIndex})`;
  };

  return (
    <View style={styles.container}>
      <AppText color="textSecondary" variant="activeTab" style={styles.title}>
        ROUTE PROGRESS
      </AppText>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {sequence.map((seq, i) => {
          const isActive = i === activeIndex;
          const isComplete = i < activeIndex;

          return (
            <View key={`seq-${i}`} style={styles.stepContainer}>
              {i > 0 && (
                <View
                  style={[
                    styles.connector,
                    isComplete || isActive ? styles.connectorActive : null,
                  ]}
                />
              )}

              <View style={styles.nodeWrapper}>
                {isActive && (
                  <Animated.View
                    style={[
                      styles.activePulse,
                      {
                        transform: [{ scale: pulseAnim }],
                        opacity: pulseAnim.interpolate({
                          inputRange: [1, 1.5],
                          outputRange: [0.5, 0],
                        }),
                      },
                    ]}
                  />
                )}
                <View
                  style={[
                    styles.node,
                    isComplete
                      ? styles.nodeComplete
                      : isActive
                      ? styles.nodeActive
                      : styles.nodeUpcoming,
                  ]}
                >
                  {isComplete ? (
                    <Ionicons
                      name="checkmark"
                      color={Colors.black}
                      size={getWidth(16)}
                    />
                  ) : (
                    <AppText
                      color={isActive ? 'primary' : 'textMuted'}
                      variant="activeTab"
                    >
                      {i + 1}
                    </AppText>
                  )}
                </View>
              </View>

              <AppText
                color={
                  isActive ? 'primary' : isComplete ? 'textMain' : 'textMuted'
                }
                variant={isActive ? 'activeTab' : 'inActiveTab'}
                style={styles.label}
              >
                {getStepLabel(seq)}
              </AppText>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: getHeight(12),
    width: '100%',
  },
  title: {
    letterSpacing: 1.5,
    marginBottom: getHeight(12),
  },
  scrollContent: {
    paddingHorizontal: 0,
    alignItems: 'flex-start',
  },
  stepContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    width: getWidth(65),
  },
  connector: {
    position: 'absolute',
    top: getWidth(12) + getHeight(14),
    left: -getWidth(32.5),
    width: getWidth(65),
    height: getHeight(2),
    backgroundColor: Colors.borderLight,
    zIndex: -1,
  },
  connectorActive: {
    backgroundColor: Colors.primary,
  },
  nodeWrapper: {
    height: getWidth(24) + getHeight(28),
    justifyContent: 'center',
    alignItems: 'center',
  },
  activePulse: {
    position: 'absolute',
    width: getWidth(24),
    height: getWidth(24),
    borderRadius: getWidth(12),
    backgroundColor: Colors.primary,
  },
  node: {
    width: getWidth(24),
    height: getWidth(24),
    borderRadius: getWidth(12),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 2,
    zIndex: 2,
  },
  nodeComplete: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  nodeActive: {
    backgroundColor: Colors.black,
    borderColor: Colors.primary,
  },
  nodeUpcoming: {
    borderColor: Colors.borderLight,
    backgroundColor: 'transparent',
  },
  label: {
    textAlign: 'center',
    marginTop: -getHeight(8),
  },
});
