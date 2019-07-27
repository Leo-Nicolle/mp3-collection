import * as mm from "music-metadata";
import bs from "binary-search";
const hasha = require("hasha");
const fs = require("fs");
const path = require("path");

export const supportedFiles = ["mp3", , "mp4", "ogg", "wav", "flac"];

export function isFileSupported(file) {
  const name = typeof file === "string" ? file : file.name;
  return supportedFiles.some(supported =>
    name.match(new RegExp(`.${supported}$`))
  );
}

export function getAudioFiles(directory, { recursive = false } = {}) {
  const files = fs.readdirSync(directory).filter(f => isFileSupported(f));
  const paths = files.map(f => path.join(directory, f));
  const promises = paths.map(file => extractMusicTags(file));

  return Promise.all(promises).then(metadatas =>
    metadatas.map((metadata, i) => ({
      file: files[i],
      path: paths[i],
      metadata: metadata.common
    }))
  );
}

function metadataToArray({ common }) {
  return [common.artist, common.album, common.title];
}
export async function extractMusicTags(file) {
  const metadata = await mm.parseFile(file, { native: true });
  fillBlanksMetadata({ ...metadata, file });
  return metadata;
}

export async function getHash(file) {
  return await hasha.fromFile(file, { algorithm: "sha1" });
}

function isNotValidFied(field) {
  return !field || !field.length;
}
export function getFilenameFromPath(
  filepath,
  { removeExtension = false } = {}
) {
  const splited = filepath.split(path.sep);
  let filename = splited[splited.length - 1];
  if (removeExtension) {
    filename = filename.slice(0, filename.length - 4);
  }
  return filename;
}

export function fillBlanksMetadata({ common, file }) {
  const unknown = "unknown";
  if (isNotValidFied(common.title)) {
    common.title = getFilenameFromPath(file, { removeExtension: true });
  }
  if (!common.artists) {
    if (isNotValidFied(common.artist)) {
      common.artists = [unknown];
      common.artist = unknown;
    } else {
      common.artists = [common.artist];
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

export function mkdirRec(filePath) {
  //get the folder names, filter the file names
  const folders = filePath
    .split(path.sep)
    .filter(element => !element.match(/.*\.\w\w\w\w?$/i));

  let totalPath = "";
  folders.forEach(folder => {
    totalPath = path.join(totalPath, folder);
    if (fs.existsSync(totalPath)) return;
    fs.mkdirSync(totalPath);
  });
}
