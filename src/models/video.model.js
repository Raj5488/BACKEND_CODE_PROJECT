// Importing necessary modules and libraries
import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

// Defining the video schema using Mongoose Schema
const videoSchema = new Schema(
    {
        // Video files field representing the Cloudinary URL
        videoFiles: {
            type: String,
            required: true,
        },

        // Thumbnail field representing the Cloudinary URL
        thumbnail: {
            type: String,
            required: true,
        },

        // Title field for the video
        titles: {
            type: String,
            required: true,
        },

        // Description field for the video
        description: {
            type: String,
            required: true,
        },

        // Duration field for the video
        duration: {
            type: Number,
            required: true,
        },

        // Views field for tracking the number of views
        views: {
            type: Number,
            default: 0,
        },

        // isPublished field to indicate whether the video is published
        isPublished: {
            type: Boolean,
            default: true,
        },

        // Owner field referencing the User model
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
    },
    // Additional options, including timestamps
    { timestamps: true }
);

// Adding pagination support using mongoose-aggregate-paginate-v2 plugin
videoSchema.plugin(mongooseAggregatePaginate);

// Creating the Video model using the videoSchema
export const Video = mongoose.model("Video", videoSchema);
