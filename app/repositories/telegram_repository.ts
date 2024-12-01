import { Api, TelegramClient } from 'telegram'
import type { Entity } from 'telegram/define.js'
import bigInt from 'big-integer'
import app from '@adonisjs/core/services/app'

import env from '#start/env'
import parseMessageContent from '#helpers/parse_message_content'

let telegramClient: TelegramClient
let channel: Entity

await app.booted(async () => {
  telegramClient = await app.container.make<typeof TelegramClient>(TelegramClient)
  if (!telegramClient.connected) await telegramClient.connect()

  channel = await telegramClient.getEntity(bigInt(env.get('CHANNEL_ID')))
})

export default class TelegramRepository {
  protected telegram: TelegramClient
  protected channelEntity: Entity

  public channelId: bigInt.BigInteger

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
            content: parsedData,
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
}
