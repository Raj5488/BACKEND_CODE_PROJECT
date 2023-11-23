// Importing the multer library for handling file uploads
import multer from "multer";

// Configuring multer storage settings
const storage = multer.diskStorage({
    // Setting the destination directory where uploaded files will be stored temporarily
    destination: function (req, file, cb) {
        cb(null, "./public/temp");
    },

    // Setting the filename for the uploaded file to be the original filename
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});

// Creating a multer middleware instance with the configured storage settings
export const upload = multer({
    storage,
});

