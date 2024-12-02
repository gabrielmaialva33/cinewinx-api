import { inject } from '@adonisjs/core'
import app from '@adonisjs/core/services/app'

import TelegramRepository from '#repositories/telegram_repository'
import CacheService from '#services/cache_service'

import NotFoundException from '#exceptions/not_found_exception'

@inject()
export default class GetPostImageService {
  constructor(private telegramRepository: TelegramRepository) {}

  async run(messageId: number) {
    const cacheService = await app.container.make(CacheService)

    const cacheKey = `post-image-${messageId}`
    if (cacheService.has(cacheKey)) {
      return cacheService.get<Buffer<ArrayBufferLike>>(cacheKey)
    }

    const image = await this.telegramRepository.getImage(messageId)
    if (!image) {
      throw new NotFoundException('image not found')
    }

    cacheService.set(cacheKey, image)

    return image
  }
}
