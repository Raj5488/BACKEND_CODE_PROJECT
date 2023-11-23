// Importing the mongoose library for MongoDB interactions
import mongoose from "mongoose";

// Importing the DB_NAME constant from the specified file (probably constants.js)
import { DB_NAME } from "../constants.js";

// Defining an asynchronous function named connetDB for connecting to MongoDB
const connetDB = async () => {
    try {
        // Attempting to connect to MongoDB using the MONGODB_URI and DB_NAME
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);

        // Logging a success message with the connected DB host if the connection is successful
        console.log(`\n Mongodb connected !! DB HOST: ${connectionInstance.connection.host}`);
    } catch (error) {
        // Logging an error message and exiting the process if the connection fails
        console.log("MONGODB connection FAILED: ", error);
        process.exit(1);
    }
};

// Exporting the connetDB function to make it accessible from other modules
export default connetDB;
