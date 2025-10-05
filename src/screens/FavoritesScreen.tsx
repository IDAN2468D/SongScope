import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, SafeAreaView, StatusBar, Platform, Alert } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';

type FavoriteItem = {
  id: string;
  title: string;
  artist: string;
  albumCover: string | null;
};

type RootStackParamList = {
  Home: undefined;
  Processing: undefined;
  Result: { song: any };
  History: undefined;
  Favorites: undefined;
};

type FavoritesScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Favorites'>;

type Props = {
  navigation: FavoritesScreenNavigationProp;
};

const FavoritesScreen: React.FC<Props> = ({ navigation }) => {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);

  const loadFavorites = useCallback(async () => {
    try {
      const storedFavorites = await AsyncStorage.getItem('favoriteSongs');
      if (storedFavorites) {
        setFavorites(JSON.parse(storedFavorites));
      }
    } catch (error) {
      console.error('Failed to load favorites:', error);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadFavorites();
    });

    return unsubscribe;
  }, [navigation, loadFavorites]);

  const deleteFavoriteItem = async (id: string) => {
    Alert.alert(
      'מחק ממועדפים',
      'האם אתה בטוח שברצונך להסיר פריט זה מהמועדפים?',
      [
        {
          text: 'ביטול',
          style: 'cancel',
        },
        {
          text: 'מחק',
          onPress: async () => {
            try {
              const updatedFavorites = favorites.filter(item => item.id !== id);
              await AsyncStorage.setItem('favoriteSongs', JSON.stringify(updatedFavorites));
              setFavorites(updatedFavorites);
            } catch (error) {
              console.error('Failed to delete favorite item:', error);
            }
          },
          style: 'destructive',
        },
      ],
      { cancelable: true }
    );
  };

  const renderItem = ({ item }: { item: FavoriteItem }) => (
    <TouchableOpacity
      style={styles.favoriteItem}
      onPress={() => navigation.navigate('Result', { song: item })}
      onLongPress={() => deleteFavoriteItem(item.id)}
    >
      {item.albumCover ? (
        <Image source={{ uri: item.albumCover }} style={styles.albumCover} />
      ) : (
        <View style={styles.albumCoverPlaceholder}>
          <MaterialCommunityIcons name="music-note" size={30} color="#B0B0B0" />
        </View>
      )}
      <View style={styles.textContainer}>
        <Text style={styles.songTitle}>{item.title}</Text>
        <Text style={styles.artistName}>{item.artist}</Text>
      </View>
      <TouchableOpacity onPress={() => deleteFavoriteItem(item.id)} style={styles.deleteButton}>
        <MaterialCommunityIcons name="delete" size={24} color="#FF6347" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#121212" />
      <View style={styles.container}>
        <Text style={styles.header}>השירים האהובים עליי</Text>
        <FlatList
          data={favorites}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons name="heart-outline" size={50} color="#B0B0B0" />
              <Text style={styles.emptyText}>אין שירים מועדפים עדיין.</Text>
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
  favoriteItem: {
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
  albumCoverPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 5,
    marginRight: 15,
    backgroundColor: '#282828',
    justifyContent: 'center',
    alignItems: 'center',
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

export default FavoritesScreen;
