import { inject } from '@adonisjs/core'
import logger from '@adonisjs/core/services/logger'

import redis from '@adonisjs/redis/services/main'

@inject()
export default class CacheService {
  #store: Record<string, any> = {}

  async $get<T>(key: string): Promise<T> {
    logger.info(`getting ${key} from cache`)
    return this.#store[key]
  }

  async $set(key: string, value: any) {
    logger.info(`setting ${key} in cache`)
    this.#store[key] = value
  }

  async $has(key: string) {
    logger.info(`checking if ${key} exists in cache`)
    return key in this.#store
  }

  async has(...keys: string[]) {
    logger.info(`checking if ${keys.join(', ')} exist in cache`)
    return redis.exists(keys)
  }

  async get<T>(key: string): Promise<T> {
    logger.info(`getting ${key} from cache`)
    const value = await redis.get(key)
    return value && JSON.parse(value)
  }

  async set(key: string, value: any) {
    logger.info(`setting ${key} in cache`)
    //return redis.set(key, JSON.stringify(value))
    return redis.set(key, JSON.stringify(value))
  }

  async del(...keys: string[]) {
    logger.info(`deleting ${keys.join(', ')} from cache`)
    return redis.del(keys)
  }
}
