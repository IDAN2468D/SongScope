import axios from 'axios';

const LOCAL_SERVER_URL = 'https://songai-v0kl.onrender.com';

export const identifySong = async (audioFile: string) => {
  try {
    const formData = new FormData();
    formData.append('file', { uri: audioFile, name: 'audio.mp3', type: 'audio/mpeg' });

    const response = await axios.post(`${LOCAL_SERVER_URL}/audd`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error(`Error identifying song with local server (AudD proxy): ${String(error)}`);
    throw error;
  }
};
