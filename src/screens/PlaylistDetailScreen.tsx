import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, SafeAreaView, StatusBar, Platform, Alert } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

type PlaylistDetailScreenRouteProp = RouteProp<RootStackParamList, 'PlaylistDetail'>;
type PlaylistDetailScreenNavigationProp = StackNavigationProp<RootStackParamList, 'PlaylistDetail'>;

interface PlaylistDetailScreenProps {
  route: PlaylistDetailScreenRouteProp;
  navigation: PlaylistDetailScreenNavigationProp;
}

const PlaylistDetailScreen: React.FC<PlaylistDetailScreenProps> = ({ route, navigation }) => {
  const { playlist: initialPlaylist } = route.params;
  const [playlist, setPlaylist] = useState<Playlist>(initialPlaylist);

  const loadPlaylist = useCallback(async () => {
    try {
      const storedPlaylists = await AsyncStorage.getItem('userPlaylists');
      if (storedPlaylists) {
        const allPlaylists: Playlist[] = JSON.parse(storedPlaylists);
        const currentPlaylist = allPlaylists.find(p => p.id === initialPlaylist.id);
        if (currentPlaylist) {
          setPlaylist(currentPlaylist);
        }
      }
    } catch (error) {
      console.error('Failed to load playlist details:', error);
    }
  }, [initialPlaylist.id]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadPlaylist();
    });

    return unsubscribe;
  }, [navigation, loadPlaylist]);

  const removeSongFromPlaylist = async (songId: string) => {
    Alert.alert(
      'הסר שיר',
      'האם אתה בטוח שברצונך להסיר שיר זה מהפלייליסט?',
      [
        {
          text: 'ביטול',
          style: 'cancel',
        },
        {
          text: 'הסר',
          onPress: async () => {
            try {
              const updatedSongs = playlist.songs.filter(song => song.id !== songId);
              const updatedPlaylist = { ...playlist, songs: updatedSongs };

              const storedPlaylists = await AsyncStorage.getItem('userPlaylists');
              let allPlaylists: Playlist[] = storedPlaylists ? JSON.parse(storedPlaylists) : [];

              allPlaylists = allPlaylists.map(p =>
                p.id === updatedPlaylist.id ? updatedPlaylist : p
              );

              await AsyncStorage.setItem('userPlaylists', JSON.stringify(allPlaylists));
              setPlaylist(updatedPlaylist);
            } catch (error) {
              console.error('Failed to remove song from playlist:', error);
            }
          },
          style: 'destructive',
        },
      ],
      { cancelable: true }
    );
  };

  const renderItem = ({ item }: { item: Song }) => (
    <TouchableOpacity
      style={styles.songItem}
      onPress={() => navigation.navigate('Result', { song: item })}
      onLongPress={() => removeSongFromPlaylist(item.id)}
    >
      <Image source={{ uri: item.albumCover }} style={styles.albumCover} />
      <View style={styles.textContainer}>
        <Text style={styles.songTitle}>{item.title}</Text>
        <Text style={styles.artistName}>{item.artist}</Text>
      </View>
      <TouchableOpacity onPress={() => removeSongFromPlaylist(item.id)} style={styles.removeButton}>
        <Icon name="minus-circle-outline" size={24} color="#FF6347" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#121212" />
      <View style={styles.container}>
        <Text style={styles.header}>{playlist.name}</Text>
        <FlatList
          data={playlist.songs}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Icon name="music-note" size={50} color="#B0B0B0" />
              <Text style={styles.emptyText}>אין שירים בפלייליסט זה עדיין.</Text>
            </View>
          }
        />
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
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
    color: '#E0E0E0',
  },
  listContent: {
    paddingHorizontal: 15,
    paddingBottom: 20,
  },
  songItem: {
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
  removeButton: {
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
});

export default PlaylistDetailScreen;
