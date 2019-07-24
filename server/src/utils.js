import * as mm from "music-metadata";
import bs from "binary-search";
const hasha = require("hasha");
const fs = require("fs");

export const supportedFiles = ["mp3", , "mp4", "ogg", "wav", "flac"];

export function isFileSupported(file) {
  const name = typeof file === "string" ? file : file.name;
  return supportedFiles.some(supported =>
    name.match(new RegExp(`.${supported}$`))
  );
}

export function extractMusicTags(file) {
  return mm.parseFile(file, { native: true });
}

export async function getHash(file) {
  return await hasha.fromFile(file, { algorithm: "sha1" });
}
