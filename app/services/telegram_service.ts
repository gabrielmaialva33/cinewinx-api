import { Api, TelegramClient } from 'telegram'
import bigInt from 'big-integer'

import { Readable } from 'node:stream'
import app from '@adonisjs/core/services/app'

export class TelegramService {
  protected client: TelegramClient | null = null

  constructor() {}

  protected async getClient(): Promise<TelegramClient> {
    if (!this.client) this.client = await app.container.make<typeof TelegramClient>(TelegramClient)

    return this.client
  }

  async getVideoInfo() {
    const client = await this.getClient()

    const channelId = bigInt('-1001774402469')
    const channel = await client.getEntity(channelId)
    const messages = await client.getMessages(channel, { limit: 1 })

    const post = messages[0] as Api.Message & {
      media: Api.MessageMediaDocument & { document: Api.Document }
    }

    if (!post.media || !post.media.document) throw new Error('No media found')

    const document = post.media.document

    return { size: document.size, document }
  }

  async getVideoStream(start: number, end: number) {
    const client = await this.getClient()

    const { document } = await this.getVideoInfo()

    const iterable = client.iterDownload({
      file: new Api.InputDocumentFileLocation({
        id: document.id,
        accessHash: document.accessHash,
        fileReference: document.fileReference,
        thumbSize: '',
      }),
      offset: bigInt(start),
      limit: end - start + 1,
      requestSize: 1024 * 1024 * 2, // 2MB
      chunkSize: 1024 * 1024 * 2, // 2MB
      stride: 1024 * 1024 * 2, // 2MB
      dcId: document.dcId,
      fileSize: document.size,
    })

    const stream = Readable.from(iterable)

    return { stream }
  }
}
