import { TelegramClient } from 'telegram'
import app from '@adonisjs/core/services/app'

import env from '#start/env'

let client: TelegramClient

await app.booted(async () => {
  client = await app.container.make<typeof TelegramClient>(TelegramClient)
  if (client) await client.connect()
})

export default class TelegramRepository {
  protected telegram: TelegramClient
  protected channelId: string = env.get('CHANNEL_ID')

  constructor() {
    this.telegram = client
  }

  public get client() {
    return this.telegram
  }

  public get channel() {
    return this.channelId
  }

  /**
   * List all messages from the channel
   */
  public async listMessages() {
    return this.telegram.getMessages(this.channelId)
  }
}
