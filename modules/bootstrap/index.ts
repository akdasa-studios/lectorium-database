import nano from 'nano'

import { ConfigureDatabase } from './scripts/000-configure-database'
import { CreateUsersDatabase } from './scripts/001-create-users-database'
import { CreateLibraryDatabase } from './scripts/002-create-library-database'

const connectionString = process.env.CONNECTION_STRING || 'http://lectorium:lectorium@database:5984'

const server = nano(connectionString)
const migrations = [
  new ConfigureDatabase(server),
  new CreateUsersDatabase(server),
  new CreateLibraryDatabase(server),
]

async function migrate() {
  try {
    for (const migration of migrations) {
      const shouldMigrate = await migration.shouldMigrate()
      console.log(`[${shouldMigrate ? 'MIG' : 'SKP'}] ${migration.name}`)
      if (shouldMigrate) {
        await migration.migrate()
      }
    }
  } catch (error) {
    console.error(error)
  }
}

migrate()
