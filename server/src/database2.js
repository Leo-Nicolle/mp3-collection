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
if (!fs.existsSync("data")) {
  fs.mkdirSync("data");
}

const FileSync = require("lowdb/adapters/FileSync");
const adapter = new FileSync("data/db.json");
const db = low(adapter);
const MAX_FILES_PER_FOLDER = 65000;
class Database2 {
  constructor() {
    db.defaults({
      artists: [],
      albums: [],
      tracks: []
      // audioPaths: []
    }).write();
    this.debounceExport = 0;
    this.dataFolderRoot = "data/files";
    this.audioFolderRoot = "audio";
    if (!state.allArtistsFile) {
      state.allArtistsFile = this._getDataFilePath();
    }
    this.subFoldersDepth = 3;
  }

  async addFiles(files) {
    state.reinitTasks({ name: "adding files", tasks: files.length });
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!isFileSupported(file)) continue;
      await this._addFile(file);
    }
    this.syncDataFiles();
  }
  _getByIds(table, ids = []) {
    return ids.reduce(
      (rows, id) => rows.concat(table.filter({ id }).value()),
      []
    );
  }
  _getSetOfValuesForKey(rows, key) {
    return [...new Set(rows.map(r => r[key]))];
  }

  select(query = {}) {
    query = Object.assign({ artist: {}, album: {}, track: {} }, query);

    let rows = [];
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
                  album: album.name,
                  path: path.dirname(track.files.source),
                  ...track
                }))
            )
          )
      );
    if (query.files) {
      rows = rows.filter(({ files }) =>
        files.source.includes(query.files.source)
      );
    }
    return rows;
  }

  updateMetadata({ table, metadata, trackId }) {
    console.log(table, metadata, trackId);
    const track = db
      .get("tracks")
      .find({ id: trackId })
      .value();
    console.log(track);

    const trackAlbum = db
      .get("albums")
      .find({ id: track.albumId })
      .value();

    // const trackArtist = db
    //   .get("artist")
    //   .find({ id: track.artistId })
    //   .value();

    if (table === "artist") {
      let artist = db
        .get("artists")
        .find({ name: metadata.name })
        .value();
      if (artist) {
        db.get("artists")
          .find({ name: metadata.name })
          .assign(metadata)
          .write();
      } else {
        artist = this._addArtist(metadata);
      }
      const artistId = artist.id;

      let album = db
        .get("albums")
        .find({ artistId, name: trackAlbum.name })
        .value();
      if (!album) {
        album = this._addAlbum({ ...trackAlbum, artistId });
      }
      const albumId = album.id;
      db.get("tracks")
        .find({ id: trackId })
        .assign({ artistId, albumId })
        .write();
    }

    // if (table === "albums") {
    //   let album = db
    //     .get("albums")
    //     .find({ name: query.name, artistId: metadata.id })
    //     .value();
    //   if (!album) {
    //     album = this._addAlbum({ ...metadata });
    //   }
    // }
  }

  updateRow(table, id, update) {
    db.get(table)
      .find({ id })
      .assign(update)
      .value();
  }

  removeEmptyRows() {
    const albumIds = this._getSetOfValuesForKey(
      db.get("tracks").values,
      "albumId"
    );
    // TODO: save data files paths to reuse them
    db.get("albums")
      .value()
      .forEach(({ id }) => {
        const index = albumIds.findIndex(albumId => albumId === id);
        if (index < 0) {
          db.get("albums").remove({ id });
        } else {
          albumIds.splice(index, 1);
        }
      });
    db.get("albums").write();

    const artistIds = this._getSetOfValuesForKey(
      db.get("tracks").values,
      "artistId"
    );
    db.get("artists")
      .value()
      .forEach(({ id }) => {
        const index = artistIds.findIndex(artistId => artistId === id);
        if (index < 0) {
          db.get("artists").remove({ id });
        } else {
          artistIds.splice(index, 1);
        }
      });
    db.get("artists").write();
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
    const { common } = await extractMusicTags(file);
    let artist = db
      .get("artists")
      .find({ name: common.artist })
      .value();
    if (!artist) {
      artist = this._addArtist({
        name: common.artist
      });
    }
    const artistId = artist.id;

    let album = db
      .get("albums")
      .find({ name: common.album, artistId })
      .value();
    if (!album) {
      album = this._addAlbum({
        name: common.album
      });
    }
    const albumId = album.id;

    const files = {
      source: file,
      target: this._getAudioFilePath(file)
    };
    const track = this._addTrack({
      title: common.title,
      albumId,
      artistId,
      hash,
      files
    });
    const filePath = path.join(this.audioFolderRoot, files.target);
    mkdirRec(filePath);
    fs.copyFile(files.source, filePath, error => {
      state.incrementTask();
    });
  }

  syncDataFiles() {
    this.removeEmptyRows();
    const dataFilesToCopy = this._createDataFiles();
    this._copyDataFiles(dataFilesToCopy);
  }
  _copyDataFiles(dataFiles) {
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
    this.syncDataFiles();
    this.save();
    socket.emit("update");
  }

  _createDataFiles() {
    let allArtistsFile = "";
    const separator = String.fromCharCode(1);
    const allArtistsFileName = state.allArtistsFile;
    const dataFiles = [];
    db.get("artists")
      .value()
      .forEach(artist => {
        allArtistsFile += this._formatString127(artist.name, artist.file);
        let artistFile = "";
        let allTracksFile = [];
        db.get("albums")
          .filter({ artistId: artist.id })
          .value()
          .forEach(album => {
            artistFile += this._formatString127(
              `All tracks`,
              artist.allTracksFile
            );
            artistFile += this._formatString127(album.name, album.file);
            let albumFile = "";
            db.get("tracks")
              .filter({ albumId: album.id })
              .value()
              .forEach(track => {
                const trackData = this._formatString127(
                  track.title,
                  track.files.target
                );

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

  _getDataFilePath() {
    const filePath = this._getFilePath(state.dataFileIndex, ".txt");
    state.dataFileIndex++;
    return filePath;
  }
  _getAudioFilePath(sourceFile) {
    const ext = sourceFile.slice(sourceFile.length - 4);
    const filePath = this._getFilePath(state.audioFileIndex, ext);
    state.audioFileIndex++;
    return filePath;
  }
  _getFilePath(n, ext) {
    return (
      new Array(this.subFoldersDepth)
        .fill(0)
        .map(() => {
          const res = n % MAX_FILES_PER_FOLDER;
          n = Math.floor(n / MAX_FILES_PER_FOLDER);
          return res;
        })
        .reverse()
        .reduce((fileName, number) => {
          const name = ("00000000" + number).substr(-8);
          return fileName.length ? path.join(fileName, name) : name;
        }, "") + ext
    );
  }
  _formatString127(info, file) {
    const separator = String.fromCharCode(1);
    const infoMaxLength = 128 - file.length;
    const trimed =
      info.length > infoMaxLength ? info.slice(0, infoMaxLength) : info;

    const sum = `${trimed}${separator}${file}${separator}`;
    return sum + "_".repeat(127 - sum.length) + "\n";
  }

  _addTrack(data) {
    const id = uuid();
    db.get("tracks")
      .push({
        ...this._getDefaultValue("tracks"),
        ...data,
        id
      })
      .write();
    return db
      .get("tracks")
      .find({ id })
      .value();
  }

  _addAlbum(data) {
    const id = uuid();
    db.get("albums")
      .push({
        ...this._getDefaultValue("albums"),
        ...data,
        id
      })
      .write();
    return db
      .get("albums")
      .find({ id })
      .value();
  }
  _addArtist(data) {
    const id = uuid();
    db.get("artists")
      .push({
        ...this._getDefaultValue("artists"),
        ...data,
        id
      })
      .write();
    return db
      .get("artists")
      .find({ id })
      .value();
  }

  _getDefaultValue(table) {
    if (table === "artists") {
      return {
        id: uuid(),
        file: this._getDataFilePath(),
        allTracksFile: this._getDataFilePath(),
        added: Date.now()
      };
    } else if (table === "albums") {
      return {
        id: uuid(),
        file: this._getDataFilePath(),
        added: Date.now()
      };
    } else if (table === "tracks") {
      return {
        id: uuid(),
        added: Date.now(),
        added: Date.now()
      };
    } else {
      return {};
    }
  }
}

const database2 = new Database2();

export default database2;
