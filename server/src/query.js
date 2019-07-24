export default class Query {
  constructor(database) {
    this.database = database;
  }
  exists(queryHash) {
    const res = this.database.data.artists.filter(({ albums }) =>
      albums.filter(({ tracks }) =>
        tracks.filter(({ hash }) => hash === queryHash)
      )
    );
    return this.database.data.artists.some(({ albums }) =>
      albums.some(({ tracks }) => tracks.some(({ hash }) => hash === queryHash))
    );
  }
  select({ artist = ".*", album = ".*", genre = ".*", track = ".*" } = {}) {
    const rows = [];
    this.database.data.artists
      .filter(({ name }) => name.match(new RegExp(artist)))
      .map(artist => {
        return artist.albums
          .filter(({ name }) => name.match(new RegExp(album)))
          .map(album => {
            return album.tracks.filter(({ name }) => {
              if (!name.match(new RegExp(track))) return;
              rows.push([artist.name, album.name, name]);
            });
          });
      });
    return rows;
  }
}
