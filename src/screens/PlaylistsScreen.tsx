import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, StatusBar, Platform, Alert, TextInput, Modal } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MaterialDesignIcons from 'react-native-vector-icons/MaterialCommunityIcons';
type Song = {
  id: string;
  title: string;
  artist: string;
  albumCover: string;
};

type Playlist = {
  id: string;
  name: string;
  songs: Song[];
};

type RootStackParamList = {
  Home: undefined;
  Processing: undefined;
  Result: { song: any };
  History: undefined;
  Favorites: undefined;
  Playlists: undefined;
  PlaylistDetail: { playlist: Playlist };
};

type PlaylistsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Playlists'>;

type Props = {
  navigation: PlaylistsScreenNavigationProp;
};

const PlaylistsScreen: React.FC<Props> = ({ navigation }) => {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');

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
    const unsubscribe = navigation.addListener('focus', () => {
      loadPlaylists();
    });

    return unsubscribe;
  }, [navigation, loadPlaylists]);

  const createPlaylist = async () => {
    if (newPlaylistName.trim() === '') {
      Alert.alert('שגיאה', 'שם הפלייליסט לא יכול להיות ריק.');
      return;
    }
    try {
      const newPlaylist: Playlist = {
        id: Date.now().toString(),
        name: newPlaylistName.trim(),
        songs: [],
      };
      const updatedPlaylists = [...playlists, newPlaylist];
      await AsyncStorage.setItem('userPlaylists', JSON.stringify(updatedPlaylists));
      setPlaylists(updatedPlaylists);
      setNewPlaylistName('');
      setModalVisible(false);
    } catch (error) {
      console.error('Failed to create playlist:', error);
    }
  };

  const deletePlaylist = async (id: string) => {
    Alert.alert(
      'מחק פלייליסט',
      'האם אתה בטוח שברצונך למחוק פלייליסט זה?',
      [
        {
          text: 'ביטול',
          style: 'cancel',
        },
        {
          text: 'מחק',
          onPress: async () => {
            try {
              const updatedPlaylists = playlists.filter(playlist => playlist.id !== id);
              await AsyncStorage.setItem('userPlaylists', JSON.stringify(updatedPlaylists));
              setPlaylists(updatedPlaylists);
            } catch (error) {
              console.error('Failed to delete playlist:', error);
            }
          },
          style: 'destructive',
        },
      ],
      { cancelable: true }
    );
  };

  const renderItem = ({ item }: { item: Playlist }) => (
    <TouchableOpacity
      style={styles.playlistItem}
      onPress={() => navigation.navigate('PlaylistDetail', { playlist: item })}
      onLongPress={() => deletePlaylist(item.id)}
    >
      <MaterialDesignIcons name="playlist-music" size={30} color="#1DB954" />
      <Text style={styles.playlistName}>{item.name}</Text>
      <Text style={styles.songCount}>{item.songs.length} שירים</Text>
      <TouchableOpacity onPress={() => deletePlaylist(item.id)} style={styles.deleteButton}>
        <Icon name="delete" size={24} color="#FF6347" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#121212" />
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <Text style={styles.header}>רשימות השמעה</Text>
          <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.createPlaylistButton}>
            <MaterialDesignIcons name="plus-circle-outline" size={28} color="#E0E0E0" />
            <Text style={styles.createPlaylistButtonText}>צור פלייליסט</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={playlists}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialDesignIcons name="playlist-music" size={50} color="#B0B0B0" />
              <Text style={styles.emptyText}>אין רשימות השמעה עדיין.</Text>
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
              <Text style={styles.modalTitle}>צור פלייליסט חדש</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="שם הפלייליסט"
                placeholderTextColor="#B0B0B0"
                value={newPlaylistName}
                onChangeText={setNewPlaylistName}
              />
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.buttonCancel]}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.textStyle}>ביטול</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.buttonCreate]}
                  onPress={createPlaylist}
                >
                  <Text style={styles.textStyle}>צור</Text>
                </TouchableOpacity>
              </View>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 15,
    marginVertical: 20,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#E0E0E0',
  },
  createPlaylistButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 5,
    backgroundColor: '#333',
  },
  createPlaylistButtonText: {
    color: '#E0E0E0',
    marginLeft: 5,
    fontSize: 16,
  },
  listContent: {
    paddingHorizontal: 15,
    paddingBottom: 20,
  },
  playlistItem: {
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
  playlistName: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#E0E0E0',
    marginLeft: 15,
  },
  songCount: {
    fontSize: 14,
    color: '#B0B0B0',
    marginRight: 10,
  },
  deleteButton: {
    padding: 5,
    marginLeft: 10,
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
  },
  modalTitle: {
    marginBottom: 15,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
    color: '#E0E0E0',
  },
  modalInput: {
    backgroundColor: '#282828',
    borderRadius: 10,
    padding: 10,
    width: 250,
    marginBottom: 15,
    color: '#E0E0E0',
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    borderRadius: 10,
    padding: 10,
    elevation: 2,
    flex: 1,
    marginHorizontal: 5,
  },
  buttonCancel: {
    backgroundColor: '#FF6347',
  },
  buttonCreate: {
    backgroundColor: '#1DB954',
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 16,
  },
});

export default PlaylistsScreen;
