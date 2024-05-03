import express from "express";
import cors from "cors";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import path from "path";


const app = express();

app.use(
  cors({
    origin: ["https://localhost:8000", "https://localhost:5173"],
    credentials: true,
  })
);

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-headers",
    "Orgin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

// middleware for express
app.use(express.json()); // allowing json type data.
app.use(express.urlencoded({ extended: true })); // accepting data from url.
app.use("/uploads", express.static("uploads")); // root folder to uploading video / user uploded video to be stream

// multer middleware
const storage = multer.diskStorage({
  // diskStorage for storing data in local machine
  destination: function (req, res, cb) {
    cb(null, "./uploads");
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + "_" + uuidv4() + path.extname(file.originalname)); // for changing file-name.
  },
});

// multer config.

const upload = multer({ storage: storage });

app.get("/", (req, res) => {
  res.json({ message: "Hello user" });
});

app.post("/upload", upload.single("file"), function (req, res) {
    console.log("file uploaded");
});
app.listen(8000, () => { 
  console.log("app is listing at 3000");
});
