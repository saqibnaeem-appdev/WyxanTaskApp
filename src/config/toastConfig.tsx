import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Colors } from '@theme/colors';
import { getWidth, getHeight } from '@theme/responsive';
import { AppText } from '@components/ui/AppText';

// A custom beautifully styled component matching AppCard aesthetic
const CustomToastCard = ({ 
  text1, 
  text2, 
  iconName, 
  iconColor, 
  hide 
}: { 
  text1: string; 
  text2?: string; 
  iconName: string; 
  iconColor: string; 
  hide: () => void;
}) => (
  <View style={styles.toastContainer}>
    <View style={[styles.iconBox, { borderColor: iconColor + '40', backgroundColor: iconColor + '15' }]}>
      <Ionicons name={iconName} color={iconColor} size={24} />
    </View>
    <View style={styles.textStack}>
      <AppText style={styles.text1}>{text1}</AppText>
      {text2 ? <AppText color="textSecondary" style={styles.text2}>{text2}</AppText> : null}
    </View>
    <TouchableOpacity onPress={hide} style={styles.closeBtn}>
      <Ionicons name="close" color={Colors.textSecondary} size={20} />
    </TouchableOpacity>
  </View>
);

export const toastConfig = {
  success: (props: any) => (
    <CustomToastCard 
      {...props} 
      iconName="checkmark-circle" 
      iconColor={Colors.primary} 
    />
  ),
  error: (props: any) => (
    <CustomToastCard 
      {...props} 
      iconName="alert-circle" 
      iconColor={Colors.danger} 
    />
  ),
  info: (props: any) => (
    <CustomToastCard 
      {...props} 
      iconName="information-circle" 
      iconColor="#3498db" 
    />
  ),
  warn: (props: any) => (
    <CustomToastCard 
      {...props} 
      iconName="warning" 
      iconColor="#f1c40f" 
    />
  ),
};

const styles = StyleSheet.create({
  toastContainer: {
    width: '90%',
    backgroundColor: Colors.surface,
    borderRadius: getHeight(16),
    padding: getWidth(12),
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  iconBox: {
    width: getWidth(40),
    height: getWidth(40),
    borderRadius: getHeight(12),
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    marginRight: getWidth(12),
  },
  textStack: {
    flex: 1,
    justifyContent: 'center',
  },
  text1: {
    fontSize: 14,
    fontWeight: '600',
  },
  text2: {
    fontSize: 12,
    marginTop: 2,
  },
  closeBtn: {
    padding: 4,
  }
});
