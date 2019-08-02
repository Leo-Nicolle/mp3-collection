import express from "express";
import { isFileSupported, getAudioFiles } from "./utils";
import io from "./socket";
import database2 from "./database2";

const path = require("path");
const cors = require("cors");
const fs = require("fs");
const bodyParser = require("body-parser");
const open = require("open");

const app = express();
const port = 4000;

app.use(cors());
app.use(bodyParser.json());

app.post("/folder", (req, res) => {
  const files = fs.readdirSync(req.body.path, { withFileTypes: true });
  res.send(
    [
      {
        name: "..",
        path: path.resolve(path.join(req.body.path, "..")),
        type: "folder"
      }
    ].concat(
      files.map(f => ({
        name: f.name,
        path: path.join(req.body.path, f.name),
        type: f.isDirectory() ? "folder" : isFileSupported(f) ? "audio" : "file"
      }))
    )
  );
});

app.post("/update-data-files", (req, res) => {
  database2.syncDataFiles();
  res.send(200);
});

app.post("/scanfiles", async (req, res) => {
  const audioFiles = await getAudioFiles(req.body.path);
  res.send(audioFiles);
});

app.post("/update-track-metadata", async (req, res) => {
  const hash = req.body.hash;
  const updates = req.body.updates;
  // query.updateTrack({ hash, updates });
  res.send(200);
});

app.post("/update-artist-metadata", async (req, res) => {
  const name = req.body.name;
  const updates = req.body.updates;
  // query.updateArtist({ name, updates });
  res.send(200);
});

app.post("/update-metadata", async (req, res) => {
  database2.updateMetadata(req.body);
  res.send(200);
});

app.post("/state", (req, res) => {
  console.log(req.body.state);
  fs.writeFileSync("data/state.json", JSON.stringify(req.body.state));
  res.send(200);
});
app.get("/state", (req, res) => {
  if (!fs.existsSync("data/state.json")) {
    res.send(500);
    return;
  }
  const state = fs.readFileSync("data/state.json");
  res.send(state);
});

app.get("/xhr", (req, res) => {
  res.send({});

  // res.send(database.state.xhr);
});

// app.get("/audio-paths", (req, res) => {
//   res.send(database2.getAudioPaths());
// });
//
// app.post("/add-audio-paths", (req, res) => {
//   const path = req.body.path;
//   database2.addAudioPath(path);
//   database2.addFolder(path);
//   res.send(200);
// });

app.post("/add", async (req, res) => {
  const file = req.body.file;
  const filePath = path.resolve(file.path);
  if (!fs.existsSync(filePath)) {
    res.send(500);
    return;
  }
  if (file.type !== "folder") {
    res.send(500);
    return;
  }

  const files = fs
    .readdirSync(filePath)
    .map(f => filePath + "/" + f)
    .filter(f => isFileSupported(f));
  await database2.addFiles(files);
  res.send(200);
});

app.post("/query", async (req, res) => {
  res.send(database2.select(req.body.query));
});

if (fs.existsSync("static")) {
  app.use(express.static("static"));
}

app.listen(port, () => {
  console.log("Listening");
});
port, () => console.log(`Example app listening on port ${port}!`);

// open("http://localhost:4000");
