import * as mm from "music-metadata";
import bs from "binary-search";

export const supportedFiles = ["mp3", , "mp4", "ogg", "wav", "flac"];

export function isFileSupported(file) {
  const name = typeof file === "string" ? file : file.name;
  return supportedFiles.some(supported => name.includes(supported));
}

export function extractMusicTags(file) {
  return mm.parseFile(file, { native: true });
}
