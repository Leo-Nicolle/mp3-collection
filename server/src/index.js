import * as mm from "music-metadata/lib/core";
import express from "express";
import { isFileSupported } from "./utils";
const path = require("path");
const cors = require("cors");
const fs = require("fs");
const bodyParser = require("body-parser");

const app = express();
const port = 4000;

// const corsOptions = {
//   origin: "http://localhost",
//   optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
// };

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
        type: "directory"
      }
    ].concat(
      files.map(f => ({
        name: f.name,
        path: path.resolve(req.body.path) + "/" + f.name,
        type: f.isDirectory()
          ? "directory"
          : isFileSupported(f)
          ? "audio"
          : "file"
      }))
    )
  );
});

app.listen(port, () => {
  console.log("Listening");
});
port, () => console.log(`Example app listening on port ${port}!`);
