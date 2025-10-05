import { useState, useEffect, useRef, useCallback } from 'react';
import { Alert, Platform, PermissionsAndroid } from 'react-native';
import AudioRecord from 'react-native-audio-record';

const MAX_RECORD_SECONDS = 10;

export const useAudioRecording = (onRecordingComplete: (audioUri: string) => void) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const recordTimerRef = useRef<any | null>(null);

  useEffect(() => {
    AudioRecord.init({
      sampleRate: 44100,
      channels: 1,
      bitsPerSample: 16,
      audioSource: 6,
      wavFile: `songscope_record_${Date.now()}.wav`,
    });
  }, []);

  const requestAndroidPermission = useCallback(async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        {
          title: 'Microphone Permission',
          message: 'נדרש גישה למיקרופון כדי לזהות שירים מתוך הסביבה',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn(err);
      return false;
    }
  }, []);

  const startRecording = useCallback(async () => {
    if (Platform.OS === 'android') {
      const ok = await requestAndroidPermission();
      if (!ok) {
        Alert.alert('הרשאה נדחתה', 'אין אפשרות להשתמש במיקרופון ללא הרשאה');
        return;
      }
    }
    setRecordSeconds(0);
    setIsRecording(true);
    AudioRecord.start();
    recordTimerRef.current = setInterval(() => {
      setRecordSeconds((s) => {
        const next = s + 1;
        if (next >= MAX_RECORD_SECONDS) {
          stopRecording();
        }
        return next;
      });
    }, 1000) as any;
  }, [requestAndroidPermission, onRecordingComplete]);

  const stopRecording = useCallback(async () => {
    try {
      const audioFile = await AudioRecord.stop();
      if (recordTimerRef.current) {
        clearInterval(recordTimerRef.current);
        recordTimerRef.current = null;
      }
      setIsRecording(false);
      setRecordSeconds(0);

      let filePath = audioFile;
      if (!filePath.startsWith('file://')) {
        filePath = `file://${filePath}`;
      }
      onRecordingComplete(filePath);
    } catch (error) {
      console.error(`stopRecording error: ${String(error)}`);
      Alert.alert('שגיאה', 'לא ניתן לעצור את ההקלטה');
      setIsRecording(false);
    }
  }, [onRecordingComplete]);

  return { isRecording, recordSeconds, startRecording, stopRecording, MAX_RECORD_SECONDS };
};
