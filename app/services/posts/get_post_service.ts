import { inject } from '@adonisjs/core'
import app from '@adonisjs/core/services/app'

import TelegramRepository from '#repositories/telegram_repository'
import NotFoundException from '#exceptions/not_found_exception'
import CacheService from '#services/cache_service'
import { Post } from '#interfaces/movie_types'

@inject()
export default class GetPostService {
  constructor(private telegramRepository: TelegramRepository) {}

  async run(messageId: number) {
    const cacheService = await app.container.make(CacheService)

    const postCacheKey = `post-${messageId}`
    if (cacheService.has(postCacheKey)) {
      return cacheService.get<Post>(postCacheKey)
    }

    const post = await this.telegramRepository.getPost(messageId)
    if (!post) {
      throw new NotFoundException('post not found')
    }

    cacheService.set(postCacheKey, post)

    const documentCacheKey = `document-${Number.parseInt(post.document.id.toString(), 10)}`
    if (!cacheService.has(documentCacheKey)) {
      cacheService.set(documentCacheKey, post.document)
    }

    return post
  }
}
