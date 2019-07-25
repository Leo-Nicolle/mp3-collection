const fs = require("fs");
const path = require("path");
const rimraf = require("rimraf");

import {
  extractMusicTags,
  getHash,
  isFileSupported,
  getFilenameFromPath
} from "./utils";
import Query from "./query";
const MAX_FILES_PER_FOLDER = 65500;

class Database {
  constructor() {
    this.statePath = "data/database-state.json";
    this.databasePath = "data/database.json";
    this.audioFolderRoot = "audio";
    this.dataFolderRoot = "data/files";
    this.query = new Query(this);
    if (fs.existsSync(this.statePath)) {
      this.state = JSON.parse(fs.readFileSync(this.statePath));
    } else {
      this.state = {
        audioFolderIndex: 0,
        audioFileIndex: 0,
        dataFolderIndex: 0,
        dataFileIndex: 0,
        audioFilesToCopy: [],
        xhr: {
          ratio: 0,
          task: ""
        }
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
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      this.state.xhr.ratio = i / files.length;
      this.state.xhr.task = `adding file: ${getFilenameFromPath(file)}`;
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve();
        }, 1000);
      });
      if (!isFileSupported(file)) continue;
      await this._add(file);
    }
    this.state.xhr.ratio = 1;
    this.state.xhr.task = "";
  }
  save() {
    this._mkdirRec(this.databasePath);
    this._mkdirRec(this.statePath);
    fs.writeFileSync(this.databasePath, JSON.stringify(this.data));
    fs.writeFileSync(this.statePath, JSON.stringify(this.state));
  }
  export() {
    if (this.debounceExport) {
      clearTimeout(this.debounceExport);
    }
    this.debounceExport = setTimeout(() => {
      this._export();
    }, 500);
  }

  _export() {
    this.save();
    const dataFilesToCopy = this._createDataFiles();
    this.copyDataFiles(dataFilesToCopy);
    this.copyAudioFiles();
    this.save();
  }
  copyAudioFiles() {
    this.state.audioFilesToCopy.forEach(({ files }, i) => {
      const { source, target } = files;
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
    rimraf.sync(this.dataFolderRoot);
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
      let allTracksFile = [];
      artist.albums.forEach(album => {
        artistFile += `All tracks${separator}${artist.allTracksFile}\n`;
        artistFile += `${album.name}${separator}${album.file}\n`;
        let albumFile = "";
        album.tracks.forEach(track => {
          const trackData = `${track.name}${separator}${track.files.target}\n`;
          albumFile += trackData;
          allTracksFile.push(trackData);
        });
        dataFiles.push({ content: albumFile, name: album.file });
      });
      dataFiles.push({ content: artistFile, name: artist.file });
      dataFiles.push({
        content: allTracksFile.sort((a, b) => a - b).join(""),
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
    const hash = await getHash(file);
    if (this.query.exists(hash)) {
      return;
    }
    const target = this._getAudioFilePath(file);
    const metadata = await extractMusicTags(file);
    this._addToArtists({ metadata, file, hash, target });
  }

  _addToArtists({ metadata, file, hash, target }) {
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
      hash,
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
export const query = database.query;
