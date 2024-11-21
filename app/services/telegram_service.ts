import { inject } from '@adonisjs/core'

import { Api, TelegramClient } from 'telegram'
import { StringSession } from 'telegram/sessions/index.js'
import bigInt from 'big-integer'

import Env from '#start/env'
import { Readable } from 'node:stream'

@inject()
export class TelegramService {
  private client: TelegramClient

  constructor() {
    const apiId = Env.get('API_ID')
    const apiHash = Env.get('API_HASH')
    const stringSession = new StringSession(Env.get('STRING_SESSION') ?? '')

    this.client = new TelegramClient(stringSession, apiId, apiHash, {
      connectionRetries: 5,
      autoReconnect: true,
    })
  }

  async list() {
    await this.client.connect()

    const channelId = bigInt(-1001774402469)
    const channel = await this.client.getEntity(channelId)
    const messages = await this.client.getMessages(channel, { limit: 1 })

    const post = messages[0] as Api.Message & {
      media: Api.MessageMediaDocument & { document: Api.DocumentAttributeVideo }
    }

    if (!post.media || !post.media.document) throw new Error('No media found')

    return post
  }

  async stream() {
    await this.client.connect()

    const channelId = bigInt(-1001774402469)
    const channel = await this.client.getEntity(channelId)
    const messages = await this.client.getMessages(channel, { limit: 1 })

    const post = messages[0] as Api.Message & {
      media: Api.MessageMediaDocument & { document: Api.Document }
    }

    if (!post.media || !post.media.document) throw new Error('No media found')

    const document = post.media.document

    const iterable = this.client.iterDownload({
      file: new Api.InputDocumentFileLocation({
        id: document.id,
        accessHash: document.accessHash,
        fileReference: document.fileReference,
        thumbSize: '',
      }),
      fileSize: document.size,
      requestSize: 1024 * 1024, // 1MB
    })

    const stream = Readable.from(iterable)

    return { stream, size: document.size }
  }

  async getVideoInfo() {
    await this.client.connect()

    const channelId = bigInt('-1001774402469')
    const channel = await this.client.getEntity(channelId)
    const messages = await this.client.getMessages(channel, { limit: 1 })

    const post = messages[0] as Api.Message & {
      media: Api.MessageMediaDocument & { document: Api.Document }
    }

    if (!post.media || !post.media.document) throw new Error('No media found')

    const document = post.media.document

    return { size: document.size, document }
  }

  async getVideoStream(start: number, end: number) {
    const { document } = await this.getVideoInfo()

    const iterable = this.client.iterDownload({
      file: new Api.InputDocumentFileLocation({
        id: document.id,
        accessHash: document.accessHash,
        fileReference: document.fileReference,
        thumbSize: '',
      }),
      offset: bigInt(start),
      limit: end - start + 1,
      requestSize: 1024 * 1024, // 1MB
    })

    const stream = Readable.from(iterable)

    return { stream }
  }
}
