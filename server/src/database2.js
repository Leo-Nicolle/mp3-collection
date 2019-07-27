import state from "./state";
import {
  extractMusicTags,
  getHash,
  isFileSupported,
  getFilenameFromPath
} from "./utils";

const uuid = require("uuid/v4");
const low = require("lowdb");
const path = require("path");

const FileSync = require("lowdb/adapters/FileSync");
const adapter = new FileSync("db.json");
const db = low(adapter);
const MAX_FILES_PER_FOLDER = 65000;
class Database2 {
  constructor() {
    db.defaults({ artists: [], albums: {}, tracks: {} }).write();
    this.debounceExport = 0;
  }

  async addFiles(files) {
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      state.xhr.ratio = i / files.length;
      state.xhr.task = `adding file: ${getFilenameFromPath(file)}`;
      if (!isFileSupported(file)) continue;
      await this._addFile(file);
    }
    state.xhr.ratio = 1;
    state.xhr.task = "";
  }

  async _addFile(file) {
    const hash = await getHash(file);
    if (
      db
        .get("tracks")
        .find({ hash })
        .value()
    ) {
      console.log("found");
      return;
    }
    const target = this._getAudioFilePath(file);
    const { common } = await extractMusicTags(file);

    const artistId =
      !db
        .get("artists")
        .find({ name: common.artist })
        .value().id ||
      db
        .get("artists")
        .push({
          id: uuid(),
          name: common.artist,
          file: this._getDataFilePath(),
          allTracksFile: this._getDataFilePath(),
          added: Date.now()
        })
        .write().id;

    const albumId =
      !db
        .get("albums")
        .find({ name: common.album })
        .value().id ||
      db
        .get("albums")
        .push({
          id: uuid(),
          artistId,
          name: common.album,
          file: this._getDataFilePath(),
          added: Date.now()
        })
        .write().id;

    const trackId = db
      .get("tracks")
      .push({
        id: uuid(),
        name: common.title,
        hash,
        added: Date.now(),
        files: {
          source: file,
          target: this._getAudioFilePath(file)
        },
        added: Date.now()
      })
      .write().id;
    // this._createDataFiles();
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
    socket.emit("update");
  }

  _createDataFiles() {
    let allArtistsFile = "";
    const separator = String.fromCharCode(1);
    const allArtistsFileName = state.files.allArtistsFile;
    const dataFiles = [];

    db.get("artits")
      .value()
      .map(row => console.log(row));
    return;

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
    if (state.audioFileIndex === MAX_FILES_PER_FOLDER) {
      state.audioFileIndex = 0;
      state.audioFolderIndex++;
    }
    const ext = sourceFile.slice(sourceFile.length - 4);
    const name = this._getFileName(state.audioFileIndex, ext);
    state.audioFileIndex++;
    return path.join(this._getFileName(state.audioFolderIndex), name);
  }

  _getDataFilePath() {
    if (state.dataFileIndex === MAX_FILES_PER_FOLDER) {
      state.dataFileIndex = 0;
      state.dataFolderIndex++;
    }
    const name = this._getFileName(state.dataFileIndex, ".txt");
    state.dataFileIndex++;
    return path.join(this._getFileName(state.dataFolderIndex), name);
  }

  _getFileName(number, ext = "") {
    return ("00000000" + number).substr(-8) + ext;
  }
}

const database2 = new Database2();
export default database2;
