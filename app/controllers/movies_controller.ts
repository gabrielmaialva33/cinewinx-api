import { inject } from '@adonisjs/core'
import { HttpContext } from '@adonisjs/core/http'

import { TelegramService } from '#services/telegram_service'

@inject()
export default class MoviesController {
  constructor(protected telegramService: TelegramService) {}

  async index({ response }: HttpContext) {
    const messages = await this.telegramService.run()
    return response.status(200).json(messages)
  }
}
