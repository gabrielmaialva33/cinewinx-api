import { inject } from '@adonisjs/core'

import { TelegramClient } from 'telegram'
import { StringSession } from 'telegram/sessions/index.js'
import bigInt from 'big-integer'

import Env from '#start/env'

@inject()
export class TelegramService {
  private client: TelegramClient

  constructor() {
    const apiId = Env.get('API_ID')
    const apiHash = Env.get('API_HASH')
    const stringSession = new StringSession(Env.get('STRING_SESSION') ?? '')

    this.client = new TelegramClient(stringSession, apiId, apiHash, {
      connectionRetries: 5,
    })
  }

  async run() {
    await this.client.connect()

    const channelId = bigInt(-1001774402469)
    const channel = await this.client.getEntity(channelId)
    const messages = await this.client.getMessages(channel, { limit: 1 })
    return messages
  }
}
