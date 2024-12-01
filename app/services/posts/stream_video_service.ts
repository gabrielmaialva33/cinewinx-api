import { Api } from 'telegram'

import CacheService from '#services/cache_service'
import TelegramRepository from '#repositories/telegram_repository'
import NotFoundException from '#exceptions/not_found_exception'
import { inject } from '@adonisjs/core'
import app from '@adonisjs/core/services/app'

@inject()
export default class StreamVideoService {
  constructor(private telegramRepository: TelegramRepository) {}

  async run(documentId: number, range: { start: number; end: number }) {
    const cacheService = await app.container.make(CacheService)

    const documentCacheKey = `document-${documentId}`
    const document = cacheService.get<Api.Document>(documentCacheKey)
    if (!document) {
      throw new NotFoundException('document not found in cache')
    }

    const { start, end } = range

    return this.telegramRepository.getVideoStream(document, start, end)
  }
}
