// Importing the 'dotenv' library for loading environment variables from a file
import dotenv from 'dotenv';

// Importing the 'connetDB' function for connecting to MongoDB
import connetDB from "./db/db.js";

// Importing the Express application from 'app.js'
import app from './app.js';

// Configuring dotenv to load environment variables from the specified file ('./env')
dotenv.config({
    path: './env'
});

// Connecting to MongoDB using the 'connetDB' function
connetDB()
    .then(() => {
        // Starting the Express server after successful MongoDB connection
        app.listen(process.env.PORT || 3000, () => {
            console.log(`Server is running at port: ${process.env.PORT || 3000}`);
        });
    })
    .catch((err) => {
        // Logging an error message if MongoDB connection fails
        console.log("MongoDB connection failed!!", err);
    });








/*
import { express } from "express";
const app = express()

(async ()=>{
    try {
        await mongoose.connect(`${process.env.
        MONGODB_URI}/${DB_NAME}`)
        app.on("error", (error) =>{
            console.log("ERROR:", error);
            throw error
        })
        app.listen(process.env.PORT, () =>{
            console.log(`App is listening on port 
            ${process.env.PORT} `)
        })
    } catch(error){
        console.log("ERROR:", error)
        throw err
    }
})()

*/