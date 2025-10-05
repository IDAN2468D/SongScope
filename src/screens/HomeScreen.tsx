import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Easing, Alert, SafeAreaView, StatusBar, Platform, PermissionsAndroid } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import DocumentPicker from 'react-native-document-picker';
import AudioRecord from 'react-native-audio-record';
import RNFS from 'react-native-fs';

// Define your RootStackParamList
type RootStackParamList = {
  Home: undefined;
  Processing: { audioUri: string };
};

const HomeScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const animatedValue = React.useRef(new Animated.Value(0)).current;
  const [isRecording, setIsRecording] = React.useState(false);
  const [recordSeconds, setRecordSeconds] = React.useState(0);
  const MAX_RECORD_SECONDS = 10;
  const recordTimerRef = React.useRef<any | null>(null);

  React.useEffect(() => {
    // configure AudioRecord
    AudioRecord.init({
      sampleRate: 44100,
      channels: 1,
      bitsPerSample: 16,
      audioSource: 6,
      wavFile: `songscope_record_${Date.now()}.wav`,
    });
  }, []);

  React.useEffect(() => {
    Animated.loop(
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 4000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, [animatedValue]);

  const wave1TranslateX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -100],
  });

  const wave2TranslateX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [-100, 0],
  });

  const handleFileUpload = async () => {
    try {
      const res = await DocumentPicker.pickSingle({
        type: [DocumentPicker.types.audio], // ✅ רק קבצי אודיו (כולל MP3)
      });

      if (res.uri) {
        navigation.navigate('Processing', { audioUri: res.uri });
      }
    } catch (err: any) {
      if (DocumentPicker.isCancel(err)) {
        console.log('User cancelled file picker');
      } else {
        Alert.alert('Error', 'Failed to pick audio file.');
        console.error(`DocumentPicker Error: ${String(err)}`);
      }
    }
  };

  const requestAndroidPermission = async () => {
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
  };

  const startRecording = async () => {
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
  };

  const stopRecording = async () => {
    try {
      const audioFile = await AudioRecord.stop(); // returns file path
      if (recordTimerRef.current) {
        clearInterval(recordTimerRef.current);
        recordTimerRef.current = null;
      }
      setIsRecording(false);
      setRecordSeconds(0);

      // audioFile is a relative filename inside app's files directory on Android
      // try to resolve a usable file URI
      let filePath = audioFile;
      if (!filePath.startsWith('file://')) {
        filePath = `file://${filePath}`;
      }

      navigation.navigate('Processing', { audioUri: filePath });
    } catch (error) {
      console.error(`stopRecording error: ${String(error)}`);
      Alert.alert('שגיאה', 'לא ניתן לעצור את ההקלטה');
      setIsRecording(false);
    }
  };

  // Recording functions removed: show fallback message
  const handleRecordFallback = () => {
    Alert.alert(
      'הקלטה לא זמינה',
      'תמיכה בהקלטה פנימית הוסרה זמנית למניעת בעיות בנייה. בחר קובץ אודיו מהמכשיר או הקלט דוגמית באמצעות אפליקציית הקלטות חיצונית ואז העלה את הקובץ כאן.',
      [
        { text: 'בחר קובץ', onPress: () => handleFileUpload() },
        { text: 'סגור', style: 'cancel' },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#121212" />
      <View style={styles.container}>
        <Animated.View style={[styles.wave, { transform: [{ translateX: wave1TranslateX }] }]} />
        <Animated.View style={[styles.wave, styles.wave2, { transform: [{ translateX: wave2TranslateX }] }]} />

        <View style={styles.header}>
          <Text style={styles.headerText}>SongAI</Text>
        </View>

        <View style={styles.content}>
          <TouchableOpacity style={styles.mainButton} onPress={handleFileUpload}>
            <Icon name="upload" size={30} color="#fff" />
            <Text style={styles.mainButtonText}>בחר קובץ MP3</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.recordButton, isRecording ? styles.recording : null]}
            onPress={() => (isRecording ? stopRecording() : startRecording())}
          >
            <Icon name={isRecording ? 'microphone-off' : 'microphone'} size={24} color="#fff" />
            <Text style={styles.recordButtonText}>{isRecording ? 'עצור הקלטה' : 'זיהוי דרך המיקרופון'}</Text>
            {isRecording && (
              <View style={{ marginLeft: 12 }}>
                <Text style={{ color: '#fff', fontWeight: '600' }}>{`${recordSeconds}s / ${MAX_RECORD_SECONDS}s`}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#121212',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0, // Adjust for Android status bar
  },
  wave: {
    position: 'absolute',
    width: '200%',
    height: 300,
    backgroundColor: 'rgba(30, 215, 96, 0.1)', // Spotify green with transparency
    borderRadius: 200,
    opacity: 0.6,
    bottom: -100,
    left: -50,
  },
  wave2: {
    backgroundColor: 'rgba(29, 185, 84, 0.15)',
    bottom: -120,
    left: 50,
    width: '180%',
    height: 280,
  },
  header: {
    position: 'absolute',
    top: 50,
    width: '100%',
    alignItems: 'center',
  },
  headerText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#1DB954', // Spotify green
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 100,
  },
  mainButton: {
    flexDirection: 'row',
    backgroundColor: '#1DB954',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    elevation: 8, // Android shadow
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
  ctaButton: {
    backgroundColor: 'transparent',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#1DB954',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  ctaButtonText: {
    color: '#1DB954',
    fontSize: 18,
    fontWeight: 'bold',
  },
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

export default HomeScreen;
