import type { HttpContext } from '@adonisjs/core/http'
import app from '@adonisjs/core/services/app'
import StreamVideoService from '#services/posts/stream_video_service'

export default class StreamsController {
  async video({ request, response }: HttpContext) {
    const { document_id: documentId, size } = request.qs()

    const streamVideoService = await app.container.make(StreamVideoService)

    const range = request.header('range')
    if (!range) {
      response.status(206)
      response.header('Content-Type', 'video/mp4')
      response.header('Content-Length', size.toString())
      const stream = await streamVideoService.run(Number.parseInt(documentId, 10), {
        start: 0,
        end: Number.parseInt(size, 10) - 1,
      })
      return response.stream(stream)
    } else {
      const positions = range.replace(/bytes=/, '').split('-')
      const start = Number.parseInt(positions[0], 10)
      const end = positions[1] ? Number.parseInt(positions[1], 10) : Number.parseInt(size, 10) - 1
      const chunkSize = end - start + 1

      response.status(206)
      response.header('Content-Range', `bytes ${start}-${end}/${size}`)
      response.header('Accept-Ranges', 'bytes')
      response.header('Content-Length', chunkSize)
      response.header('Content-Type', 'video/mp4')

      const stream = await streamVideoService.run(Number.parseInt(documentId, 10), { start, end })
      return response.stream(stream)
    }
  }
}
