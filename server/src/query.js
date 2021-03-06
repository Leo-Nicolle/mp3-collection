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
  select({
    artist = ".*",
    album = ".*",
    genre = ".*",
    track = ".*",
    added = { tolerance: new Date(0).setDate(1) }
  } = {}) {
    const rows = [];
    this.database.data.artists
      .filter(({ name }) => name.match(new RegExp(artist)))
      .map(artist => {
        return artist.albums
          .filter(({ name }) => name.match(new RegExp(album)))
          .map(album => {
            return album.tracks.filter(row => {
              if (!row.name.match(new RegExp(track))) return;
              if (
                added.value &&
                Math.abs(added - added.value) > added.tolerance
              )
                return;
              rows.push({
                ...row,
                artist: artist.name,
                album: album.name,
                title: row.name
              });
            });
          });
      });
    return rows;
  }

  updateArtist({ name, updates }) {
    console.log("updateArtist", name, updates);
    if (!Object.keys(updates).length) return;
    const artist = this.database.data.artists.find(a => a.name === name);

    let artistExists =
      updates.name &&
      this.database.data.artists.find(a => a.name === updates.name);
    const targetArtist = artistExists || artist;

    Object.entries(updates).forEach(([key, value]) => {
      targetArtist[key] = value;
    });

    if (artistExists && artist !== targetArtist) {
      // add the albums to the target artist
      const { existing, nonExisting } = artist.albums.reduce(
        (albums, album) => {
          const targetAlbum = targetArtist.albums.find(
            ({ name }) => name === album.name
          );
          if (targetAlbum) {
            albums.existing.push({
              targetAlbum,
              album
            });
          } else {
            albums.nonExisting.push(album);
          }
          return albums;
        },
        { existing: [], nonExisting: [] }
      );
      // merge what exists and add what does not
      existing.forEach(({ targetAlbum, album }) => {
        album.tracks.forEach(track => targetAlbum.tracks.push(track));
      });
      targetArtist.albums.push(...nonExisting);

      //remove the artist from the database
      this.database.data.artists = this.database.data.artists.filter(
        a => a !== artist
      );
    }
    this.database.export();
  }

  updateAlbum({ artistName, name, updates }) {
    if (!Object.keys(updates).length) return;
    const artist = this.database.data.artists.find(a => a.name === artistName);
    const album = artist.albums.find(a => a.name === name);

    let albumExists =
      updates.name && artist.albums.find(a => a.name === updates.name);
    const targetAlbum = albumExists || album;

    Object.entries(updates).forEach(([key, value]) => {
      targetAlbum[key] = value;
    });

    if (albumExists && album !== targetAlbum) {
      // add the new tracks to the target album
      const newTracks = album.tracks.filter(
        track => !targetAlbum.tracks.some(({ hash }) => hash === track.hash)
      );
      targetAlbum.tracks.push(...newTracks);
      //remove the album from the database
      artist.albums = artist.albums.filter(a => a !== album);
    }
    this.database.export();
  }

  updateTrack({ hash, updates }) {
    if (!Object.keys(updates).length) return;
    console.log("update track ", hash, JSON.stringify(updates));
    this.updateQueue.push(hash);
    this.database.state.xhr.ratio = 0.9;
    this.database.state.xhr.task = "updating files";

    const result = this.find(hash);
    if (!result) return;
    const { track, album, artist } = result;

    let targetAlbum = updates.album;
    let targetArtist = updates.artist;

    if (updates.artist) {
      ({ targetArtist, targetAlbum } = this._updateTrackArtist({
        track,
        album,
        artist,
        targetArtistName: updates.artist
      }));
    }
    if (updates.album) {
      this._updateTrackAlbum({
        track,
        album: targetAlbum,
        artist: targetArtist,
        targetAlbumName: updates.album
      });
    }
    if (updates.title) {
      console.log("update title", updates.title);
      this._updateTrack({ track, name: updates.title });
    }
    this.database.export();
    this.updateQueue.shift();
    this.database.state.xhr.ratio = this.updateQueue.length ? 0.9 : 1;
  }

  _updateTrackArtist({ track, album, artist, targetArtistName }) {
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
    const targetAlbum = this._updateTrackAlbum({
      track,
      album,
      artist,
      targetArtist,
      targetAlbumName: album.name
    });
    if (targetArtistName !== artist.name) {
      this.database.data.artists = this.database.artists.filter(
        a => a !== artist
      );
    }
    return { targetArtist, targetAlbum };
  }

  _updateTrackAlbum({ track, album, artist, targetArtist, targetAlbumName }) {
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
    if (targetAlbum.tracks.includes(track)) {
      return;
    }
    // place the track in the new album
    targetAlbum.tracks.push(track);
    // remove the track from it's old album
    console.log("ici", album.tracks, artist.albums);
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

  _updateTrack({ track, name }) {
    track.name = name;
  }
  _getDefaultTolerance() {
    return new Date(0).setDate(1);
  }
}
