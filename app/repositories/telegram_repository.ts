import { TelegramClient } from 'telegram'
import app from '@adonisjs/core/services/app'

import env from '#start/env'

let client: TelegramClient

await app.booted(async () => {
  client = await app.container.make<typeof TelegramClient>(TelegramClient)
  if (client) await client.connect()
})

export default class TelegramRepository {
  protected telegramClient: TelegramClient
  protected channelId: string = env.get('CHANNEL_ID')

  constructor() {
    this.telegramClient = client
  }

  public get client() {
    return this.telegramClient
  }
}
