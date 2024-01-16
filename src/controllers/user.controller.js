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

import jwt from 'jsonwebtoken'
import mongoose from "mongoose";


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

        if(!username && !email){
            throw new ApiError(400,  "username or email is required")
        }
        
        // Here is an alternative of above code based on logic discussion
        // if (!(username || email)) {
        //         throw new ApiError(400, "username or email is required")
        // }
        
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

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1    // this removes the field from document
            }
        },
        {
            new: true
        }
    );

    const options = {
        httpOnly: true,
        secure: true
    };

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User logged Out"));
});

const refreshAccessToken = asyncHandler(async (req,  res) =>{

        const incomingRefreshToken = req.cookies
        .refreshToken || req.body. refreshToken
        
        if ( ! incomingRefreshToken ){
            throw new ApiError(401, "unauthrorized request")
        }
try {
    
            const decodedToken = jwt.verify(
                incomingRefreshToken,
                process.env.REFRESH_TOKEN_SECRET
            )
    
            const user = await User.findById(decodedToken?._id)
            
            if( ! user ){
                throw new ApiError(401 ,"Invalid refresh token")
            }
    
            if( incomingRefreshToken !== user?.refreshToken ){
                throw new ApiError(401, "Refresh token is expired or used")
            }
    
            const options = {
                httpOnly: true,
                secure: true
            }
    
            const {accessToken, newrefreshToken}  = await generateAccessTokenAndfereshTokens(user._id)
    
            return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newrefreshToken, options)
            .json(
                new ApiResponse(
                    200, 
                    {accessToken, refreshToken:  newrefreshToken}, "Access token refreshed"
                )
            )
    } catch (error) {
            throw new ApiError(401, error?.message || "Invalid refresh token")
    }


    })

    const changeCurrentPassword = asyncHandler(async(req, res) =>{
        const { oldPassword, newPassword, confPassword } = req.body

        if(newPassword !== confPassword){
            throw new ApiError(400, "new password confirm password does not matched")
        }

            const user = await User.findById(req.user?._id)
            const  isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

        if(!isPasswordCorrect){
            throw new ApiError(400, "Invalid old password")
        }

        user.password = newPassword
        await user.save({validateBeforeSave: false})

        return res
        .status(200)
        .json(new ApiResponse(200, {}, "Password changed successfully"))

    })

    const getCurrentUser = asyncHandler(async(req, res) =>{
        return res
        .status(200)
        .json(200, req.user, "current user fetched successfully")
    })

    const updateAccoundDetails = asyncHandler(async(req, res) =>{
        const {fullName, email} = req.body

        if(!fullName || !email){
            throw new ApiError(400, "All field are required")
        }
        const updatedUser = await User.findByIdAndUpdate(
            req.user?._id, 
            {
                $set: {
                    fullName: fullName,
                    email: email
                }
            },
            {new: true}
            ).select("-password")

            if (!updatedUser) {
                throw new ApiError(404, "User not found");
            }

            return res
            .status(200)
            .json(new ApiResponse(200, updatedUser, "Account details updated successfully"))


    })

    const updateUserAvatar = asyncHandler(async(req, res) =>{
        const avatarLocalPath = req.file?.path
        if(!avatarLocalPath){
            throw new ApiError(400, "Avatar file is missing ")
        }
        const avatar = await uploadOnCloudinary(avatarLocalPath)

        if(!avatar.url){
            throw new ApiError(400, "Error while uploading on avatar")
        }

        const user = await User.findByIdAndUpdate(
            req.user?._id,
            {
                $set: {
                    avatar: avatar.url
                }
            },
            {new: true}
        ).select("-password")

        return res
        .status(200)
        .json(
            new ApiResponse(200, user, "Avatar updated successfully")
        )
    })

    const updateUserCoverImage = asyncHandler(async(req, res) =>{
        const coverImageLocalPath = req.file?.path
        if(!coverImageLocalPath){
            throw new ApiError(400, "Cover Image file is missing ")
        }
        const coverImage = await uploadOnCloudinary(coverImageLocalPath)

        if(!coverImage.url){
            throw new ApiError(400, "Error while uploading on coverImage")
        }

        const user = await User.findByIdAndUpdate(
            req.user?._id,
            {
                $set: {
                    coverImage: coverImage.url
                }
            },
            {new: true}
        ).select("-password")

        return res
        .status(200)
        .json(
            new ApiResponse(200, user, "Cover Image updated successfully")
        )

    })


    const getUserChannetProfile = asyncHandler(async(req, res) => {
            const {username } = req.params
            if(!username?.trim()){
                throw new ApiError(400, 'username is missing')
            }

            const channel = await User.aggregate([
                    {
                        $match: {
                            username: username?.toLowerCase()
                        }
                    },
                    {
                        $lookup: {
                            from: "subscriptions",
                            localField: "_id",
                            foreignField: "channel",
                            as: "subscribers"
                        }
                    },
                    {
                        $lookup: {
                            from: "subscriptions",
                            localField: "_id",
                            foreignField: "channel",
                            as: "subscribedTo"
                        }
                    },
                    {
                        $addFields: {
                            subscribersCount: {
                                $size: "$subscribers"
                            },
                            channelsSubscribedToCount: {
                                    $size: "$subscribedTo"
                            },
                            isSubscribed: {
                                $cond: {
                                    if: {$in: [req.user?._id, ["$subscribers.subscriber"] ]},
                                    then: true,
                                    else: false
                                }
                            }
                        }
                    },
                    {
                        $project: {
                            fullName: 1,
                            username: 1,
                            subscribersCount: 1,
                            channelsSubscribedToCount: 1,
                            isSubscribed: 1,
                            avatar: 1,
                            coverImage: 1,
                            email: 1,
                        }
                    }
            ])
    
            if(!channel?.length){
                throw new ApiError(404, "channel does not exists")
            }

            return res
            .status(200)
            .json(new ApiResponse(200, channel[0], "User channel fetched successfully "))
        })

// Define the getWatchHistory function using asyncHandler middleware
const getWatchHistory = asyncHandler(async (req, res) => {
    // Use the aggregate method to perform MongoDB aggregation pipeline
    const user = await User.aggregate([
        {
            // Stage 1: Match the user by _id
            $match: {
                _id: new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            // Stage 2: Lookup the Video collection using watchHistory field
            $lookup: {
                from: 'Video',
                localField: 'watchHistory',
                foreignField: '_id',
                as: 'watchHistory',
                // Pipeline for the Video collection lookup
                pipeline: [
                    {
                        // Sub-stage 1: Lookup users collection to get owner information
                        $lookup: {
                            from: 'users',
                            localField: 'owner',
                            foreignField: '_id',
                            as: 'owner',
                            // Pipeline for the users collection lookup
                            pipeline: [
                                {
                                    // Project only necessary fields from the owner
                                    $project: {
                                        fullName: 1,
                                        username: 1,
                                        avatar: 1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        // Sub-stage 2: AddFields to rename the owner array to a single object
                        $addFields: {
                            owner: {
                                $first: '$owner'
                            }
                        }
                    }
                ]
            }
        }
    ]);

    // Send the response with the fetched watch history
    return res.status(200).json(
        new ApiResponse(200, user[0].watchHistory, 'Watch history fetched successfully')
    );
});

// Exporting the registerUser function to make it accessible from other modules
export { 
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccoundDetails,
    updateUserAvatar,
    updateUserCoverImage,
    getUserChannetProfile,
    getWatchHistory
};
