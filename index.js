import express from "express";
import cors from "cors"
import multer from "multer";
import { v4 as uuidv4 } from "uuid";

const app = express()


app.get('/', (req, res) =>{
    res.json({message : "Hello user"})
})
app.listen(5000, () =>{
    console.log("app is listing at 3000");
})