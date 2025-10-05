import axios from 'axios';

const LOCAL_SERVER_URL = 'https://songai-v0kl.onrender.com';

export const searchSpotify = async (query: string) => {
  try {
    const response = await axios.get(
      `${LOCAL_SERVER_URL}/spotify/search?query=${encodeURIComponent(query)}`
    );
    return response.data;
  } catch (error) {
    console.error(`Error searching Spotify with local server proxy: ${String(error)}`);
    throw error;
  }
};

export const getArtistInfo = async (artistId: string) => {
  try {
    const response = await axios.get(
      `${LOCAL_SERVER_URL}/spotify/artist/${artistId}`
    );
    return response.data;
  } catch (error) {
    console.error(`Error getting artist info from Spotify with local server proxy: ${String(error)}`);
    throw error;
  }
};
