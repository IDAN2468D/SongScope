import axios from 'axios';

const LOCAL_SERVER_URL = 'https://songai-v0kl.onrender.com';

export const getSongAnalysis = async (songTitle: string, artistName: string) => {
  try {
    const response = await axios.post(`${LOCAL_SERVER_URL}/gemini/analyze-song`, {
      songTitle,
      artistName,
    });
    return response.data;
  } catch (error) {
      console.error(`Error getting song analysis from local server (Gemini proxy): ${String(error)}`);
    throw error;
  }
};

export const getArtistWikipediaSummary = async (artistName: string) => {
  try {
    const response = await axios.post(`${LOCAL_SERVER_URL}/gemini/wikipedia-summary`, {
      artistName,
    });
    return response.data;
  } catch (error) {
    console.error(`Error getting artist Wikipedia summary from local server (Gemini proxy): ${String(error)}`);
    throw error;
  }
};
