import { inject } from '@adonisjs/core'
import TelegramRepository from '#repositories/telegram_repository'

@inject()
export default class GetPostService {
  constructor(private telegramRepository: TelegramRepository) {}

  async run(messageId: number) {
    return this.telegramRepository.getPost(messageId)
  }
}
