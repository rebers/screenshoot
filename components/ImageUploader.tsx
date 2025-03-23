import React, { useCallback, useEffect, useRef } from 'react';
import { useDropzone } from 'react-dropzone';

interface ImageUploaderProps {
  onImageUpload: (file: File) => void;
  hasImage: boolean;
}

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
      'image/*': ['.png', '.jpg', '.jpeg', '.gif']
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
      className={`
        flex flex-col items-center justify-center 
        w-full h-full border-2 border-dashed rounded-lg 
        transition-colors cursor-pointer
        ${isDragActive 
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
          : 'border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900/20'}
      `}
    >
      <input {...getInputProps()} />
      <svg 
        className="w-12 h-12 mb-4 text-gray-400"
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth="1.5" 
          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
        />
      </svg>
      <p className="mb-2 text-sm text-gray-600 dark:text-gray-400">
        <span className="font-semibold">Click to upload</span> or drag and drop
      </p>
      <p className="text-xs text-gray-500 dark:text-gray-500">
        You can also paste an image from clipboard
      </p>
    </div>
  );
};

export default ImageUploader; 