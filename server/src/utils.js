import * as mm from "music-metadata";
import bs from "binary-search";
const fs = require("fs");

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
    this.rootPath = "data/database.json";
    this.filesIndex = 0;
    if (fs.existsSync(this.rootPath)) {
      this.data = JSON.parse(fs.readFileSync(this.rootPath));
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
    this.export();
  }
  save() {
    fs.writeFileSync(this.rootPath, JSON.stringify(this.data));
  }
  export(path = "data/tests") {
    let allArtistsFile = "";
    const separator = String.fromCharCode(1);
    const allArtistsFileName = this._getIndexName();
    let files = [allArtistsFile];
    console.log(this.data.artists);
    this.data.artists.forEach(artist => {
      const artistFilename = this._getIndexName();
      allArtistsFile += `${artist.name}${separator}${artistFilename}\n`;
      let artistFile = "";
      artist.albums.forEach(album => {
        const albumFilename = this._getIndexName();
        artistFile += `${album.name}${separator}${albumFilename}\n`;
        let albumFile = "";
        album.tracks.forEach(track => {
          albumFile += `${track.name}${separator}${track.file}\n`;
        });
        files.push({ content: albumFile, name: albumFilename });
      });
      files.push({ content: artistFile, name: artistFilename });
    });
    files.push({ content: allArtistsFile, name: allArtistsFileName });
    console.log(files);

    files.forEach(({ name, content }) =>
      fs.writeFileSync(path + "/" + name, content)
    );
  }
  _getIndexName({ increment = true, ext = ".txt" } = {}) {
    const name = this._getName(this.filesIndex, ext);
    if (increment) {
      this.filesIndex++;
    }
    return name;
  }
  _getName(number, ext) {
    return ("00000000" + number).substr(-8) + ext;
  }

  async _add(file) {
    const metadata = await extractMusicTags(file);
    console.log(this);
    this._addToArtists({ metadata, file });
  }

  _addToArtists({ metadata, file }) {
    const common = metadata.common;
    console.log("data", this);
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
    album.tracks.push({ name: common.title, file });
  }
}
