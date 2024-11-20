import { args, BaseCommand } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'

import { Logger, TelegramClient } from 'telegram'
import { StringSession } from 'telegram/sessions/index.js'

Logger.prototype._log = () => {}

export default class GenerateSession extends BaseCommand {
  static commandName = 'generate:session'
  static description = 'Generate a new session string for the Telegram client'
  static aliases = ['gen:session', 'gen:session-string']

  static options: CommandOptions = {}

  static help = [
    'This command generates a new session string for the Telegram client.',
    'You can use this session string to login to your Telegram account.',
  ]

  @args.string({
    name: 'api_id',
    description: 'The API ID of your Telegram application',
    required: false,
    parse: (value) => value.trim(),
  })
  declare api_id: string

  @args.string({
    name: 'api_hash',
    description: 'The API hash of your Telegram application',
    required: false,
    parse: (value) => value.trim(),
  })
  declare api_hash: string

  async run() {
    this.logger.info('Preparing to generate a Telegram session string...')

    const apiId =
      this.api_id ??
      (await this.prompt.ask('Enter your Telegram API ID', {
        validate(value) {
          return /^\d+$/.test(value) || 'API ID must be a numeric value'
        },
      }))

    const apiHash =
      this.api_hash ??
      (await this.prompt.ask('Enter your Telegram API Hash', {
        validate(value) {
          return value.length > 0 || 'API Hash cannot be empty'
        },
      }))

    const stringSession = new StringSession('')

    const client = new TelegramClient(stringSession, Number.parseInt(apiId, 10), apiHash, {
      connectionRetries: 5,
      baseLogger: new Logger(),
    })

    try {
      await client.start({
        phoneNumber: async () =>
          await this.prompt.ask('Enter your phone number (with country code)'),
        password: async () =>
          await this.prompt.secure('Enter your two-step verification password (if enabled)'),
        phoneCode: async () =>
          await this.prompt.ask('Enter the code sent to your Telegram account'),
        onError: (err) => console.error('Error during login:', err),
      })

      this.logger.info('Successfully authenticated with Telegram!')
      this.logger.success('Here is your String Session:')

      const sessionString = client.session.save()
      console.log(`\nYour session string is: ${sessionString}\n`)

      await new Promise((resolve) => setTimeout(resolve, 2000))
    } catch (err) {
      this.logger.error('Failed to generate session string:', err.message)
    } finally {
      await client.disconnect()
      this.logger.info('Client disconnected.')
    }
  }
}
