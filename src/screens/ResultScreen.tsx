import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Linking, ActivityIndicator, Alert, SafeAreaView, StatusBar, Platform, Modal, FlatList } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { RouteProp } from '@react-navigation/native';
import Sound from 'react-native-sound';
import AsyncStorage from '@react-native-async-storage/async-storage';

type SongAnalysis = {
  genre: string;
  mood: string;
  dominantInstruments: string;
  similarArtists: string[];
  whenToListen: string;
};

type Song = {
  id: string; // Add id to Song type for playlist management
  title: string;
  artist: string;
  album: string;
  albumCover: string | null;
  previewUrl: string | null;
  spotifyUrl: string | null;
  lyricsUrl: string | null;
  geminiAnalysis: SongAnalysis;
  wikipediaSummary: string;
  artistGenres: string[];
};

type Playlist = {
  id: string;
  name: string;
  songs: Song[];
};

type ResultScreenRouteProp = RouteProp<{
  Result: { song: Song };
}, 'Result'>;

interface ResultScreenProps {
  route: ResultScreenRouteProp;
}

const ResultScreen = ({ route }: ResultScreenProps) => {
  const { song } = route.params;
  const [isPlaying, setIsPlaying] = useState(false);
  const [sound, setSound] = useState<Sound | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);

  const loadPlaylists = useCallback(async () => {
    try {
      const storedPlaylists = await AsyncStorage.getItem('userPlaylists');
      if (storedPlaylists) {
        setPlaylists(JSON.parse(storedPlaylists));
      }
    } catch (error) {
      console.error('Failed to load playlists:', error);
    }
  }, []);

  useEffect(() => {
    Sound.setCategory('Playback');

    if (song.previewUrl) {
      const newSound = new Sound(song.previewUrl, undefined, (error) => {
        if (error) {
    console.log('failed to load the sound', String(error));
          Alert.alert('שגיאה', 'לא ניתן לטעון את קטע התצוגה המקדימה.');
          return;
        }
        setSound(newSound);
      });
    }

    // Save the song to history when the component mounts
    saveSongToHistory(song);
    checkIfFavorite(song);
    loadPlaylists(); // Load playlists when the screen focuses

    return () => {
      if (sound) {
        sound.release();
      }
    };
  }, [song.previewUrl, loadPlaylists]);

  const checkIfFavorite = async (songToCheck: Song) => {
    try {
      const storedFavorites = await AsyncStorage.getItem('favoriteSongs');
      if (storedFavorites) {
        const favorites = JSON.parse(storedFavorites);
        setIsFavorite(favorites.some((item: { id: string; }) => item.id === (songToCheck.spotifyUrl || Date.now().toString())));
      }
    } catch (error) {
      console.error('Failed to check if favorite:', error);
    }
  };

  const toggleFavorite = async () => {
    try {
      const storedFavorites = await AsyncStorage.getItem('favoriteSongs');
      let favorites = storedFavorites ? JSON.parse(storedFavorites) : [];

      const favoriteItem = {
        id: song.spotifyUrl || Date.now().toString(),
        title: song.title,
        artist: song.artist,
        albumCover: song.albumCover,
        // Include other relevant song details for display in favorites screen
      };

      if (isFavorite) {
        // Remove from favorites
        favorites = favorites.filter((item: { id: string; }) => item.id !== favoriteItem.id);
        Alert.alert('הוסר ממועדפים', `${song.title} הוסר מהמועדפים.`);
      } else {
        // Add to favorites
        favorites.unshift(favoriteItem);
        Alert.alert('נוסף למועדפים', `${song.title} נוסף למועדפים!`);
      }
      await AsyncStorage.setItem('favoriteSongs', JSON.stringify(favorites));
      setIsFavorite(!isFavorite);
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  };

  const saveSongToHistory = async (songToSave: Song) => {
    try {
      const storedHistory = await AsyncStorage.getItem('songRecognitionHistory');
      let history = storedHistory ? JSON.parse(storedHistory) : [];

      // Ensure unique IDs for history items
      const historyItem = {
        id: songToSave.spotifyUrl || Date.now().toString(), // Use spotifyUrl as ID if available, otherwise timestamp
        title: songToSave.title,
        artist: songToSave.artist,
        albumCover: songToSave.albumCover,
        // Add other relevant song details here if needed for navigation to ResultScreen
        // Make sure to only store serializable data
      };

      // Prevent duplicate entries based on ID
      if (!history.some((item: { id: string; }) => item.id === historyItem.id)) {
        history.unshift(historyItem); // Add to the beginning of the array
        await AsyncStorage.setItem('songRecognitionHistory', JSON.stringify(history));
      }
    } catch (error) {
      console.error('Failed to save song to history:', error);
    }
  };

  const handleAddToPlaylist = () => {
    loadPlaylists(); // Ensure latest playlists are loaded
    setModalVisible(true);
  };

  const addSongToPlaylist = async (playlistId: string) => {
    try {
      const storedPlaylists = await AsyncStorage.getItem('userPlaylists');
      let allPlaylists: Playlist[] = storedPlaylists ? JSON.parse(storedPlaylists) : [];

      const targetPlaylistIndex = allPlaylists.findIndex(p => p.id === playlistId);

      if (targetPlaylistIndex !== -1) {
        const targetPlaylist = allPlaylists[targetPlaylistIndex];
        const songToAdd: Song = {
          id: song.spotifyUrl || Date.now().toString(),
          title: song.title,
          artist: song.artist,
          albumCover: song.albumCover,
          album: song.album, // Include album for playlist display
          previewUrl: song.previewUrl, // Include previewUrl for playlist display
          spotifyUrl: song.spotifyUrl, // Include spotifyUrl for playlist display
          lyricsUrl: song.lyricsUrl, // Include lyricsUrl for playlist display
          geminiAnalysis: song.geminiAnalysis, // Include geminiAnalysis for playlist display
          wikipediaSummary: song.wikipediaSummary, // Include wikipediaSummary for playlist display
          artistGenres: song.artistGenres, // Include artistGenres for playlist display
        };

        if (!targetPlaylist.songs.some(s => s.id === songToAdd.id)) {
          targetPlaylist.songs.unshift(songToAdd);
          allPlaylists[targetPlaylistIndex] = targetPlaylist;
          await AsyncStorage.setItem('userPlaylists', JSON.stringify(allPlaylists));
          Alert.alert('נוסף לפלייליסט', `${song.title} נוסף לפלייליסט ${targetPlaylist.name}.`);
        } else {
          Alert.alert('כבר קיים', `${song.title} כבר קיים בפלייליסט ${targetPlaylist.name}.`);
        }
      } else {
        Alert.alert('שגיאה', 'הפלייליסט לא נמצא.');
      }
      setModalVisible(false);
    } catch (error) {
      console.error('Failed to add song to playlist:', error);
    }
  };

  const handleListenOnSpotify = () => {
    if (song.spotifyUrl) {
      Linking.openURL(song.spotifyUrl);
    }
  };

  const handlePlayPreview = () => {
    if (sound) {
      if (isPlaying) {
        sound.pause();
      } else {
        sound.play((success) => {
          if (success) {
            console.log('successfully finished playing');
          } else {
            console.log('playback failed due to audio decoding errors');
            Alert.alert('שגיאה', 'השמעת קטע התצוגה המקדימה נכשלה.');
          }
          setIsPlaying(false);
        });
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleViewLyrics = () => {
    if (song.lyricsUrl) {
      Linking.openURL(song.lyricsUrl);
    }
  };

  const handleReadMoreWikipedia = () => {
    // For Wikipedia, we don't have a direct URL from Gemini, so we can construct one or just show the summary.
    // If you want to open a Wikipedia page, you'd need to get the actual Wikipedia URL during processing.
    // For now, we'll just rely on the summary.
    Alert.alert('ויקיפדיה', song.wikipediaSummary);
  };

  const renderAnalysisItem = (title: string, value: string | string[], emoji: string) => {
    if (!value || (Array.isArray(value) && value.length === 0)) return null;
    const displayValue = Array.isArray(value) ? value.join(', ') : value;
    return (
      <View style={styles.analysisItem}>
        <Text style={styles.analysisItemTitle}>{emoji} {title}:</Text>
        <Text style={styles.analysisItemValue}>{displayValue}</Text>
      </View>
    );
  };

  if (!song) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3cb371" />
        <Text style={styles.loadingText}>טוען תוצאות...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#121212" />
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollViewContent}>
        <View style={styles.header}>
          {song.albumCover ? (
            <Image source={{ uri: song.albumCover }} style={styles.albumCover} />
          ) : (
            <View style={styles.albumCoverPlaceholder}>
              <Icon name="music-note" size={80} color="#B0B0B0" />
            </View>
          )}
          <Text style={styles.songTitle}>{song.title}</Text>
          <Text style={styles.artistName}>{song.artist} - {song.album}</Text>
          <TouchableOpacity onPress={toggleFavorite} style={styles.favoriteButton}>
            <Icon name={isFavorite ? "heart" : "heart-outline"} size={30} color={isFavorite ? "#FF6347" : "#E0E0E0"} />
          </TouchableOpacity>
        </View>

        <View style={styles.actionsContainer}>
          {song.previewUrl && (
            <TouchableOpacity style={styles.actionButton} onPress={handlePlayPreview}>
              <Icon name={isPlaying ? "pause-circle-outline" : "play-circle-outline"} size={30} color="#1DB954" />
              <Text style={styles.actionButtonText}>השמע תצוגה מקדימה</Text>
            </TouchableOpacity>
          )}
          {song.spotifyUrl && (
            <TouchableOpacity style={styles.actionButton} onPress={handleListenOnSpotify}>
              <Icon name="spotify" size={30} color="#1DB954" />
              <Text style={styles.actionButtonText}>האזן בספוטיפיי</Text>
            </TouchableOpacity>
          )}
          {song.lyricsUrl && (
            <TouchableOpacity style={styles.actionButton} onPress={handleViewLyrics}>
              <Icon name="text-box-outline" size={30} color="#1DB954" />
              <Text style={styles.actionButtonText}>הצג מילים</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.actionButton} onPress={handleAddToPlaylist}>
            <Icon name="playlist-plus" size={30} color="#1DB954" />
            <Text style={styles.actionButtonText}>הוסף לפלייליסט</Text>
          </TouchableOpacity>
        </View>

        {song.geminiAnalysis && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>ניתוח AI</Text>
            <View style={styles.analysisContainer}>
              {renderAnalysisItem("ז'אנר", song.geminiAnalysis.genre, '🎵')}
              {renderAnalysisItem('מצב רוח', song.geminiAnalysis.mood, '😊')}
              {renderAnalysisItem('כלים דומיננטיים', song.geminiAnalysis.dominantInstruments, '🥁')}
              {renderAnalysisItem('אמנים דומים', song.geminiAnalysis.similarArtists, '🎤')}
              {renderAnalysisItem('מתי להאזין', song.geminiAnalysis.whenToListen, '🎧')}
            </View>
          </View>
        )}

        {(song.wikipediaSummary !== undefined && song.wikipediaSummary !== null) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>אודות השיר (ויקיפדיה)</Text>
            {song.wikipediaSummary.trim() !== '' ? (
              <Text style={styles.wikipediaText}>{song.wikipediaSummary}</Text>
            ) : (
              <Text style={styles.wikipediaText}>אין סיכום ויקיפדיה זמין.</Text>
            )}
            {/* <TouchableOpacity onPress={handleReadMoreWikipedia} style={styles.readMoreButton}>
              <Text style={styles.readMoreButtonText}>קרא עוד בוויקיפדיה</Text>
            </TouchableOpacity> */}
          </View>
        )}
      </ScrollView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>בחר פלייליסט</Text>
            {playlists.length > 0 ? (
              <FlatList
                data={playlists}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.playlistOption}
                    onPress={() => addSongToPlaylist(item.id)}
                  >
                    <Text style={styles.playlistOptionText}>{item.name}</Text>
                    <Icon name="chevron-right" size={24} color="#E0E0E0" />
                  </TouchableOpacity>
                )}
              />
            ) : (
              <Text style={styles.emptyPlaylistText}>אין פלייליסטים זמינים. צור אחד במסך הפלייליסטים.</Text>
            )}
            <TouchableOpacity
              style={[styles.modalButton, styles.buttonClose]}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.textStyle}>ביטול</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    backgroundColor: '#121212',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  scrollViewContent: {
    paddingBottom: 60, // Increased padding to the bottom of the scroll view content
  },
  header: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#1E1E1E',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    marginBottom: 20,
    elevation: 5,
  },
  albumCover: {
    width: 200,
    height: 200,
    borderRadius: 100,
    marginBottom: 15,
    borderWidth: 3,
    borderColor: '#1DB954',
    elevation: 10,
  },
  albumCoverPlaceholder: {
    width: 200,
    height: 200,
    borderRadius: 100,
    marginBottom: 15,
    backgroundColor: '#282828',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#1DB954',
    elevation: 10,
  },
  songTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#E0E0E0',
    textAlign: 'center',
    marginBottom: 5,
  },
  artistName: {
    fontSize: 18,
    color: '#B0B0B0',
    textAlign: 'center',
    marginBottom: 10,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    paddingHorizontal: 10,
    marginBottom: 30,
    flexWrap: 'wrap',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#282828',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 25,
    margin: 5,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  actionButtonText: {
    color: '#E0E0E0',
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 8,
  },
  section: {
    backgroundColor: '#1E1E1E',
    borderRadius: 15,
    marginHorizontal: 15,
    marginBottom: 20,
    padding: 20,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#E0E0E0',
    marginBottom: 15,
    textAlign: 'left',
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  chip: {
    backgroundColor: '#282828',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 15,
    margin: 5,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
  },
  chipText: {
    color: '#E0E0E0',
    fontSize: 14,
    marginLeft: 5,
    textAlign: 'left',
  },
  analysisContainer: {
    marginBottom: 10, // Add some space below the analysis items
  },
  analysisItem: {
    backgroundColor: '#282828',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  analysisItemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1DB954',
    marginBottom: 5,
    textAlign: 'left',
  },
  analysisItemValue: {
    fontSize: 15,
    color: '#E0E0E0',
    textAlign: 'left',
  },
  wikipediaText: {
    color: '#B0B0B0',
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'left',
  },
  readMoreButton: {
    marginTop: 15,
    alignSelf: 'flex-start',
  },
  readMoreButtonText: {
    color: '#1DB954',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
  },
  loadingText: {
    color: '#E0E0E0',
    marginTop: 10,
    fontSize: 18,
  },
  favoriteButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    padding: 10,
    zIndex: 1,
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: '#1E1E1E',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '80%',
    maxHeight: '70%',
  },
  modalTitle: {
    marginBottom: 15,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
    color: '#E0E0E0',
  },
  playlistOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    width: '100%',
  },
  playlistOptionText: {
    color: '#E0E0E0',
    fontSize: 18,
  },
  emptyPlaylistText: {
    color: '#B0B0B0',
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 20,
  },
  modalButton: {
    borderRadius: 10,
    padding: 10,
    elevation: 2,
    marginTop: 20,
    width: '100%',
  },
  buttonClose: {
    backgroundColor: '#FF6347',
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 16,
  },
});

export default ResultScreen;
