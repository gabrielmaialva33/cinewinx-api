import { Api } from 'telegram'
import bigInt from 'big-integer'

import { Readable } from 'node:stream'
import { inject } from '@adonisjs/core'
import TelegramRepository from '#repositories/telegram_repository'

@inject()
export class TelegramService {
  constructor(private telegramRepository: TelegramRepository) {}

  async getVideoInfo(): Promise<Api.Document> {
    const channelId = bigInt('-1001774402469')
    const channel = await this.telegramRepository.client().getEntity(channelId)
    const messages = await this.telegramRepository.client().getMessages(channel, { limit: 2 })

    if (!messages.length) {
      throw new Error('No messages found in the provided channel')
    }

    const post = messages[0] as Api.Message & {
      media: Api.MessageMediaDocument & { document: Api.Document }
    }

    if (!post?.media?.document) {
      throw new Error('No media found in the provided message')
    }

    return post.media.document
  }

  async getVideoStream(start: number, end: number): Promise<{ stream: Readable }> {
    const document = await this.getVideoInfo()

    const fileSize = document.size
    const downloadParams = this.computeDownloadParams(fileSize)

    const iterable = this.telegramRepository.client().iterDownload({
      file: new Api.InputDocumentFileLocation({
        id: document.id,
        accessHash: document.accessHash,
        fileReference: document.fileReference,
        thumbSize: '',
      }),
      offset: bigInt(start),
      limit: end - start + 1,
      requestSize: downloadParams.requestSize,
      chunkSize: downloadParams.chunkSize,
      stride: downloadParams.stride,
      dcId: document.dcId,
      fileSize: document.size,
    })

    const stream = Readable.from(iterable)
    return { stream }
  }

  private computeDownloadParams(fileSize: bigInt.BigInteger) {
    const sizeInMB = Number(fileSize) / (1024 * 1024) // Convert to MB

    let params = {
      chunkSize: 4 * 1024 * 1024,
      requestSize: 4 * 1024 * 1024,
      stride: 4 * 1024 * 1024,
    }

    if (sizeInMB <= 10) {
      params = {
        chunkSize: 512 * 1024,
        requestSize: 512 * 1024,
        stride: 512 * 1024,
      }
    } else if (sizeInMB <= 100) {
      params = {
        chunkSize: 1024 * 1024,
        requestSize: 1024 * 1024,
        stride: 1024 * 1024,
      }
    }

    const maxAllowedSize = 512 * 1024 * 1024 // 512 MB
    return {
      chunkSize: Math.min(params.chunkSize, maxAllowedSize),
      requestSize: Math.min(params.requestSize, maxAllowedSize),
      stride: Math.min(params.stride, maxAllowedSize),
    }
  }
}
