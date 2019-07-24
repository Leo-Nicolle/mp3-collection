import * as mm from "music-metadata";
import bs from "binary-search";
const fs = require("fs");
const path = require("path");
// const mmh3 = require("murmurhash3");

const MAX_FILES_PER_FOLDER = 65500;
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

class Database {
  constructor() {
    this.statePath = "data/database-state.json";
    this.databasePath = "data/database.json";
    this.audioFolderRoot = "audio";
    this.dataFolderRoot = "data/files";

    if (fs.existsSync(this.statePath)) {
      this.state = JSON.parse(fs.readFileSync(this.statePath));
    } else {
      this.state = {
        audioFolderIndex: 0,
        audioFileIndex: 0,
        dataFolderIndex: 0,
        dataFileIndex: 0,
        audioFilesToCopy: []
      };
      this.state.files = {
        allArtistsFile: this._getDataFilePath(),
        allAlbumsFile: this._getDataFilePath(),
        allGenreFile: this._getDataFilePath(),
        allTracksFile: this._getDataFilePath()
      };
    }
    if (fs.existsSync(this.databasePath)) {
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
    const allArtistsFileName = this.state.files.allArtistsFile;
    const dataFiles = [];

    this.data.artists.forEach(artist => {
      allArtistsFile += `${artist.name}${separator}${artist.file}\n`;
      let artistFile = "";
      let allTracksFile = "";
      artist.albums.forEach(album => {
        artistFile += `All tracks${separator}${artist.allTracksFile}\n`;
        artistFile += `${album.name}${separator}${album.file}\n`;
        let albumFile = "";
        album.tracks.forEach(track => {
          const trackData = `${track.name}${separator}${track.files.target}\n`;
          albumFile += trackData;
          allTracksFile += trackData;
        });
        dataFiles.push({ content: albumFile, name: album.file });
      });
      dataFiles.push({ content: artistFile, name: artist.file });
      dataFiles.push({
        content: allTracksFile.sort((a, b) => a - b),
        name: artist.allTracksFile
      });
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
    this._addToArtists({ metadata, file });
  }

  _checkIfExists(file) {
    // mmh3.murmur32(file [,seed], callback);
  }

  _addToArtists({ metadata, file }) {
    const common = metadata.common;
    let artist = this.data.artists.find(({ name }) => name === common.artist);
    if (!artist) {
      this.data.artists.push({
        name: common.artist,
        file: this._getDataFilePath(),
        allTracksFile: this._getDataFilePath(),
        albums: []
      });
      artist = this.data.artists[this.data.artists.length - 1];
    }

    let album = artist.albums.find(({ name }) => name === common.album);
    if (!album) {
      artist.albums.push({
        name: common.album,
        file: this._getDataFilePath(),
        tracks: []
      });
      album = artist.albums[artist.albums.length - 1];
    }
    const trackData = {
      name: common.title,
      state: "toSave",
      files: {
        source: file,
        target
      }
    };
    album.tracks.push(trackData);
    this.state.audioFilesToCopy.push(trackData);
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
export const database = new Database();
