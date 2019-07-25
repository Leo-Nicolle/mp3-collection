const MusicBrainzApi = require("musicbrainz-api").MusicBrainzApi;

class MusicBrainz {
  constructor() {
    this.api = new MusicBrainzApi({
      appName: "mp3-collection",
      appVersion: "0.0.1",
      appMail: "nicolle_leo@yahoo.fr"
    });
  }

  async search({ key, value }) {
    return await this.api.search(key, value);
  }
}
const musicBrainz = new MusicBrainz();
export default musicBrainz;
