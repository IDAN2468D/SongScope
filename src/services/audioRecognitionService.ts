import axios from 'axios';

const API_BASE_URL = 'https://songai-v0kl.onrender.com'; // Replace with your backend server URL

export const uploadAudioForRecognition = async (audioUri: string) => {
  try {
    const formData = new FormData();
    
    // Extract file name and type from the URI
    const fileName = audioUri.split('/').pop();
    const fileType = fileName ? `audio/${fileName.split('.').pop()}` : 'audio/mpeg'; // Default to mpeg if type cannot be determined

    formData.append('audio', {
      uri: audioUri,
      type: fileType, 
      name: fileName || `audio_${Date.now()}.mp3`, // Default to mp3 if name cannot be determined
    } as any);

    const response = await axios.post(`${API_BASE_URL}/upload-audio`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
    } catch (error) {
      console.error(`Error uploading audio for recognition: ${String(error)}`);
    throw error;
  }
};
