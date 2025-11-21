import imageCompression from 'browser-image-compression';

export const compressImage = async (file) => {
  const options = {
    maxSizeMB: 10,              // Max file size in MB
    maxWidthOrHeight: 1920,    // Max width/height
    useWebWorker: true,        // Use web worker for better performance
    initialQuality: 0.8,       // Initial quality (0.8 = 80%)
  };

  try {
    const compressedFile = await imageCompression(file, options);
    return compressedFile;
  } catch (error) {
    console.error('Error compressing image:', error);
    throw error;
  }
}; 