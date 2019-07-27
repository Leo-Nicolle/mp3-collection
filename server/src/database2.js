import state from "./state";
import {
  extractMusicTags,
  getHash,
  isFileSupported,
  getFilenameFromPath,
  mkdirRec
} from "./utils";

const uuid = require("uuid/v4");
const low = require("lowdb");
const path = require("path");
const fs = require("fs");
const rimraf = require("rimraf");

const FileSync = require("lowdb/adapters/FileSync");
const adapter = new FileSync("db.json");
const db = low(adapter);
const MAX_FILES_PER_FOLDER = 65000;
class Database2 {
  constructor() {
    db.defaults({
      artists: [],
      albums: [],
      tracks: []
    }).write();
    this.debounceExport = 0;
    this.dataFolderRoot = "data/files";
    this.allArtistsFile = this._getDataFilePath();
    this.subFoldersDepth = 3;
  }

  async addFiles(files) {
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      state.xhr.ratio = i / files.length;
      state.xhr.task = `adding file: ${getFilenameFromPath(file)}`;
      if (!isFileSupported(file)) continue;
      console.log("add", file);
      await this._addFile(file);
    }
    state.xhr.ratio = 1;
    state.xhr.task = "";
  }

  select(query = {}) {
    query = Object.assign({ artist: {}, album: {}, track: {} }, query);
    const rows = [];
    console.log(
      "dsada",
      query,
      db
        .get("tracks")
        .filter({
          albumId: "13f7e17d-7d2b-4494-b676-1f3ab1a59834",
          ...query.track
        })
        // .filter(query.track)
        .value()
    );
    db.get("artists")
      .filter(query.artist)
      .value()
      .forEach(artist =>
        db
          .get("albums")
          .filter({ artistId: artist.id, ...query.album })
          .value()
          .forEach(album =>
            rows.push(
              ...db
                .get("tracks")
                .filter({ albumId: album.id, ...query.track })
                .value()
                .map(track => ({
                  artist: artist.name,
                  artistId: artist.id,
                  album: album.name,
                  albumId: album.id,
                  ...track
                }))
            )
          )
      );
    return rows;
  }

  async _addFile(file) {
    const hash = await getHash(file);
    if (
      db
        .get("tracks")
        .find({ hash })
        .value()
    ) {
      return;
    }
    const target = this._getAudioFilePath(file);
    const { common } = await extractMusicTags(file);

    const artist =
      db
        .get("artists")
        .find({ name: common.artist })
        .value() ||
      db
        .get("artists")
        .push({
          id: uuid(),
          name: common.artist,
          file: this._getDataFilePath(),
          allTracksFile: this._getDataFilePath(),
          added: Date.now()
        })
        .write();
    const artistId = artist.length ? artist[0].id : artist.id;

    const album =
      db
        .get("albums")
        .find({ name: common.album })
        .value() ||
      db
        .get("albums")
        .push({
          id: uuid(),
          artistId,
          name: common.album,
          file: this._getDataFilePath(),
          added: Date.now()
        })
        .write();
    const albumId = album.length ? album[0].id : album.id;

    const trackId = db
      .get("tracks")
      .push({
        id: uuid(),
        title: common.title,
        albumId,
        hash,
        added: Date.now(),
        files: {
          source: file,
          target: this._getAudioFilePath(file)
        },
        added: Date.now()
      })
      .write().id;
    const dataFilesToCopy = this._createDataFiles();
    this.copyDataFiles(dataFilesToCopy);
  }
  copyDataFiles(dataFiles) {
    rimraf.sync(this.dataFolderRoot);
    dataFiles.forEach(({ name, content }) => {
      const filePath = path.join(this.dataFolderRoot, name);
      mkdirRec(filePath);
      fs.writeFileSync(filePath, content);
    });
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
    const allArtistsFileName = this.allArtistsFile;
    const dataFiles = [];
    db.get("artists")
      .value()
      .forEach(artist => {
        allArtistsFile += `${artist.name}${separator}${artist.file}\n`;
        let artistFile = "";
        let allTracksFile = [];
        db.get("albums")
          .filter({ artistId: artist.id })
          .value()
          .forEach(album => {
            artistFile += `All tracks${separator}${artist.allTracksFile}\n`;
            artistFile += `${album.name}${separator}${album.file}\n`;
            let albumFile = "";
            db.get("tracks")
              .filter({ albumId: album.id })
              .value()
              .forEach(track => {
                const trackData = `${track.name}${separator}${
                  track.files.target
                }\n`;
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
    let n = state.dataFileIndex;
    return (
      new Array(this.subFoldersDepth)
        .fill(0)
        .map(() => {
          const res = n % MAX_FILES_PER_FOLDER;
          n /= Math.floor(MAX_FILES_PER_FOLDER);
          return res;
        })
        .reduce(
          (fileName, number) => path.join(fileName, this._getFileName(number)),
          ""
        ) + ".txt"
    );
  }

  _getFileName(number, ext = "") {
    return ("00000000" + number).substr(-8) + ext;
  }
}

const database2 = new Database2();
export default database2;
