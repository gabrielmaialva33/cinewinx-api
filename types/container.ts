import { TelegramClient } from 'telegram'

declare module '@adonisjs/core/types' {
  interface ContainerBindings {
    TelegramClient: TelegramClient
  }
}
