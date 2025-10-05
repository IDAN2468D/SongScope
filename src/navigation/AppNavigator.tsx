import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import HomeScreen from '../screens/HomeScreen';
import ProcessingScreen from '../screens/ProcessingScreen';
import ResultScreen from '../screens/ResultScreen';
import HistoryScreen from '../screens/HistoryScreen';
import FavoritesScreen from '../screens/FavoritesScreen';
import PlaylistsScreen from '../screens/PlaylistsScreen'; // Import the new PlaylistsScreen
import PlaylistDetailScreen from '../screens/PlaylistDetailScreen'; // Import the new PlaylistDetailScreen

export type RootStackParamList = {
  HomeTabs: undefined;
  Home: undefined;
  Processing: { audioUri: string };
  Result: { song: any };
  History: undefined;
  Favorites: undefined;
  Playlists: undefined; // Add Playlists to the RootStackParamList
  PlaylistDetail: { playlist: any }; // Add PlaylistDetail to the RootStackParamList
};

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

const HomeTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false, // Hide header for tab screens, handled by stack navigator
        tabBarStyle: {
          backgroundColor: '#1E1E1E', // Dark background for tab bar
          borderTopWidth: 0,
          elevation: 0, // Remove shadow on Android
          shadowOpacity: 0, // Remove shadow on iOS
          height: 110, // Adjust height as needed
          paddingBottom: 5,
          paddingTop: 5,
        },
        tabBarActiveTintColor: '#1DB954', // Spotify green for active tab
        tabBarInactiveTintColor: '#B0B0B0', // Light gray for inactive tab
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: 'bold',
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: 'בית',
          tabBarIcon: ({ color, size }) => (
            <Icon name="home" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="History"
        component={HistoryScreen}
        options={{
          title: 'היסטוריה',
          tabBarIcon: ({ color, size }) => (
            <Icon name="history" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Favorites"
        component={FavoritesScreen}
        options={{
          title: 'מועדפים',
          tabBarIcon: ({ color, size }) => (
            <Icon name="heart" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Playlists"
        component={PlaylistsScreen}
        options={{
          title: 'פלייליסטים',
          tabBarIcon: ({ color, size }) => (
            <Icon name="playlist-music" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="HomeTabs" screenOptions={{
        headerStyle: {
          backgroundColor: '#1E1E1E',
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: '#E0E0E0',
        headerTitleStyle: {
          fontWeight: 'bold',
          fontSize: 20,
        },
      }}>

        <Stack.Screen name="HomeTabs" component={HomeTabs} options={{ headerShown: false }} />
        <Stack.Screen name="Processing" component={ProcessingScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Result" component={ResultScreen} options={{ title: 'מצאנו את השיר שלך 🎶' }} />
        <Stack.Screen name="PlaylistDetail" component={PlaylistDetailScreen} options={({ route }) => ({ title: route.params.playlist.name })} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
