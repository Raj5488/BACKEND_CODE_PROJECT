// require('dotenv').config({path: './env'})
import dotenv from 'dotenv';
import connetDB from "./db/db.js";

dotenv.config({
    path: './env'
})

connetDB()

.then(() =>{
    app.listen(process.env.PORT || 3000, () =>{
        console.log(`Server is runing at port: 
        ${process.env.PORT}`);
    })
})
.catch((err) =>{
    console.log("MONGO DB connection failed !!", err)
})








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