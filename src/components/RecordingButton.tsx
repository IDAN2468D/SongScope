import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

type RecordingButtonProps = {
  isRecording: boolean;
  onPress: () => void;
  recordSeconds: number;
  maxRecordSeconds: number;
};

const RecordingButton: React.FC<RecordingButtonProps> = ({ isRecording, onPress, recordSeconds, maxRecordSeconds }) => {
  return (
    <TouchableOpacity
      style={[styles.recordButton, isRecording ? styles.recording : null]}
      onPress={onPress}
    >
      <Icon name={isRecording ? 'microphone-off' : 'microphone'} size={24} color="#fff" />
      <Text style={styles.recordButtonText}>{isRecording ? 'עצור הקלטה' : 'זיהוי דרך המיקרופון'}</Text>
      {isRecording && (
        <View style={{ marginLeft: 12 }}>
          <Text style={{ color: '#fff', fontWeight: '600' }}>{`${recordSeconds}s / ${maxRecordSeconds}s`}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  recordButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#BB0000',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 30,
    marginTop: 16,
  },
  recording: {
    backgroundColor: '#FF3B30',
  },
  recordButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
});

export default RecordingButton;
