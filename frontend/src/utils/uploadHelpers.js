import axios from 'axios';
import { compressImage } from './imageCompression';

export const uploadImages = async (files, onProgress = () => {}) => {
  const results = [];
  let totalProgress = 0;

  for (let i = 0; i < files.length; i++) {
    try {
      // Compress each image
      const compressedFile = await compressImage(files[i]);
      
      const formData = new FormData();
      formData.append('photos', compressedFile);

      // Upload the compressed image
      const response = await axios.post('/api/uploads/single', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      results.push(response.data.url);
      
      // Calculate and report progress
      totalProgress = ((i + 1) / files.length) * 100;
      onProgress(totalProgress);
    } catch (error) {
      console.error(`Error uploading file ${i + 1}:`, error);
      throw error;
    }
  }

  return results;
}; 