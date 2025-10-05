import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
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

type PlaylistItemProps = {
  item: Playlist;
  onPress: () => void;
  onDelete: () => void;
};

const PlaylistItem: React.FC<PlaylistItemProps> = ({ item, onPress, onDelete }) => (
  <TouchableOpacity
    style={styles.playlistItem}
    onPress={onPress}
    onLongPress={onDelete}
  >
    <MaterialDesignIcons name="playlist-music" size={30} color="#1DB954" />
    <Text style={styles.playlistName}>{item.name}</Text>
    <Text style={styles.songCount}>{item.songs.length} שירים</Text>
    <TouchableOpacity onPress={onDelete} style={styles.deleteButton}>
      <MaterialDesignIcons name="delete" size={24} color="#FF6347" />
    </TouchableOpacity>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
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
});

export default PlaylistItem;
