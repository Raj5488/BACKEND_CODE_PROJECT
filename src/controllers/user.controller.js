// Importing the asyncHandler function for handling asynchronous operations
import { asyncHandler } from "../utils/asyncHandler.js";

// Importing the ApiError class for creating API-specific error instances
import { ApiError } from "../utils/ApiError.js";

// Importing the User model for interacting with the user data in the database
import { User } from '../models/user.model.js';

// Importing the uploadOnCloudinary function for uploading files to Cloudinary
import { uploadOnCloudinary } from "../utils/cloudinary.js";

// Importing the ApiResponse class for creating consistent API response structures
import { ApiResponse } from '../utils/ApiResponse.js';


const generateAccessTokenAndfereshTokens = async(userId) =>{
        try {
            const user = await User.findById(userId)
            const accessToken = user.generateAccessToken()
            const refreshToken =  user.generateRefreshToken()

            user.refreshToken = refreshToken
            await user.save({ validateBeforeSave: false })

            return {accessToken,  refreshToken}

        } catch (error) {
            throw new ApiError(500, "Something went wring while generating refresh and access token")
        }
}


// Asynchronous function to handle user registration
const registerUser = asyncHandler(async (req, res) => {
    // Destructuring required fields from the request body
    const { fullName, email, username, password } = req.body;
    // console.log("email", email);

    // Check if any required field is empty
    if ([fullName, username, password, email].some((fields) => fields?.trim() === "")) {
        throw new ApiError(400, "All fields are required");
    }


    // Function to validate if an email is in a valid format using a regular expression
const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}
    // Validate email format
    if (!isValidEmail(email)) {
        throw new ApiError(400, "Invalid email address");
    }

    // Check if a user with the same email or username already exists
    const existUser = await User.findOne({
        $or: [{ email }, { username }]
    });

    if (existUser) {
        throw new ApiError(409, "User with email or username already exists");
    }

    // console.log(req.files)

    // Retrieve paths of avatar and coverImage files from the request
    const avatarLocalPath = req.files?.avatar[0]?.path;
    // const coverImageLocal = req.files?.coverImage[0]?.path;

    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
    coverImageLocalPath = req.files.coverImage[0].path;
    }


    // Check if avatar file is provided
    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required");
    }

    // Upload avatar and coverImage files to Cloudinary
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    // Check if avatar upload is successful
    if (!avatar) {
        throw new ApiError(400, "Avatar file upload failed");
    }

    // Create a new user in the database
    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    });

    // Retrieve the created user from the database (excluding password and refreshToken)
    const createdUser = await User.findById(user._id).select("-password -refreshToken");

    // Check if user creation is successful
    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering a user");
    }

    // Send a success response with the created user information
    return res.status(201).json(
        new ApiResponse(200, createdUser, "User Registered successfully")
    );
});

const loginUser = asyncHandler(async(req,  res) =>{
        // req body -> data
        // username or email
         // find the user 
         // password check
         // access and refresh token
        //  send cookies 

        const {email, username, password} = req.body
        if (!(username || email)) {
                throw new ApiError(400, "username or email is required")
        }
        
        const user = await User.findOne({
            $or: [ {username}, {email} ]
        })

        if(!user){
            throw new ApiError(404, "User does not exist");
        }

        const isPasswordValid = await user.isPasswordCorrect(password)

        if(!isPasswordValid){
            throw new ApiError(401, "Invalid user credentials");
        }

        const { accessToken, refreshToken} =  await generateAccessTokenAndfereshTokens(user._id)

        const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

        const options = {
            httpOnly: true,
            secure: true
        }

        return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie('refreshToken', refreshToken, options)
        .json(
            new ApiResponse(200, 
                {
                    user: loggedInUser, accessToken, refreshToken
                },
                "User logged In Successfully"
                )
        )
})

const logoutUser = asyncHandler(async(req, res) =>{
            await User.findByIdAndUpdate(
                req.user._id,
                {
                    $set: {
                        refreshToken: undefined
                    }
                },
                {
                    new: true
                }
            )

            const options = {
                httpOnly: true,
                secure: true
            }

            return res
            .status(200)
            .clearCookies("accessToken", options)
            .clearCookies("refreshToken", options)
            .json(new ApiResponse(200, {}, "User logged Out"))
})

// Exporting the registerUser function to make it accessible from other modules
export { 
    registerUser,
    loginUser,
    logoutUser
};
