import { inject } from '@adonisjs/core'
import TelegramRepository from '#repositories/telegram_repository'
import NotFoundException from '#exceptions/not_found_exception'

@inject()
export default class GetImageService {
  constructor(private telegramRepository: TelegramRepository) {}

  async run(messageId: number) {
    const image = await this.telegramRepository.getImage(messageId)
    if (!image) {
      throw new NotFoundException('Image not found')
    }

    return image
  }
}
