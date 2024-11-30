import type { ApplicationService } from '@adonisjs/core/types'
import { TelegramClient } from 'telegram'
import { StringSession } from 'telegram/sessions/index.js'

import Env from '#start/env'

export default class TelegramProvider {
  constructor(protected app: ApplicationService) {}

  /**
   * Register bindings to the container
   */
  register() {
    this.app.container.singleton(TelegramClient, () => {
      const apiId = Env.get('API_ID')
      const apiHash = Env.get('API_HASH')
      const stringSession = new StringSession(Env.get('STRING_SESSION') ?? '')

      return new TelegramClient(stringSession, apiId, apiHash, {
        connectionRetries: 5,
        autoReconnect: true,
      })
    })
  }

  /**
   * The container bindings have booted
   */
  async boot() {
    const client = await this.app.container.make<typeof TelegramClient>(TelegramClient)
    await client.connect()
  }

  /**
   * The application has been booted
   */
  async start() {}

  /**
   * The process has been started
   */
  async ready() {}

  /**
   * Preparing to shutdown the app
   */
  async shutdown() {
    const client = await this.app.container.make<typeof TelegramClient>(TelegramClient)
    if (client.connected) await client.disconnect()
  }
}
