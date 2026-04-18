import React, { FC, ReactNode } from 'react';
import { View, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { getWidth, getHeight, getFontSize } from '@theme/responsive';
import { Colors } from '@theme/colors';

interface AppHeaderProps {
  leftNode?: ReactNode;
  centerNode?: ReactNode;
  rightNode?: ReactNode;
  showBackButton?: boolean;
  onBackPress?: () => void;
  style?: ViewStyle;
}

export const AppHeader: FC<AppHeaderProps> = ({
  leftNode,
  centerNode,
  rightNode,
  showBackButton = false,
  onBackPress,
  style
}) => {
  const navigation = useNavigation();

  const handleBack = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      navigation.goBack();
    }
  };

  return (
    <View style={[styles.container, style]}>
      {/* Left Slot */}
      <View style={styles.sideNode}>
        {showBackButton && !leftNode ? (
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <ArrowLeft color={Colors.textMain} size={getFontSize(24)} />
          </TouchableOpacity>
        ) : (
          leftNode
        )}
      </View>

      {/* Center Slot */}
      <View style={styles.centerNode}>
        {centerNode}
      </View>

      {/* Right Slot */}
      <View style={styles.sideNodeRight}>
        {rightNode}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    minHeight: getHeight(50),
    paddingHorizontal: getWidth(20),
    zIndex: 10,
  },
  sideNode: {
    flex: 1,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  centerNode: {
    flex: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sideNodeRight: {
    flex: 1,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  backButton: {
    width: getWidth(40),
    height: getWidth(40),
    borderRadius: getWidth(20),
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.borderLight,
  }
});
