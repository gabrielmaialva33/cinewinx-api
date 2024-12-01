import { inject } from '@adonisjs/core'
import TelegramRepository from '#repositories/telegram_repository'

@inject()
export default class PaginateMoviesService {
  constructor(private telegramRepository: TelegramRepository) {}

  async run() {
    return this.telegramRepository.listMessages()
  }
}

// import { inject } from '@adonisjs/core'
// import { TelegramRepository } from '#repositories/telegram_repository'
//
// @inject()
// export class ListPostService {
//   constructor(private telegramService: TelegramRepository) {}
//
//   async run() {
//     const history = await this.telegramService.getMessages(2)
//     const messages = history.messages
//
//     // @ts-ignore
//     const groupedMessages = messages.filter((message) => message.groupedId)
//
//     const groupedPosts = groupedMessages.reduce(
//       (acc, message) => {
//         // @ts-ignore
//         const groupId = message.groupedId.toString()
//         if (!acc[groupId]) {
//           acc[groupId] = {
//             groupedId: groupId,
//             messages: [],
//           }
//         }
//         acc[groupId].messages.push(message)
//         return acc
//       },
//       {} as Record<string, { groupedId: string; messages: any[] }>
//     )
//
//     const posts = Object.values(groupedPosts)
//       .map((group) => {
//         const textMessage = group.messages.find((msg) => msg.className === 'Message' && msg.message)
//
//         if (!textMessage) return null
//
//         const content = textMessage.message
//
//         const reactions = textMessage.reactions?.results.map(
//           (reaction: { reaction: { emoticon: any }; count: any }) => {
//             return {
//               reaction: reaction.reaction.emoticon,
//               count: reaction.count,
//             }
//           }
//         )
//
//         const parsedData = this.parseMessageContent(content)
//
//         return {
//           groupedId: group.groupedId,
//           messageId: textMessage.id,
//           date: textMessage.date,
//           author: textMessage.postAuthor,
//           reactions: reactions,
//           ...parsedData,
//         }
//       })
//       .filter((post) => post !== null)
//
//     return posts
//   }
//
//   private parseMessageContent(content: string) {
//     const lines = content
//       .split('\n')
//       .map((line) => line.trim())
//       .filter((line) => line !== '')
//
//     const data: any = {}
//
//     let currentSection = ''
//
//     for (const line of lines) {
//       if (line.startsWith('📺')) {
//         data.title = line.replace('📺', '').trim()
//       } else if (line.startsWith('📍')) {
//         data.countryOfOrigin = line.replace('📍 País de Origem:', '').trim()
//       } else if (line.startsWith('👑')) {
//         data.director = line.replace('👑 Direção:', '').trim()
//       } else if (line.startsWith('✏') || line.startsWith('✏️')) {
//         data.writers = line.replace('✏️ Roteiristas:', '').replace('✏ Roteiristas:', '').trim()
//       } else if (line.startsWith('✨')) {
//         data.cast = line.replace('✨ Elenco:', '').trim()
//       } else if (line.startsWith('📣')) {
//         data.languages = line.replace('📣 Idiomas:', '').trim()
//       } else if (line.startsWith('🎭')) {
//         data.genres = line.replace('🎭 Gêneros:', '').trim()
//       } else if (line.startsWith('#')) {
//         data.tags = data.tags ? [...data.tags, line.trim()] : [line.trim()]
//       } else if (line.startsWith('🗣')) {
//         currentSection = 'synopsis'
//         data.synopsis = ''
//       } else if (line.startsWith('💡')) {
//         currentSection = 'curiosities'
//         data.curiosities = ''
//       } else if (line.startsWith('▶')) {
//         currentSection = ''
//       } else {
//         if (currentSection === 'synopsis') {
//           data.synopsis += (data.synopsis ? ' ' : '') + line
//         } else if (currentSection === 'curiosities') {
//           data.curiosities += (data.curiosities ? '\n' : '') + line
//         }
//       }
//     }
//
//     return data
//   }
// }
