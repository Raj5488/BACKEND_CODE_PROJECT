// Importing the 'express' library for creating an Express application
import express from "express";

// Importing the 'cors' middleware for handling Cross-Origin Resource Sharing
import cors from 'cors';

// Importing the 'cookie-parser' middleware for parsing cookies
import cookieParser from "cookie-parser";

// Creating an instance of the Express application
const app = express();

// Using the 'cors' middleware to handle Cross-Origin Resource Sharing
app.use(cors({
    origin: process.env.CORS_ORIGIN,    // Allowing requests from the specified origin
    credentials: true                   // Allowing credentials (e.g., cookies) to be sent with cross-origin requests
}));

// Using middleware to parse JSON requests with a limit of 16 kilobytes
app.use(express.json({ limit: "16kb" }));

// Using middleware to parse URL-encoded requests with extended options and a limit of 16 kilobytes
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

// Serving static files from the 'public' directory
app.use(express.static("public"));

// Using the 'cookie-parser' middleware to parse cookies
app.use(cookieParser());

// Importing user routes from './routes/user.routes.js'
import userRouter from './routes/user.routes.js';
app.use("/api/v1/users", userRouter);


import commentRouter from "./routes/comment.routes.js";
import likeRouter from "./routes/like.routes.js";
import subscriptionRouter from "./routes/subscription.routes.js";
import tweetRouter from "./routes/tweet.routes.js";
import videoRouter from "./routes/video.routes.js";
import healthcheckRouter from "./routes/healthcare.routers.js";
import playlistRouter from "./routes/playlist.routes.js";
import dashboardRouter from "./routes/dashboard.routes.js";


app.use("/api/v1/comment", commentRouter);
app.use("/api/v1/likes", likeRouter);
app.use("/api/v1/subscriptions", subscriptionRouter);
app.use("/api/v1/tweet", tweetRouter);
app.use("/api/v1/video", videoRouter);
app.use("/api/v1/healthcheck", healthcheckRouter);
app.use("/api/v1/playlist", playlistRouter);
app.use("/api/v1/dashboard", dashboardRouter);


export default app;
