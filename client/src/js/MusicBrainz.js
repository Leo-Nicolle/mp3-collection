import axios from "axios";
const stringSimilarity = require("string-similarity");
class MusicBrainz {
  constructor() {
    this.url = "http://musicbrainz.org/ws/2/";
    this.limit = 100;
  }

  autotagAlbum({ rows, albumName, artistName }) {
    this.findPossibleAlbums(albumName)
      .then(releases => {
        const release = releases[0].releases[0];
        return Promise.all([
          release,
          this.get({
            type: "recording",
            key: "release",
            value: release.id
          })
        ]);
      })
      .then(([release, response]) => {
        const recordings = response.data.recordings;
        console.log("release ! ", release);
        return rows.map(
          row =>
            recordings
              .map(recording => ({
                score: stringSimilarity.compareTwoStrings(
                  recording.title,
                  row.title
                ),
                row,
                recording
              }))
              .sort((a, b) => b.score - a.score)[0]
        );
      })
      .then(pairs => {
        console.log(pairs);
      });
  }
  findPossibleArtist(artistName, { limit = 5 } = {}) {
    return this.search({
      type: "artist",
      query: {
        name: artistName
      },
      limit
    }).then(({ data }) => {
      const artists = data["artists"];
      return artists
        .map(artist => ({
          score: stringSimilarity.compareTwoStrings(artistName, artist.name),
          artist
        }))
        .sort((a, b) => b.score - a.score)
        .map(({ artist }) => artist);
    });
  }
  findPossibleAlbums(albumName) {
    return this.search({
      type: "release-group",
      query: {
        release: albumName
      }
    }).then(({ data }) => {
      const releases = data["release-groups"];
      return releases
        .map(release => ({
          score: stringSimilarity.compareTwoStrings(albumName, release.title),
          release
        }))
        .sort((a, b) => b.score - a.score)
        .map(({ release }) => release);
    });
  }

  search({ type, query, limit = this.limit } = {}) {
    const stringQuery = Object.entries(query).reduce(
      (stringQuery, [key, value], i) => {
        return `${stringQuery}${i === 0 ? "" : "%20AND%20"}${key}:${value}`;
      },
      "?query="
    );
    return axios.get(`${this.url}${type}/${stringQuery}&limit=${limit}`, {
      headers: {
        "User-Agent": "mp3-collection Leo-Nicolle"
      }
    });
  }

  get({ type, key, value }) {
    return axios.get(`${this.url}${type}?${key}=${value}`, {
      headers: {
        "User-Agent": "mp3-collection Leo-Nicolle"
      }
    });
  }
}
const musicBrainz = new MusicBrainz();
export default musicBrainz;
