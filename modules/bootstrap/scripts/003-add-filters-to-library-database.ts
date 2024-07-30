import { Migration } from './Migration'

export class AddFiltersToLibraryDatabase extends Migration {
  private readonly dbName = 'library'

  get name(): string { return 'Add filters to library database' }

  async shouldMigrate(): Promise<boolean> {
    try {
      await this.server.db.use(this.dbName).get('_design/library')
      return false // Document exists
    } catch (error) {
      return true // Document does not exist
    }
  }

  async migrate(): Promise<void> {
    await this.server.request({
      db: this.dbName,
      method: 'PUT',
      doc: '_design/library',
      body: {
        filters: {
          // @ts-ignore
          trackInfos: function (doc) {
            return doc._id.startsWith("track::")
                && doc._id.endsWith("::info");
          },

          // @ts-ignore
          trackTranscripts: function (doc, req) {
            const idTokens = doc._id.split("::");

            // Transcript ID format: track::<trackId>::transcript::<languageCode>
            if (idTokens.length !== 4) { return false; }

            // Extract document information from ID
            const docType = idTokens[0];
            const trackId = idTokens[1];
            const docSubType = idTokens[2];
            const requestedTrackIds = req.query.trackIds;

            // Check if the document is a transcript and
            // if the track ID is in the requested list
            return docType === "track"
                && docSubType === "transcript"
                && requestedTrackIds.includes(trackId);
          },

          // @ts-ignore
          dictionaryData: function (doc, req) {
            return doc._id.startsWith("location::")
                || doc._id.startsWith("source::")
                || doc._id.startsWith("author::");
          }
        }
      }
    })
  }

  async revert(): Promise<void> {
    await this.server.request({
      db: this.dbName,
      method: 'DELETE',
      doc: '_design/library'
    })
  }
}
