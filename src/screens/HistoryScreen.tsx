import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, SafeAreaView, StatusBar, Platform, Alert, TextInput, Modal } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import MaterialDesignIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RNFS from 'react-native-fs';
import Share from 'react-native-share';

type HistoryItem = {
  id: string;
  title: string;
  artist: string;
  albumCover: string;
  // Add other relevant song details here if needed for navigation to ResultScreen
};

type Song = {
  id: string;
  title: string;
  artist: string;
  albumCover: string;
  album?: string;
  previewUrl?: string | null;
  spotifyUrl?: string | null;
  lyricsUrl?: string | null;
  geminiAnalysis?: any; // Define a more specific type if available
  wikipediaSummary?: string;
  artistGenres?: string[];
};

type Playlist = {
  id: string;
  name: string;
  songs: Song[];
};

type RootStackParamList = {
  Home: undefined;
  Processing: undefined;
  Result: { song: any }; // Define a more specific type for song if possible
  History: undefined;
};

type HistoryScreenNavigationProp = StackNavigationProp<RootStackParamList, 'History'>;

type Props = {
  navigation: HistoryScreenNavigationProp;
};

const HistoryScreen: React.FC<Props> = ({ navigation }) => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [modalVisible, setModalVisible] = useState(false);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [selectedSongForPlaylist, setSelectedSongForPlaylist] = useState<HistoryItem | null>(null);

  const loadHistory = useCallback(async () => {
    try {
      const storedHistory = await AsyncStorage.getItem('songRecognitionHistory');
      if (storedHistory) {
        setHistory(JSON.parse(storedHistory));
      }
    } catch (error) {
      console.error(`Failed to load history: ${String(error)}`);
    }
  }, []);

  const loadPlaylists = useCallback(async () => {
    try {
      const storedPlaylists = await AsyncStorage.getItem('userPlaylists');
      if (storedPlaylists) {
        setPlaylists(JSON.parse(storedPlaylists));
      }
    } catch (error) {
      console.error(`Failed to load playlists: ${String(error)}`);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadHistory();
      loadPlaylists();
    });

    return unsubscribe;
  }, [navigation, loadHistory, loadPlaylists]);

  const clearHistory = async () => {
    Alert.alert(
      'מחק היסטוריה',
      'האם אתה בטוח שברצונך למחוק את כל היסטוריית הזיהויים?',
      [
        {
          text: 'ביטול',
          style: 'cancel',
        },
        {
          text: 'מחק',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('songRecognitionHistory');
              setHistory([]);
            } catch (error) {
              console.error(`Failed to clear history: ${String(error)}`);
            }
          },
          style: 'destructive',
        },
      ],
      { cancelable: true }
    );
  };

  const deleteHistoryItem = async (id: string) => {
    Alert.alert(
      'מחק פריט',
      'האם אתה בטוח שברצונך למחוק פריט זה מההיסטוריה?',
      [
        {
          text: 'ביטול',
          style: 'cancel',
        },
        {
          text: 'מחק',
          onPress: async () => {
            try {
              const updatedHistory = history.filter(item => item.id !== id);
              await AsyncStorage.setItem('songRecognitionHistory', JSON.stringify(updatedHistory));
              setHistory(updatedHistory);
            } catch (error) {
              console.error(`Failed to delete history item: ${String(error)}`);
            }
          },
          style: 'destructive',
        },
      ],
      { cancelable: true }
    );
  };

  const handleAddToPlaylist = (song: HistoryItem) => {
    setSelectedSongForPlaylist(song);
    setModalVisible(true);
  };

  const addSongToPlaylist = async (playlistId: string) => {
    if (!selectedSongForPlaylist) return;

    try {
      const storedPlaylists = await AsyncStorage.getItem('userPlaylists');
      let allPlaylists: Playlist[] = storedPlaylists ? JSON.parse(storedPlaylists) : [];

      const targetPlaylistIndex = allPlaylists.findIndex(p => p.id === playlistId);

      if (targetPlaylistIndex !== -1) {
        const targetPlaylist = allPlaylists[targetPlaylistIndex];
        const songToAdd: Song = {
          id: selectedSongForPlaylist.id,
          title: selectedSongForPlaylist.title,
          artist: selectedSongForPlaylist.artist,
          albumCover: selectedSongForPlaylist.albumCover,
          // Add other relevant song details if available in HistoryItem
        };

        if (!targetPlaylist.songs.some(s => s.id === songToAdd.id)) {
          targetPlaylist.songs.unshift(songToAdd);
          allPlaylists[targetPlaylistIndex] = targetPlaylist;
          await AsyncStorage.setItem('userPlaylists', JSON.stringify(allPlaylists));
          Alert.alert('נוסף לפלייליסט', `${selectedSongForPlaylist.title} נוסף לפלייליסט ${targetPlaylist.name}.`);
        } else {
          Alert.alert('כבר קיים', `${selectedSongForPlaylist.title} כבר קיים בפלייליסט ${targetPlaylist.name}.`);
        }
      } else {
        Alert.alert('שגיאה', 'הפלייליסט לא נמצא.');
      }
      setModalVisible(false);
      setSelectedSongForPlaylist(null);
    } catch (error) {
      console.error(`Failed to add song to playlist: ${String(error)}`);
    }
  };

  const exportHistory = async () => {
    if (history.length === 0) {
      Alert.alert('אין היסטוריה', 'אין פריטים לייצוא בהיסטוריה.');
      return;
    }

    const header = 'ID,Title,Artist,Album Cover URL\n';
    const csvContent = history.map(item =>
      `"${item.id}","${item.title.replace(/"/g, '""')}","${item.artist.replace(/"/g, '""')}","${item.albumCover}"`
    ).join('\n');
    const fullCsv = header + csvContent;

    const path = `${RNFS.DocumentDirectoryPath}/song_recognition_history.csv`;

    try {
      await RNFS.writeFile(path, fullCsv, 'utf8');
  console.log('CSV written to:', String(path));

      const shareOptions = {
        title: 'שתף היסטוריית זיהויים',
        url: `file://${path}`,
        type: 'text/csv',
        subject: 'היסטוריית זיהוי שירים',
      };

      await Share.open(shareOptions);
    } catch (error) {
      console.error(`Error exporting history: ${String(error)}`);
      Alert.alert('שגיאה', 'אירעה שגיאה בעת ייצוא ההיסטוריה.');
    }
  };

  const filteredHistory = history.filter(item =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.artist.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderItem = ({ item }: { item: HistoryItem }) => (
    <TouchableOpacity
      style={styles.historyItem}
      onPress={() => navigation.navigate('Result', { song: item })}
      onLongPress={() => deleteHistoryItem(item.id)}
    >
      <Image source={{ uri: item.albumCover }} style={styles.albumCover} />
      <View style={styles.textContainer}>
        <Text style={styles.songTitle}>{item.title}</Text>
        <Text style={styles.artistName}>{item.artist}</Text>
      </View>
      <View style={styles.itemActions}>
        <TouchableOpacity onPress={() => handleAddToPlaylist(item)} style={styles.addToPlaylistButton}>
          <MaterialDesignIcons name="playlist-plus" size={24} color="#2ECC71" /> {/* Changed color slightly */}
        </TouchableOpacity>
        <TouchableOpacity onPress={() => deleteHistoryItem(item.id)} style={styles.deleteButton}>
          <Icon name="delete" size={24} color="#FF6347" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#121212" />
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <Text style={styles.header}>היסטוריית זיהויים</Text>
        </View>
        {history.length > 0 && (
          <View style={styles.topActionsContainer}>
            <TouchableOpacity onPress={exportHistory} style={styles.headerActionButton}>
              <Icon name="share" size={24} color="#E0E0E0" />
              <Text style={styles.headerActionButtonText}>ייצוא</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={clearHistory} style={styles.headerActionButton}>
              <Icon name="clear-all" size={24} color="#E0E0E0" />
              <Text style={styles.headerActionButtonText}>נקה הכל</Text>
            </TouchableOpacity>
          </View>
        )}
        <TextInput
          style={styles.searchInput}
          placeholder="חפש שיר או אמן..."
          placeholderTextColor="#B0B0B0"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <FlatList
          data={filteredHistory}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Icon name="history" size={50} color="#B0B0B0" />
              <Text style={styles.emptyText}>
                {searchQuery ? 'לא נמצאו תוצאות לחיפוש.' : 'אין היסטוריית זיהויים עדיין.'}
              </Text>
            </View>
          }
        />

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
    backgroundColor: '#121212',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 15,
    marginVertical: 20,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#E0E0E0',
  },
  topActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    marginHorizontal: 15,
  },
  headerActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#333',
    marginHorizontal: 5,
  },
  headerActionButtonText: {
    color: '#E0E0E0',
    marginLeft: 5,
    fontSize: 14,
    fontWeight: '600',
  },
  searchInput: {
    backgroundColor: '#1E1E1E',
    color: '#E0E0E0',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 10,
    marginHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
  },
  listContent: {
    paddingHorizontal: 15,
    paddingBottom: 20,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E1E1E',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  albumCover: {
    width: 60,
    height: 60,
    borderRadius: 5,
    marginRight: 15,
  },
  textContainer: {
    flex: 1,
  },
  songTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#E0E0E0',
  },
  artistName: {
    fontSize: 14,
    color: '#B0B0B0',
    marginTop: 2,
  },
  deleteButton: {
    padding: 5,
  },
  addToPlaylistButton: {
    padding: 5,
    marginRight: 5, // Add margin between buttons
  },
  itemActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 'auto', // Push actions to the right
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },
  emptyText: {
    color: '#B0B0B0',
    fontSize: 16,
    marginTop: 10,
    textAlign: 'center',
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

export default HistoryScreen;
