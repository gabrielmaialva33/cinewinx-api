import type { HttpContext } from '@adonisjs/core/http'
import app from '@adonisjs/core/services/app'
import { inject } from '@adonisjs/core'

import PaginatePostService from '#services/posts/paginate_post_service'
import GetPostImageService from '#services/posts/get_post_image_service'
import GetPostService from '#services/posts/get_post_service'

@inject()
export default class MoviesController {
  async paginate({ request, response }: HttpContext) {
    const paginateMoviesService = await app.container.make(PaginatePostService)
    const movies = await paginateMoviesService.run()

    const host = request.header('host')
    console.log(host)

    for (const movie of movies) {
      movie.image_url = `http://${host}/movies/images?message_id=${movie.message_id}`
    }

    return response.json(movies)
  }

  async get({ request, response }: HttpContext) {
    const { id } = request.params()
    const getPostService = await app.container.make(GetPostService)
    const post = await getPostService.run(id)

    return response.json(post)
  }

  async images({ request, response }: HttpContext) {
    const { message_id: messageId } = request.qs()

    const getImageService = await app.container.make(GetPostImageService)
    const image = await getImageService.run(messageId)

    response.header('Content-Type', 'image/jpeg')

    return response.send(image)
  }
}
