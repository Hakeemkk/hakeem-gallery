import { useState, useRef } from 'react';
import { api, API_BASE_URL } from '../lib/api';

const ImageUpload = ({ value, onChange, label, required = false }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState(value || '');
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('Please select a valid image file (JPEG, PNG, GIF, or WebP)');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }

    setError('');
    setIsUploading(true);

    try {
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);

      // Upload to server
      const formData = new FormData();
      formData.append('file', file);

      const uploadUrl = `${API_BASE_URL}/upload`;
      console.log('🚀 Uploading to:', uploadUrl);
      
      const response = await fetch(uploadUrl, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMsg = errorData.message || errorData.error || `Upload failed with status ${response.status}`;
        throw new Error(errorMsg);
      }

      const result = await response.json();
      console.log('✅ Upload response:', result);
      
      // Update parent component with the server URL
      // Handle different response formats
      const imageUrl = result.data?.url || result.url || result.data?.filename || result.filename;
      if (!imageUrl) {
        throw new Error('Server did not return image URL');
      }
      onChange(imageUrl);
      
    } catch (err) {
      console.error('❌ Upload error:', err);
      // اعرض رسالة خطأ واضحة
      const errorMsg = err.message || 'Failed to upload image';
      setError(`⚠️ ${errorMsg}`);
      // Reset preview on error
      setPreview(value || '');
    } finally {
      setIsUploading(false);
    }
  };

  const handleUrlChange = (e) => {
    const url = e.target.value;
    onChange(url);
    setPreview(url);
    setError('');
  };

  const handleRemove = () => {
    onChange('');
    setPreview('');
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="image-upload">
      <label className="upload-label">
        {label} {required && <span className="required">*</span>}
      </label>
      
      <div className="upload-container">
        {/* Preview */}
        {preview && (
          <div className="image-preview">
            <img src={preview} alt="Preview" className="preview-img" />
            <button type="button" onClick={handleRemove} className="remove-btn">
              ✕
            </button>
          </div>
        )}

        {/* Upload Options */}
        <div className="upload-options">
          {/* File Upload */}
          <div className="file-upload">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="file-input"
              disabled={isUploading}
            />
            <button 
              type="button" 
              onClick={() => fileInputRef.current?.click()}
              className="upload-btn"
              disabled={isUploading}
            >
              {isUploading ? 'Uploading...' : 'Choose File'}
            </button>
          </div>

          {/* URL Input */}
          <div className="url-input">
            <input
              type="text"
              placeholder="Or enter image URL..."
              value={value || ''}
              onChange={handleUrlChange}
              className="url-field"
            />
          </div>
        </div>

        {/* Error Message */}
        {error && <div className="error-message">{error}</div>}
      </div>

      <style jsx>{`
        .image-upload {
          margin-bottom: 15px;
        }

        .upload-label {
          display: block;
          margin-bottom: 8px;
          font-size: 13px;
          font-weight: bold;
          color: #64748b;
        }

        .required {
          color: #ef4444;
        }

        .upload-container {
          border: 2px dashed #cbd5e1;
          border-radius: 10px;
          padding: 20px;
          background: #f8fafc;
          transition: border-color 0.3s;
        }

        .upload-container:hover {
          border-color: #d4af37;
        }

        .image-preview {
          position: relative;
          margin-bottom: 15px;
          max-width: 200px;
        }

        .preview-img {
          width: 100%;
          height: 150px;
          object-fit: cover;
          border-radius: 8px;
          border: 2px solid #e2e8f0;
        }

        .remove-btn {
          position: absolute;
          top: -8px;
          right: -8px;
          background: #ef4444;
          color: white;
          border: none;
          border-radius: 50%;
          width: 24px;
          height: 24px;
          cursor: pointer;
          font-size: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .remove-btn:hover {
          background: #dc2626;
        }

        .upload-options {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .file-input {
          display: none;
        }

        .upload-btn {
          background: #1e293b;
          color: #d4af37;
          border: none;
          padding: 12px 20px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: bold;
          transition: 0.3s;
        }

        .upload-btn:hover:not(:disabled) {
          background: #111;
        }

        .upload-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .url-field {
          width: 100%;
          padding: 12px;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          outline: none;
          font-family: inherit;
        }

        .url-field:focus {
          border-color: #d4af37;
        }

        .error-message {
          color: #ef4444;
          font-size: 12px;
          margin-top: 5px;
        }

        @media (max-width: 768px) {
          .upload-options {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
};

export default ImageUpload;
