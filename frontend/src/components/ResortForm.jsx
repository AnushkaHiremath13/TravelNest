import React, { useState } from 'react';
import { uploadImages } from '../utils/uploadHelpers';

const ResortForm = ({ onSubmit, initialData = {} }) => {
  const [formData, setFormData] = useState(initialData);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const handleImageUpload = async (event) => {
    const files = Array.from(event.target.files);
    setIsUploading(true);

    try {
      const urls = await uploadImages(files, (progress) => {
        setUploadProgress(progress);
      });

      // Update form data with the uploaded image URLs
      setFormData(prev => ({
        ...prev,
        photos: [...(prev.photos || []), ...urls]
      }));
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to upload images. Please try again.');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Other form fields */}
      
      <div className="form-group">
        <label>Upload Photos</label>
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleImageUpload}
          disabled={isUploading}
        />
        {isUploading && (
          <div className="progress">
            <div 
              className="progress-bar" 
              style={{ width: `${uploadProgress}%` }}
            >
              {Math.round(uploadProgress)}%
            </div>
          </div>
        )}
      </div>

      <button 
        type="submit" 
        disabled={isUploading}
      >
        {isUploading ? 'Uploading...' : 'Submit'}
      </button>
    </form>
  );
};

export default ResortForm; 