import React from 'react';
import { View, Text, StyleSheet, Animated, Easing, Alert, SafeAreaView, StatusBar, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import DocumentPicker from 'react-native-document-picker';
import PrimaryButton from '../components/PrimaryButton';
import RecordingButton from '../components/RecordingButton';
import { useAudioRecording } from '../hooks/useAudioRecording';

// Define your RootStackParamList
type RootStackParamList = {
  Home: undefined;
  Processing: { audioUri: string };
};

const HomeScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const animatedValue = React.useRef(new Animated.Value(0)).current;

  const handleRecordingComplete = (audioUri: string) => {
    navigation.navigate('Processing', { audioUri });
  };

  const { isRecording, recordSeconds, startRecording, stopRecording, MAX_RECORD_SECONDS } = useAudioRecording(handleRecordingComplete);

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
        type: [DocumentPicker.types.audio],
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
          <PrimaryButton
            title="בחר קובץ MP3"
            iconName="upload"
            onPress={handleFileUpload}
          />

          <RecordingButton
            isRecording={isRecording}
            onPress={() => (isRecording ? stopRecording() : startRecording())}
            recordSeconds={recordSeconds}
            maxRecordSeconds={MAX_RECORD_SECONDS}
          />
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
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  wave: {
    position: 'absolute',
    width: '200%',
    height: 300,
    backgroundColor: 'rgba(30, 215, 96, 0.1)',
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
    color: '#1DB954',
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
});

export default HomeScreen;
