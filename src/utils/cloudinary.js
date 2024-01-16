// Importing the Cloudinary v2 library with alias 'cloudinary'
import { v2 as cloudinary } from "cloudinary";

// Importing the 'fs' module for working with the file system
import fs from "fs";

// Configuring Cloudinary with API credentials from environment variables
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Function to upload a file to Cloudinary
const uploadOnCloudinary = async (localFilePath) => {
    try {
        // Check if localFilePath is not provided, return null
        if (!localFilePath) return null;

        // Upload the file to Cloudinary with specified options
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto",
            media_metadata: true,
            folder: "youtube",
        });

        // Log a success message if the file is uploaded successfully
        // console.log("File is uploaded on Cloudinary: ", response.url);

        fs.unlinkSync(localFilePath)
        return response;

        // Return the Cloudinary response
        return response;
    } catch (error) {
        // If an error occurs during the upload, remove the locally saved temporary file
        fs.unlinkSync(localFilePath);

        // Return null to indicate that the upload operation failed
        return null;
    }
};

const removeFromCloudinary = async (publicId, resource_type) => {
    try {
        const response = await cloudinary.uploader.destroy(publicId, {
        resource_type: resource_type,
    });
      // console.log(response);
        if (response.result == "ok") {
        return true;
    } else {
        return false;
    }
    } catch (error) {
    return false;
    }
};
// Exporting the uploadOnCloudinary function for use in other parts of the application
export { uploadOnCloudinary, removeFromCloudinary };
