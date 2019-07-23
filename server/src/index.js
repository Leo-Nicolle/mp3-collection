import * as mm from "music-metadata/lib/core";
import express from "express";
import { isFileSupported } from "./utils";
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
        path: path.resolve(req.body.path) + "/..",
        type: "folder"
      }
    ].concat(
      files.map(f => ({
        name: f.name,
        path: path.resolve(req.body.path) + "/" + f.name,
        type: f.isDirectory() ? "folder" : isFileSupported(f) ? "audio" : "file"
      }))
    )
  );
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

app.listen(port, () => {
  console.log("Listening");
});
port, () => console.log(`Example app listening on port ${port}!`);
