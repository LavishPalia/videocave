import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  if (!localFilePath) return null;
  try {
    const fileMetaData = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });
    // console.log(fileMetaData.public_id);

    // run code after successful file upload
    fs.unlinkSync(localFilePath);
    return fileMetaData; // practically only url is required in frontend
  } catch (err) {
    fs.unlinkSync(localFilePath); // remove the locally saved file as the upload operation has failed
    console.log(err);
    return null;
  }
};

const deleteFromCloudinary = async (url, resourceType = "image") => {
  if (!url) {
    return null;
  }

  const resourcePublicId = url.split("/").pop().split(".")[0];

  const response = await cloudinary.uploader.destroy(resourcePublicId, {
    resource_type: resourceType,
  });

  console.log("42, deleteFromCloudinaryResponse", response);
};

export { uploadOnCloudinary, deleteFromCloudinary };
