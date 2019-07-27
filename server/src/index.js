import express from "express";
import { isFileSupported, getAudioFiles } from "./utils";
import { database, query } from "./database";
import io from "./socket";
import database2 from "./database2";

database2._addFile(
  "/home/leo/Music/Jacob Miller Inner Circle Augustus pablo/Jacob Miller - With The Inner Circle Band & Augustus Pablo - 02 - Forward Jah Jah children.mp3"
);

const path = require("path");
const cors = require("cors");
const fs = require("fs");
const bodyParser = require("body-parser");

const app = express();
const port = 4000;

if (!fs.existsSync("data")) {
  fs.mkdirSync("data");
}

app.use(cors());
app.use(bodyParser.json());

app.get("/", (req, res) => {
  console.log("request");
  res.send("Hello World");
});

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

app.post("/scanfiles", async (req, res) => {
  const audioFiles = await getAudioFiles(req.body.path);
  res.send(audioFiles);
});

app.post("/update-track-metadata", async (req, res) => {
  const hash = req.body.hash;
  const updates = req.body.updates;
  query.updateTrack({ hash, updates });
  res.send(200);
});

app.post("/update-artist-metadata", async (req, res) => {
  const name = req.body.name;
  const updates = req.body.updates;
  query.updateArtist({ name, updates });
  res.send(200);
});

app.post("/update-album-metadata", async (req, res) => {
  const name = req.body.name;
  const updates = req.body.updates;
  query.updateAlbum({ name, updates });
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
  res.send(database.state.xhr);
});

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
  await database.add(files);
  database.export();
  res.send(database.data);
  console.log("end added");
});
app.post("/query", async (req, res) => {
  res.send(query.select(req.body.query));
});

app.listen(port, () => {
  console.log("Listening");
});
port, () => console.log(`Example app listening on port ${port}!`);
