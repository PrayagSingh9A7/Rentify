import upload from "./cloudinary.storage.js";

const supportedProviders = new Set(["cloudinary", undefined, ""]);

if (!supportedProviders.has(process.env.STORAGE_PROVIDER)) {
  throw new Error(`Unsupported STORAGE_PROVIDER: ${process.env.STORAGE_PROVIDER}`);
}

export const uploadMiddleware = upload;

export { upload };
export * from "./cloudinary.storage.js";
