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
          }.toString()
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
