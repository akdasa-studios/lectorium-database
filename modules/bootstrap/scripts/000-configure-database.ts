import { Migration } from './Migration'

export class ConfigureDatabase extends Migration {
  get name(): string { return 'Configure database' }

  async shouldMigrate(): Promise<boolean> {
    return true
  }

  async migrate(): Promise<void> {
    const keys = [
      { key: 'httpd/enable_cors', value: 'true' },
      { key: 'cors/origins',      value: '*' },
      { key: 'cors/credentials',  value: 'true' },
      { key: 'cors/headers',      value: 'accept, authorization, content-type, origin, referer' },
      { key: 'cors/methods',      value: 'GET, PUT, POST, HEAD, DELETE, OPTIONS' },

      { key: 'couchdb/single_node', value: 'true' },
    ]

    for (const { key, value } of keys) {
      await this.server.request({
        db: '_node',
        path: `/nonode@nohost/_config/${key}`,
        method: 'PUT',
        body: value
      })
    }
  }

  async revert(): Promise<void> {
  }
}
