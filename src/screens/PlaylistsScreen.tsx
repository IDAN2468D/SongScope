import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, StatusBar, Platform } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import MaterialDesignIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import PlaylistItem from '../components/PlaylistItem';
import CreatePlaylistModal from '../components/CreatePlaylistModal';
import { usePlaylists } from '../hooks/usePlaylists';

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
  const { playlists, loadPlaylists, createPlaylist, deletePlaylist } = usePlaylists();
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadPlaylists();
    });

    return unsubscribe;
  }, [navigation, loadPlaylists]);

  const renderItem = ({ item }: { item: Playlist }) => (
    <PlaylistItem
      item={item}
      onPress={() => navigation.navigate('PlaylistDetail', { playlist: item })}
      onDelete={() => deletePlaylist(item.id)}
    />
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

        <CreatePlaylistModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          onCreate={(name) => {
            createPlaylist(name);
            setModalVisible(false);
          }}
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

export default PlaylistsScreen;
