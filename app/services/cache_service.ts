import { inject } from '@adonisjs/core'
import logger from '@adonisjs/core/services/logger'

@inject()
export default class CacheService {
  #store: Record<string, any> = {}

  get<T>(key: string): T {
    logger.info(`getting ${key} from cache`)
    return this.#store[key]
  }

  set(key: string, value: any) {
    logger.info(`setting ${key} in cache`)
    this.#store[key] = value
  }

  has(key: string) {
    logger.info(`checking if ${key} exists in cache`)
    return key in this.#store
  }
}
