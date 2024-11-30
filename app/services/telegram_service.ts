import { Api } from 'telegram'
import bigInt from 'big-integer'

import { Readable } from 'node:stream'
import { inject } from '@adonisjs/core'
import TelegramRepository from '#repositories/telegram_repository'

@inject()
export class TelegramService {
  constructor(private telegramRepository: TelegramRepository) {}

  async getVideoInfo() {
    const channelId = bigInt('-1001774402469')
    const channel = await this.telegramRepository.client().getEntity(channelId)
    const messages = await this.telegramRepository.client().getMessages(channel, { limit: 2 })

    const post = messages[0] as Api.Message & {
      media: Api.MessageMediaDocument & { document: Api.Document }
    }

    if (!post.media || !post.media.document) throw new Error('No media found')

    const document = post.media.document

    return { size: document.size, document }
  }

  async getVideoStream(start: number, end: number) {
    const { document } = await this.getVideoInfo()

    const iterable = this.telegramRepository.client().iterDownload({
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
