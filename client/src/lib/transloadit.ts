/**
 * Transloadit configuration for file uploads
 * Assignment Requirement: Upload Image and Upload Video nodes must use Transloadit
 */

import Uppy from '@uppy/core';
import Transloadit from '@uppy/transloadit';

export const createImageUploader = () => {
  const uppy = new Uppy({
    restrictions: {
      maxNumberOfFiles: 1,
      allowedFileTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'],
      maxFileSize: 10 * 1024 * 1024, // 10MB
    },
  });

  uppy.use(Transloadit, {
    assemblyOptions: {
      params: {
        auth: {
          key: import.meta.env.VITE_TRANSLOADIT_KEY,
        },
        template_id: import.meta.env.VITE_TRANSLOADIT_TEMPLATE_IMAGE,
      },
    },
    waitForEncoding: true,
    waitForMetadata: true,
  });

  return uppy;
};

export const createVideoUploader = () => {
  const uppy = new Uppy({
    restrictions: {
      maxNumberOfFiles: 1,
      allowedFileTypes: ['video/mp4', 'video/mov', 'video/webm', 'video/x-m4v'],
      maxFileSize: 100 * 1024 * 1024, // 100MB
    },
  });

  uppy.use(Transloadit, {
    assemblyOptions: {
      params: {
        auth: {
          key: import.meta.env.VITE_TRANSLOADIT_KEY,
        },
        template_id: import.meta.env.VITE_TRANSLOADIT_TEMPLATE_VIDEO,
      },
    },
    waitForEncoding: true,
    waitForMetadata: true,
  });

  return uppy;
};
