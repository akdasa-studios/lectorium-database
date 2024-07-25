import { Migration } from "./Migration";

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
  }

  async revert(): Promise<void> {
    await this.server.db.destroy(this.dbName)
  }
}
