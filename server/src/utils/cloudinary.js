// utils/cloudinary.js
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/* ----------------------------------------
   Upload file to Cloudinary
---------------------------------------- */
const uploadOnCloudinary = async (localFilePath, resourceType) => {
  if (!localFilePath) return null;

  if (resourceType === "video") {
    return await cloudinary.uploader.upload_large(localFilePath, {
      resource_type: "video",
      chunk_size: 6 * 1024 * 1024,
    });
  }

  return await cloudinary.uploader.upload(localFilePath, {
    resource_type: "image",
  });
};

/* ----------------------------------------
   Delete file from Cloudinary
---------------------------------------- */
const deleteFromCloudinary = async (publicId, resourceType = "image") => {
  if (!publicId) return;

  return cloudinary.uploader.destroy(publicId, {
    resource_type: resourceType, // image | video
  });
};

/* ----------------------------------------
   Extract public_id from Cloudinary URL
---------------------------------------- */
const getPublicIdFromUrl = (url) => {
  if (!url) return null;

  // Example:
  // https://res.cloudinary.com/demo/image/upload/v1234567890/folder/file.jpg
  return url.split("/").pop().split(".")[0];
};

export { uploadOnCloudinary, deleteFromCloudinary, getPublicIdFromUrl };
