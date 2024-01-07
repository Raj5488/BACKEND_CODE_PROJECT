// Importing the Router from Express to create a modular router
import { Router } from 'express';

// Importing the registerUser controller function for handling user registration
import { loginUser, logoutUser, registerUser, refreshAccessToken, changeCurrentPassword, getCurrentUser, updateUserAvatar, updateUserCoverImage, getUserChannetProfile, getWatchHistory, updateAccoundDetails } from '../controllers/user.controller.js';

// Importing the upload middleware for handling file uploads
import { upload } from '../middlewares/multer.middleware.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

// Creating an instance of the Express Router
const router = Router();

// Defining a route for user registration with the POST method
router.route("/register").post(
    // Using the upload middleware to handle file uploads with specific fields and limits
    upload.fields([
        {
            name: "avatar",      // Field name for the avatar file
            maxCount: 1          // Allowing a maximum of 1 file for the avatar
        }, 
        {
            name: "coverImage",  // Field name for the cover image file
            maxCount: 1          // Allowing a maximum of 1 file for the cover image
        }
    ]),
    // Handling user registration using the registerUser controller function
    registerUser
);

router.route("/login").post(loginUser)

// seccured route
router.route("/logout").post(verifyJWT,  logoutUser)

router.route("/refresh-token").post(refreshAccessToken)
router.route("/change-password").post(verifyJWT, changeCurrentPassword)
router.route("/current-user").get(verifyJWT, getCurrentUser)
router.route("/update-account").patch(verifyJWT, updateAccoundDetails)
router.route("/avatar").patch(verifyJWT, upload.single(
    "avatar"
), updateUserAvatar)
router.route("/cover-image").patch(verifyJWT, upload.single("coverImage"), updateUserCoverImage)
router.route("/c/:username").get(verifyJWT, getUserChannetProfile)
router.route("/history").get(verifyJWT, getWatchHistory)




// Exporting the configured router to be used in other parts of the application
export default router;
