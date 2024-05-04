import express from "express";
import cors from "cors";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import fs, { fsyncSync } from "fs";
import { exec } from "child_process";
import { error } from "console";
import { stderr, stdout } from "process";

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
// core of the application.
app.post("/upload", upload.single("file"), function (req, res) {
  console.log("file uploaded");
  const videoID = uuidv4(); //creating unique video id of each video
  const videoPath = req.file.path; //path of user upload vidio
  const outputPath = `./uploads/test/${videoID}`; // output path of uploaded video.
  const hlsPath = `${outputPath}/index.m3u8`; // converting video to m3u8 format.
  console.log("hlsPath", hlsPath);

  if (!fs.existsSync(outputPath)) {
    // checking/ creating path if not found.
    fs.mkdirSync(outputPath, { recursive: true }); // recursive return the created folder path.
  }

  // ffmpeg commands
  const ffmpegCommand = `ffmpeg -i ${videoPath} -codec:v libx264 -codec:a aac -hls_time 10 -hls_playlist_type vod -hls_segment_filename "${outputPath}/segment%03d.ts" -start_number 0 ${hlsPath}
  `;
    // executing ffmpeg command. 
  exec(ffmpegCommand, (error, stdout, stderr) => {
    if (error) {
      console.log(`exec error: ${error}`);
    }
    console.log(`stderr err: ${stderr}`);
    console.log(`stdout err: ${stdout}`);
    const videoUrl = `http://localhost:8000/uploads/test/${videoID}/index.m3u8`; // output of video url.
    res.json({
      message: "video converted to HLS format",
      videoUrl: videoUrl,
      videoID: videoID
    })
  });
});
app.listen(8000, () => {
  console.log("app is listing at 3000");
});
