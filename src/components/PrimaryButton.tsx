import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

type PrimaryButtonProps = {
  onPress: () => void;
  title: string;
  iconName?: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
};

const PrimaryButton: React.FC<PrimaryButtonProps> = ({ onPress, title, iconName, style, textStyle }) => {
  return (
    <TouchableOpacity style={[styles.mainButton, style]} onPress={onPress}>
      {iconName && <Icon name={iconName} size={30} color="#fff" />}
      <Text style={[styles.mainButtonText, textStyle]}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  mainButton: {
    flexDirection: 'row',
    backgroundColor: '#1DB954',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  mainButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 10,
  },
});

export default PrimaryButton;
