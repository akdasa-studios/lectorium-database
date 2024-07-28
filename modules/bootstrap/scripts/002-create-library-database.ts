import { Migration } from './Migration'

export class CreateLibraryDatabase extends Migration {
  private readonly dbName = 'library'

  get name(): string { return 'Create library database' }

  async shouldMigrate(): Promise<boolean> {
    try {
      await this.server.db.get(this.dbName)
      return false // Database exists
    } catch (error) {
      return true // Database does not exist
    }
  }

  async migrate(): Promise<void> {
    await this.server.db.create(this.dbName)

    // Make database publicly readable
    await this.server.request({
      db: this.dbName,
      method: 'PUT',
      doc: '_security',
      body: {
        admins:  { names: [], roles: [ "_admin" ] },
        members: { names: [], roles: [ ] },
      }
    })

    // Make database only writable by users with the contentManager
    // role or the _admin role
    await this.server.request({
      db: this.dbName,
      method: 'PUT',
      doc: '_design/permissions',
      body: {
        // @ts-ignore
        validate_doc_update: function(newDoc, oldDoc, userCtx, secObj) {
          const isContentManager = userCtx.roles.indexOf('contentManager') !== -1
          const isAdmin          = userCtx.roles.indexOf('_admin') !== -1
          if (!isContentManager && !isAdmin) {
            throw ({ forbidden: 'You are not a content manager.' })
          }
        }.toString()
      }
    })
  }

  async revert(): Promise<void> {
    await this.server.db.destroy(this.dbName)
  }
}
