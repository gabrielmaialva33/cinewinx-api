import { Api, TelegramClient } from 'telegram'
import { StringSession } from 'telegram/sessions/index.js'

import Env from '#start/env'
import bigInt from 'big-integer'

export class TelegramRepository {
  protected client: TelegramClient
  protected channelId: bigInt.BigInteger

  constructor() {
    const apiId = Env.get('API_ID')
    const apiHash = Env.get('API_HASH')
    const stringSession = new StringSession(Env.get('STRING_SESSION') ?? '')

    this.client = new TelegramClient(stringSession, apiId, apiHash, {
      autoReconnect: true,
    })

    this.channelId = bigInt(Env.get('CHANNEL_ID'))
  }

  private async connectClient() {
    if (!this.client.connected) await this.client.connect()
  }

  async getMessages(limit = 1) {
    await this.connectClient()
    const channel = await this.client.getEntity(this.channelId)

    const messages = await this.client.invoke(
      new Api.messages.GetHistory({
        peer: channel,
        limit,
      })
    )

    return messages as Api.messages.Messages
  }
}
