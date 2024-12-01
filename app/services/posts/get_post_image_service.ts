import { inject } from '@adonisjs/core'

import TelegramRepository from '#repositories/telegram_repository'
import CacheService from '#services/cache_service'

import NotFoundException from '#exceptions/not_found_exception'

@inject()
export default class GetPostImageService {
  constructor(
    private telegramRepository: TelegramRepository,
    private cacheService: CacheService
  ) {}

  async run(messageId: number) {
    const cacheKey = `post-image-${messageId}`
    if (this.cacheService.has(cacheKey)) {
      return this.cacheService.get(cacheKey)
    }

    const image = await this.telegramRepository.getImage(messageId)
    if (!image) {
      throw new NotFoundException('Image not found')
    }

    this.cacheService.set(cacheKey, image)

    return image
  }
}
