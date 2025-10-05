import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
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

export const usePlaylists = () => {
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
    loadPlaylists();
  }, [loadPlaylists]);

  const createPlaylist = async (name: string) => {
    try {
      const newPlaylist: Playlist = {
        id: Date.now().toString(),
        name: name.trim(),
        songs: [],
      };
      const updatedPlaylists = [...playlists, newPlaylist];
      await AsyncStorage.setItem('userPlaylists', JSON.stringify(updatedPlaylists));
      setPlaylists(updatedPlaylists);
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

  return { playlists, loadPlaylists, createPlaylist, deletePlaylist };
};
