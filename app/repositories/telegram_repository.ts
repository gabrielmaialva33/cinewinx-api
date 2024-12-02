import { Api, TelegramClient } from 'telegram'
import type { Entity } from 'telegram/define.js'
import bigInt from 'big-integer'
import { Readable } from 'node:stream'
import app from '@adonisjs/core/services/app'

import env from '#start/env'
import { Post } from '#interfaces/movie_types'
import BadRequestException from '#exceptions/bad_request_exception'

import parseMessageContent from '#helpers/parse_message_content'

let telegramClient: TelegramClient
let channel: Entity

await app.booted(async () => {
  telegramClient = await app.container.make<typeof TelegramClient>(TelegramClient)
  if (!telegramClient.connected) await telegramClient.connect()

  channel = await telegramClient.getEntity(bigInt(env.get('CHANNEL_ID')))
})

export default class TelegramRepository {
  public channelId: bigInt.BigInteger
  protected telegram: TelegramClient
  protected channelEntity: Entity

  constructor() {
    this.telegram = telegramClient
    this.channelId = bigInt(env.get('CHANNEL_ID'))
    this.channelEntity = channel
  }

  public get client() {
    return this.telegram
  }

  public get channel() {
    return this.channelEntity
  }

  public async getHistory(limit: number = 30, offsetId: number = 0) {
    const history = await this.telegram.invoke(
      new Api.messages.GetHistory({
        peer: this.channel,
        limit: limit,
        offsetId: offsetId,
      })
    )

    return history as Api.messages.Messages
  }

  public async groupedPosts(limit: number = 30, offsetId: number = 0) {
    const history = await this.getHistory(limit, offsetId)
    const messages = history.messages.filter(
      (message) => message instanceof Api.Message
    ) as Api.Message[]

    const groupedMessages = messages.filter((message) => message.groupedId)

    return groupedMessages.reduce(
      (acc, message) => {
        if (!message.groupedId) return acc

        const groupId = message.groupedId.toString()
        if (!acc[groupId]) {
          acc[groupId] = {
            groupedId: groupId,
            messages: [],
          }
        }

        acc[groupId].messages.push(message)

        return acc
      },
      {} as Record<string, { groupedId: string; messages: Api.Message[] }>
    )
  }

  public async listMessages(limit: number = 100, offsetId: number = 0) {
    const groupedPosts = await this.groupedPosts(limit, offsetId)

    const posts = Object.values(groupedPosts)
      .map((group) => {
        let reactions: Array<{ reaction: any; count: number }> = []

        const info = group.messages.find((msg) => msg.className === 'Message' && msg.message)

        if (info) {
          if (info.reactions) {
            reactions = info.reactions.results
              .map((result) => {
                return {
                  reaction: 'emoticon' in result.reaction ? result.reaction.emoticon : null,
                  count: result.count,
                }
              })
              .filter((reaction) => reaction.reaction !== null)
          }

          const parsedData = parseMessageContent(info.message)

          // const media = group.messages.find((msg) => msg.media instanceof Api.MessageMediaPhoto)
          //   ?.media as Api.MessageMediaPhoto

          // const imageUrl = `/movies/images?message_id=${info.id}`

          return {
            image_url: '',
            grouped_id: group.groupedId,
            message_id: info.id,
            date: info.date,
            author: info.postAuthor,
            reactions: reactions,
            original_content: info.message,
            parsed_content: parsedData,
          }
        }
        return null
      })
      .filter((post) => post !== null)

    return posts
  }

  public async getImage(messageId: number) {
    const message = await this.telegram.getMessages(this.channel, {
      ids: [new Api.InputMessageID({ id: +messageId })],
    })

    return this.telegram.downloadMedia(message[0])
  }

  public async getPost(messageId: number): Promise<Post | undefined> {
    const messages = await this.telegram.getMessages(this.channel, {
      ids: [
        new Api.InputMessageID({ id: +messageId }),
        new Api.InputMessageID({ id: +messageId + 1 }),
      ],
    })

    const posts = messages.sort((a, b) => a.id - b.id)
    const infoMessage = posts[0]
    const mediaMessage = posts[1] as Api.Message & {
      media: Api.MessageMediaDocument & { document: Api.Document }
    }

    let reactions: Array<{ reaction: any; count: number }> = []

    if (infoMessage.reactions) {
      reactions = infoMessage.reactions.results
        .map((result) => {
          return {
            reaction: 'emoticon' in result.reaction ? result.reaction.emoticon : null,
            count: result.count,
          }
        })
        .filter((reaction) => reaction.reaction !== null)

      const parsedData = parseMessageContent(infoMessage.message)

      if (!mediaMessage?.media?.document) {
        throw new BadRequestException('No media found in the provided message')
      }

      return {
        image_url: '',
        video_url: '',
        grouped_id: infoMessage.groupedId,
        message_id: infoMessage.id,
        date: infoMessage.date,
        author: infoMessage.postAuthor,
        reactions: reactions,
        original_content: infoMessage.message,
        parsed_content: parsedData,
        document: mediaMessage.media.document,
      }
    }
  }

  public getVideoStream(document: Api.Document, start: number, end: number) {
    const fileSize = document.size
    const downloadParams = this.computeDownloadParams(fileSize)

    const iterable = this.telegram.iterDownload({
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

    return Readable.from(iterable)
  }

  private computeDownloadParams(fileSize: bigInt.BigInteger) {
    const sizeInMB = Number(fileSize) / (1024 * 1024) // Convert to MB

    let params = {
      chunkSize: 8 * 1024 * 1024, // 8 MB para maior eficiência em arquivos grandes
      requestSize: 8 * 1024 * 1024,
      stride: 8 * 1024 * 1024,
    }

    if (sizeInMB <= 10) {
      params = {
        chunkSize: 1 * 1024 * 1024, // 1 MB para arquivos pequenos
        requestSize: 1 * 1024 * 1024,
        stride: 1 * 1024 * 1024,
      }
    } else if (sizeInMB <= 100) {
      params = {
        chunkSize: 4 * 1024 * 1024,
        requestSize: 4 * 1024 * 1024,
        stride: 4 * 1024 * 1024,
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
