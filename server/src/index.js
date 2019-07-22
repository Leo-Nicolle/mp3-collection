import * as mm from "music-metadata/lib/core";
import express from "express";
const cors = require("cors");

const app = express();
const port = 4000;

// const corsOptions = {
//   origin: "http://localhost",
//   optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
// };

app.use(cors());

app.get("/", (req, res) => {
  console.log("request");
  res.send("Hello World");
});
app.listen(port, () => {
  console.log("Listening");
});
port, () => console.log(`Example app listening on port ${port}!`);
