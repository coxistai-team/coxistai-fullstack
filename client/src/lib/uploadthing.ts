import { generateUploadButton, generateUploadDropzone, generateReactHelpers } from '@uploadthing/react';
// You will need to define the correct type for your router if you have one, otherwise use 'any' for now
// import type { OurFileRouter } from '@/app/api/uploadthing/core';

// For now, use 'any' as the router type, update if you add a backend router type
export const UploadButton = generateUploadButton<any>();
export const UploadDropzone = generateUploadDropzone<any>();
const uploadHelpers = generateReactHelpers<any>();
export const useUploadThing = uploadHelpers.useUploadThing;
export const uploadFiles = uploadHelpers.uploadFiles; 