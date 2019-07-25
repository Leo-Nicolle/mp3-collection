export default class Query {
  constructor(database) {
    this.database = database;
  }
  find(queryHash) {
    let result = {};
    const artist = this.database.data.artists.find(({ albums }) => {
      const album = albums.find(({ tracks }) => {
        const track = tracks.find(({ hash }) => track.hash == queryHash);
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

    const result = this.find(hash);
    if (!result) return;
    const { track, album, artist } = result;

    if (updates.title) {
      track.title = updates.title;
    }
    if (updates.album) {
      const albumExists = artist.albums.find(
        ({ name }) => name === updates.album
      );
      const targetAlbum = albumExists || {
        name: updates.album,
        file: this.database._getDataFilePath(),
        tracks: []
      };

      album.tracks = album.tracks.filter(({ hash }) => hash !== track.hash);
      targetAlbum.push(track);
      if (!albumExists) {
        artist.albums.push(album);
      }
    }

    if (target.artist) {
      const artistExists = this.database.data.artists.find(
        ({ name }) => name === updates.artist
      );
      const targetArtist = artistExists || {
        name: updates.artist,
        file: this.database._getDataFilePath(),
        allTracksFile: this._getDataFilePath(),
        albums: []
      };

      artist.albums = artist.albums.filter(({ name }) => name !== album.name);
      targetArtist.push(album);
      if (!artistExists) {
        this.database.data.artists.push(artist);
      }
    }
    this.database.export();
  }
}
