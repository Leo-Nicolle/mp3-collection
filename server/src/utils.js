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

export async function extractMusicTags(file) {
  const metadata = await mm.parseFile(file, { native: true });
  fillBlanksMetadata(metadata);
  return metadata;
}

export async function getHash(file) {
  return await hasha.fromFile(file, { algorithm: "sha1" });
}

function isNotValidFied(field) {
  return !field || !field.length;
}

export function fillBlanksMetadata({ common }) {
  const unknown = "unknown";
  if (isNotValidFied(common.title)) {
    common.title = unknown;
  }
  if (!common.artists) {
    if (common.artist) {
      common.artists = [common.artist];
    } else {
      common.artists = [];
    }
  }
  if (!isNotValidFied(common.artists[0])) {
    if (common.artists.length) {
      common.artists[0] = unknown;
    } else {
      common.artists.push(unknown);
    }
  }
  if (isNotValidFied(common.artist)) {
    common.artist = common.artists[0];
  }
  if (isNotValidFied(common.artist)) {
    common.artist = common.artists[0];
  }

  if (isNotValidFied(common.genre)) {
    common.genre = unknown;
  }
  if (isNotValidFied(common.album)) {
    common.album = unknown;
  }
  if (isNotValidFied(common.year)) {
    common.year = 5000;
  }
}
