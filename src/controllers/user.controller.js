import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { User } from '../models/user.model.js'
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from '../utils/ApiResponse.js'

const isValidEmail = (email) =>{
    // REgular expression for basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

const registerUser = asyncHandler( async(req, res) =>{
        const { fullName, email, username, password } = req.body
        console.log("email", email)
    
        //Check if any required firld is empty
        if (
            [fullName, username, password, email].some((fields)=> fields?.trim() === "")
            ) {
            throw new ApiError(400, "All field are required")
        }

        // validatate email
        if(!isValidEmail(email)){
            throw new ApiError(400, "Invalid email address")
        }

        const existUser = User.find({
            $or: [{ email }, {username}, ]
        })

        if(existUser){
            throw new ApiError(409, "User with email or username already exists ")
        }

        const avatarLocalPath = req.files?.avatar[0]?.path;
        const coverImageLocal = req.files?.coverImage[0]?.path;

        if(!avatarLocalPath){
            throw new ApiError(400, "Avatar file are required")
        }

        const avatar = await uploadOnCloudinary(avatarLocalPath)
        const coverImage = await uploadOnCloudinary(coverImageLocal)

        if(!avatar){
            throw new ApiError(400, "Avatar file is required")
        }

        const user = await User.create({
            fullName,
            avatar: avatar.url,
            coverImage: coverImage?.url || "",
            email, 
            password,
            username: username.toLowerCase()
        })

        const createdUser = await User.findById(user._id).select("-password -refreshToken")

        if(!createdUser){
            throw new ApiError(500, "Something went wrong while registering a user")
        }

        return res.status(201).json(
            new ApiResponse(200, createdUser, "User Registered successfully")
        )

})


export { registerUser }