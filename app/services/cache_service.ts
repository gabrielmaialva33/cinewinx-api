import { inject } from '@adonisjs/core'

@inject()
export default class CacheService {
  #store: Record<string, any> = {}

  get(key: string) {
    return this.#store[key]
  }

  set(key: string, value: any) {
    this.#store[key] = value
  }

  has(key: string) {
    return key in this.#store
  }
}
