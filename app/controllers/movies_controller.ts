import { inject } from '@adonisjs/core'
import { HttpContext } from '@adonisjs/core/http'

import { TelegramService } from '#services/telegram_service'
// import { ListPostService } from '#services/telegram/index'

@inject()
export default class MoviesController {
  constructor(protected telegramService: TelegramService) {}

  async stream({ request, response }: HttpContext) {
    const range = request.header('range')
    const { size } = await this.telegramService.getVideoInfo()

    // bigInt to number
    const sizeNumber = size.toJSNumber()

    if (!range) {
      response.header('Content-Type', 'video/mp4')
      response.header('Content-Length', sizeNumber.toString())
      const { stream } = await this.telegramService.getVideoStream(0, sizeNumber - 1)
      return response.stream(stream)
    } else {
      const positions = range.replace(/bytes=/, '').split('-')
      const start = Number.parseInt(positions[0], 10)
      const end = positions[1] ? Number.parseInt(positions[1], 10) : sizeNumber - 1
      const chunkSize = end - start + 1

      response.status(206)
      response.header('Content-Range', `bytes ${start}-${end}/${size}`)
      response.header('Accept-Ranges', 'bytes')
      response.header('Content-Length', chunkSize)
      response.header('Content-Type', 'video/mp4')

      const { stream } = await this.telegramService.getVideoStream(start, end)
      return response.stream(stream)
    }
  }

  // async index({ response }: HttpContext) {
  //   const post = await this.listPostService.run()
  //   return response.send(post)
  // }
}
