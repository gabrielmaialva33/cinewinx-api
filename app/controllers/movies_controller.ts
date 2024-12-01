import type { HttpContext } from '@adonisjs/core/http'
import app from '@adonisjs/core/services/app'
import { inject } from '@adonisjs/core'

import { TelegramService } from '#services/telegram_service'
import PaginateMoviesService from '#services/paginate_movies_service'

@inject()
export default class MoviesController {
  async stream({ request, response }: HttpContext) {
    const telegramService = await app.container.make(TelegramService)

    const range = request.header('range')
    const { size } = await telegramService.getVideoInfo()

    // bigInt to number
    const sizeNumber = size.toJSNumber()

    if (!range) {
      response.header('Content-Type', 'video/mp4')
      response.header('Content-Length', sizeNumber.toString())
      const { stream } = await telegramService.getVideoStream(0, sizeNumber - 1)
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

      const { stream } = await telegramService.getVideoStream(start, end)
      return response.stream(stream)
    }
  }

  async paginate({ response }: HttpContext) {
    const paginateMoviesService = await app.container.make(PaginateMoviesService)
    const movies = await paginateMoviesService.run()

    return response.json(movies)
  }
}
