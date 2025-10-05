import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated, Easing, Alert, SafeAreaView, StatusBar, Platform } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import axios from 'axios'; // Import axios for calling the local server

const LOCAL_SERVER_URL = 'https://songai-v0kl.onrender.com'; // Define local server URL

type RootStackParamList = {
  Home: undefined;
  Processing: { audioUri: string };
  Result: { song: any };
  History: undefined;
};

type ProcessingScreenRouteProp = RouteProp<RootStackParamList, 'Processing'>;
type ProcessingScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Processing'>;

type Props = {
  navigation: ProcessingScreenNavigationProp;
  route: ProcessingScreenRouteProp;
};

const ProcessingScreen: React.FC<Props> = ({ navigation, route }) => {
  const { audioUri } = route.params;
  const animatedValue = React.useRef(new Animated.Value(0)).current;
  const [processingText, setProcessingText] = useState('מזהים את השיר שלך עם AI...');

  useEffect(() => {
    Animated.loop(
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    const processAudio = async () => {
      try {
        setProcessingText('שולח קובץ אודיו לשרת...');

        const formData = new FormData();

        // Determine file name and mime type from the URI/extension
        const getMimeType = (uri: string) => {
          const lower = uri.toLowerCase();
          if (lower.endsWith('.mp3')) return { name: `audio_${Date.now()}.mp3`, type: 'audio/mpeg' };
          if (lower.endsWith('.m4a') || lower.endsWith('.mp4')) return { name: `audio_${Date.now()}.m4a`, type: 'audio/mp4' };
          if (lower.endsWith('.wav')) return { name: `audio_${Date.now()}.wav`, type: 'audio/wav' };
          if (lower.endsWith('.aac')) return { name: `audio_${Date.now()}.aac`, type: 'audio/aac' };
          if (lower.endsWith('.ogg')) return { name: `audio_${Date.now()}.ogg`, type: 'audio/ogg' };
          // Fallback
          return { name: `audio_${Date.now()}.mp3`, type: 'audio/mpeg' };
        };

        const { name, type } = getMimeType(audioUri);
        formData.append('audio', { uri: audioUri, name, type } as any);

        const response = await axios.post(`${LOCAL_SERVER_URL}/upload-audio`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        const { analysis, ai_analysis, lyrics_url, wikipedia_summary } = response.data;

        if (analysis && analysis.song !== "unknown") {
          const songData = {
            title: analysis.song,
            artist: analysis.artist,
            album: analysis.album,
            albumCover: analysis.cover,
            previewUrl: analysis.preview_url,
            spotifyUrl: analysis.spotify_url,
            lyricsUrl: lyrics_url,
            geminiAnalysis: {
              genre: ai_analysis.genre,
              mood: ai_analysis.mood,
              dominantInstruments: ai_analysis.prominent_instruments.join(', '),
              similarArtists: ai_analysis.similar_artists,
              whenToListen: ai_analysis.mood_match,
            },
            wikipediaSummary: wikipedia_summary,
            artistGenres: [], // The server doesn't return artist genres directly, so we'll leave this empty for now or fetch separately if needed.
          };

          navigation.replace('Result', { song: songData });
        } else {
          Alert.alert('שגיאה', 'לא נמצא מידע על השיר.');
          navigation.goBack();
        }
      } catch (error) {
        let errorMessage = 'אירעה שגיאה במהלך עיבוד השיר.';
        if (axios.isAxiosError(error) && error.code === 'ERR_NETWORK') {
          errorMessage += ' אנא ודא שהשרת המקומי פועל (http://192.168.1.142:3000).';
        }
        Alert.alert('שגיאה', errorMessage);
        console.error('Error processing audio with local server:', error);
        navigation.goBack();
      }
    };

    processAudio();
  }, [animatedValue, audioUri, navigation]);

  const rotate = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#121212" />
      <View style={styles.container}>
        <Animated.View style={[styles.spinner, { transform: [{ rotate }] }]} />
        <Text style={styles.processingText}>{processingText}</Text>
        <Text style={styles.subText}>אנא המתן בזמן שאנו מזהים את השיר...</Text>
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
  spinner: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 5,
    borderColor: '#1DB954',
    borderTopColor: 'transparent',
    marginBottom: 20,
  },
  processingText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#E0E0E0',
    marginBottom: 10,
    textAlign: 'center',
  },
  subText: {
    fontSize: 16,
    color: '#B0B0B0',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});

export default ProcessingScreen;
