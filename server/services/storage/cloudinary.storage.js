import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../../config/cloudinary.js";


const storage = new CloudinaryStorage({
  cloudinary,
  params: async () => ({
    folder: "Rentify",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [
      {
        width: 1200,
        height: 900,
        crop: "limit",
        quality: "auto",
      },
    ],
  }),
});

export const upload = multer({
  storage,

  limits: {
    fileSize: 5 * 1024 * 1024,
  },

  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/"))
      cb(null, true);
    else
      cb(new Error("Only image files are allowed"), false);
  },
});

export const deleteImage = async (publicId) => {
  return cloudinary.uploader.destroy(publicId);
};

export default upload;