import app from '@adonisjs/core/services/app'
import { TelegramClient } from 'telegram'

let client: TelegramClient

await app.booted(async () => {
  client = await app.container.make<typeof TelegramClient>(TelegramClient)
  if (client) await client.connect()
})

export default class TelegramRepository {
  protected telegramClient: TelegramClient

  constructor() {
    this.telegramClient = client
  }

  client() {
    return this.telegramClient
  }
}
