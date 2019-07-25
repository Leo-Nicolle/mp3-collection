export default class Query {
  constructor(database) {
    this.database = database;
    this.updateQueue = [];
  }
  find(queryHash) {
    let result = {};
    const artist = this.database.data.artists.find(({ albums }) => {
      const album = albums.find(({ tracks }) => {
        const track = tracks.find(({ hash }) => hash == queryHash);
        if (!track) return;
        result.track = track;
        return true;
      });
      if (!album) return;
      result.album = album;
      return true;
    });
    if (!artist) return;
    result.artist = artist;
    return result;
  }
  exists(queryHash) {
    return Boolean(this.find(queryHash));
  }
  select({ artist = ".*", album = ".*", genre = ".*", track = ".*" } = {}) {
    const rows = [];
    this.database.data.artists
      .filter(({ name }) => name.match(new RegExp(artist)))
      .map(artist => {
        return artist.albums
          .filter(({ name }) => name.match(new RegExp(album)))
          .map(album => {
            return album.tracks.filter(({ name, hash }) => {
              if (!name.match(new RegExp(track))) return;
              rows.push({
                artist: artist.name,
                album: album.name,
                title: name,
                hash
              });
            });
          });
      });
    return rows;
  }
  update({ hash, updates }) {
    if (!Object.keys(updates).length) return;
    this.updateQueue.push(hash);
    this.database.state.xhr.ratio = 0.9;
    this.database.state.xhr.task = "updating files";

    const result = this.find(hash);
    if (!result) return;
    const { track, album, artist } = result;

    let targetAlbum = updates.album;
    let targetArtist = updates.artist;

    if (updates.artist) {
      ({ targetArtist, targetAlbum } = this._updateArtist({
        track,
        album,
        artist,
        targetArtistName: updates.artist
      }));
    }
    if (updates.album) {
      this._updateAlbum({
        track,
        targetAlbum,
        artist: targetArtist,
        targetAlbumName: updates.album
      });
    }
    if (updates.title) {
      this._updateTrack({ track, name: updates.title });
    }
    this.database.export();
    this.updateQueue.shift();
    this.database.state.xhr.ratio = this.updateQueue.length ? 0.9 : 1;
  }

  _updateArtist({ track, album, artist, targetArtistName }) {
    const artistExists = this.database.data.artists.find(
      ({ name }) => name === targetArtistName
    );
    const targetArtist = artistExists || {
      name: targetArtistName,
      file: this.database._getDataFilePath(),
      allTracksFile: this.database._getDataFilePath(),
      albums: []
    };
    if (!artistExists) {
      this.database.data.artists.push(targetArtist);
    }
    const targetAlbum = this._updateAlbum({
      track,
      album,
      artist,
      targetArtist,
      targetAlbumName: album.name
    });
    return { targetArtist, targetAlbum };
  }

  _updateAlbum({ track, album, artist, targetArtist, targetAlbumName }) {
    if (!targetArtist) {
      targetArtist = artist;
    }
    const albumExists = targetArtist.albums.find(
      ({ name }) => name === targetAlbumName
    );
    const targetAlbum = albumExists || {
      name: targetAlbumName,
      file: this.database._getDataFilePath(),
      tracks: []
    };
    // place the track in the new album
    targetAlbum.tracks.push(track);
    // remove the track from it's old album
    album.tracks = album.tracks.filter(t => t !== track);
    //remove the album if empty:
    if (!album.tracks.length) {
      artist.albums = artist.albums.filter(a => a !== album);
    }
    //add album to artist
    if (!albumExists) {
      targetArtist.albums.push(targetAlbum);
    }
    // remove the artist if empty
    if (!artist.albums.length) {
      this.database.data.artists = this.database.data.artists.filter(
        a => a !== artist
      );
    }
    return targetAlbum;
  }

  _updateTrack({ track, targetTrackName }) {
    track.name = targetTrackName;
  }
}
