import { database } from "./utils";

export default class Query {
  constructor() {}

  static select({
    artist = ".*",
    album = ".*",
    genre = ".*",
    track = ".*"
  } = {}) {
    const rows = [];
    database.data.artists
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
