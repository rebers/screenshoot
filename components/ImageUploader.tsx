import React, { useCallback, useEffect, useRef } from 'react';
import { useDropzone } from 'react-dropzone';

interface ImageUploaderProps {
  onImageUpload: (file: File) => void;
  hasImage: boolean;
}

// Define supported image types once
const SUPPORTED_IMAGE_TYPES = ['.png', '.jpg', '.jpeg', '.webp'];

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUpload, hasImage }) => {
  const dropzoneRef = useRef<HTMLDivElement>(null);
  
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      onImageUpload(acceptedFiles[0]);
    }
  }, [onImageUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': SUPPORTED_IMAGE_TYPES
    },
    maxFiles: 1,
    multiple: false,
  });

  // Handle paste event
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (e.clipboardData && e.clipboardData.files.length > 0) {
        const file = e.clipboardData.files[0];
        if (file.type.startsWith('image/')) {
          onImageUpload(file);
          e.preventDefault();
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => {
      window.removeEventListener('paste', handlePaste);
    };
  }, [onImageUpload]);

  // If we already have an image, don't show the uploader
  if (hasImage) {
    return null;
  }

  return (
    <div 
      {...getRootProps()} 
      ref={dropzoneRef}
      className="w-full h-full flex flex-col items-center justify-center"
    >
      <input {...getInputProps()} />
      <div className="mb-3 bg-white rounded-full p-3 w-20 h-20 flex items-center justify-center">
        <svg 
          className="w-10 h-10 text-gray-400"
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth="2" 
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </div>
      <div className="text-center">
        <p className="text-sm mb-2L">
          <span className="text-blue-500 font-medium">Click to upload</span> or drag & drop
        </p>
        <p className="text-xs text-gray-500">
          You can also paste an image from clipboard
        </p>
      </div>
      <div className="mt-1 text-xs text-gray-500">
        Supports {SUPPORTED_IMAGE_TYPES.map(type => type.replace('.', '').toUpperCase()).join(', ')}
      </div>
    </div>
  );
};

export default ImageUploader;
