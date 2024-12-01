import { inject } from '@adonisjs/core'
import TelegramRepository from '#repositories/telegram_repository'

@inject()
export default class PaginatePostService {
  constructor(private telegramRepository: TelegramRepository) {}

  async run() {
    return this.telegramRepository.listMessages()
  }
}
