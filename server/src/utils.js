import * as mm from "music-metadata";
import bs from "binary-search";
const fs = require("fs");
const path = require("path");

const MAX_FILES_PER_FOLDER = 65000;
export const supportedFiles = ["mp3", , "mp4", "ogg", "wav", "flac"];
export function isFileSupported(file) {
  const name = typeof file === "string" ? file : file.name;
  return supportedFiles.some(supported => name.includes(supported));
}

export function extractMusicTags(file) {
  return mm.parseFile(file, { native: true });
}

const fields = ["genre", "album", "artist"];
function isNotValidFied(field) {
  return !field || !field.length;
}

function fillBlanksMetadata({ common }) {
  const unknown = "unknown";
  if (isNotValidFied(common.title)) {
    common.title = unknown;
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

export class Database {
  constructor() {
    this.statePath = "data/database-state.json";
    this.databasePath = "data/database.json";
    this.audioFolderRoot = "audio";
    this.dataFolderRoot = "data/files";

    if (fs.existsSync(this.statePath) && false) {
      this.state = JSON.parse(fs.readFileSync(this.statePath));
    } else {
      this.state = {
        audioFolderIndex: 0,
        audioFileIndex: 0,
        dataFolderIndex: 0,
        dataFileIndex: 0,
        audioFilesToCopy: []
      };
    }
    if (fs.existsSync(this.databasePath) && false) {
      this.data = JSON.parse(fs.readFileSync(this.databasePath));
    } else {
      this.data = {
        artists: []
      };
    }
  }
  async add(files) {
    for (let file of files) {
      if (!isFileSupported(file)) continue;
      await this._add(file);
    }
  }
  save() {
    this._mkdirRec(this.databasePath);
    this._mkdirRec(this.statePath);
    fs.writeFileSync(this.databasePath, JSON.stringify(this.data));
    fs.writeFileSync(this.statePath, JSON.stringify(this.state));
  }
  export() {
    this.save();
    const dataFilesToCopy = this._createDataFiles();
    this.copyDataFiles(dataFilesToCopy);
    this.copyAudioFiles();
    this.save();
  }
  copyAudioFiles() {
    this.state.audioFilesToCopy.forEach(({ source, target }, i) => {
      const filePath = path.join(this.audioFolderRoot, target);
      this._mkdirRec(filePath);
      fs.copyFileSync(source, filePath);
      this.state.audioFilesToCopy[i].state = "saved";
    });
    this.state.audioFilesToCopy = this.state.audioFilesToCopy.filter(
      ({ state }) => "saved"
    );
  }
  copyDataFiles(dataFiles) {
    dataFiles.forEach(({ name, content }) => {
      const filePath = path.join(this.dataFolderRoot, name);
      this._mkdirRec(filePath);
      fs.writeFileSync(filePath, content);
    });
  }
  _createDataFiles() {
    let allArtistsFile = "";
    const separator = String.fromCharCode(1);
    const allArtistsFileName = this._getDataFilePath();
    const dataFiles = [];

    this.data.artists.forEach(artist => {
      const artistFilename = this._getDataFilePath();
      allArtistsFile += `${artist.name}${separator}${artistFilename}\n`;
      let artistFile = "";
      artist.albums.forEach(album => {
        const albumFilename = this._getDataFilePath();
        artistFile += `${album.name}${separator}${albumFilename}\n`;
        let albumFile = "";
        album.tracks.forEach(track => {
          albumFile += `${track.name}${separator}${track.files.target}\n`;
        });
        dataFiles.push({ content: albumFile, name: albumFilename });
      });
      dataFiles.push({ content: artistFile, name: artistFilename });
    });
    dataFiles.push({ content: allArtistsFile, name: allArtistsFileName });

    return dataFiles;
  }
  _getAudioFilePath(sourceFile) {
    if (this.state.audioFileIndex === MAX_FILES_PER_FOLDER) {
      this.state.audioFileIndex = 0;
      this.state.audioFolderIndex++;
    }
    const ext = sourceFile.slice(sourceFile.length - 4);
    const name = this._getFileName(this.state.audioFileIndex, ext);
    this.state.audioFileIndex++;
    return path.join(this._getFileName(this.state.audioFolderIndex), name);
  }
  _getDataFilePath() {
    if (this.state.dataFileIndex === MAX_FILES_PER_FOLDER) {
      this.state.dataFileIndex = 0;
      this.state.dataFolderIndex++;
    }
    const name = this._getFileName(this.state.dataFileIndex, ".txt");
    this.state.dataFileIndex++;
    return path.join(this._getFileName(this.state.dataFolderIndex), name);
  }
  _getFileName(number, ext = "") {
    return ("00000000" + number).substr(-8) + ext;
  }

  async _add(file) {
    const metadata = await extractMusicTags(file);
    const target = this._getAudioFilePath(file);
    metadata.files = {
      source: file,
      target,
      state: "toSave"
    };
    this._addToArtists(metadata);
    this.state.audioFilesToCopy.push(metadata.files);
  }

  _addToArtists(metadata) {
    const common = metadata.common;
    let artist = this.data.artists.find(({ name }) => name === common.artist);
    if (!artist) {
      this.data.artists.push({
        name: common.artist,
        albums: []
      });
      artist = this.data.artists[this.data.artists.length - 1];
    }

    let album = artist.albums.find(({ name }) => name === common.album);
    if (!album) {
      artist.albums.push({
        name: common.album,
        tracks: []
      });
      album = artist.albums[artist.albums.length - 1];
    }
    album.tracks.push({ name: common.title, files: metadata.files });
  }
  _mkdirRec(filePath) {
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
}
