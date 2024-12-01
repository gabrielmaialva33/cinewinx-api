import CacheService from '#services/cache_service'
import { TelegramClient } from 'telegram'

declare module '@adonisjs/core/types' {
  interface ContainerBindings {
    CacheService: CacheService
    TelegramClient: TelegramClient
  }
}
