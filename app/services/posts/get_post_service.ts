import { inject } from '@adonisjs/core'

import TelegramRepository from '#repositories/telegram_repository'
import NotFoundException from '#exceptions/not_found_exception'
import CacheService from '#services/cache_service'
import { Post } from '#interfaces/movie_types'

@inject()
export default class GetPostService {
  constructor(
    private telegramRepository: TelegramRepository,
    private cacheService: CacheService
  ) {}

  async run(messageId: number) {
    const cacheKey = `post-${messageId}`
    if (this.cacheService.has(cacheKey)) {
      return this.cacheService.get<Post>(cacheKey)
    }

    const post = await this.telegramRepository.getPost(messageId)
    if (!post) {
      throw new NotFoundException('post not found')
    }

    this.cacheService.set(cacheKey, post)

    return post
  }
}
