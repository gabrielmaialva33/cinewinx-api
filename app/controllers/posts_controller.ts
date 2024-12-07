import type { HttpContext } from '@adonisjs/core/http'
import app from '@adonisjs/core/services/app'
import { inject } from '@adonisjs/core'

import PaginatePostService from '#services/posts/paginate_post_service'
import GetPostImageService from '#services/posts/get_post_image_service'
import GetPostService from '#services/posts/get_post_service'

@inject()
export default class PostsController {
  async paginate({ request, response }: HttpContext) {
    const paginatePostsService = await app.container.make(PaginatePostService)
    const posts = await paginatePostsService.run()

    const host = request.header('host', 'localhost')
    const protocol = request.protocol()

    for (const movie of posts) {
      movie.image_url = `${protocol}://${host}/posts/images?message_id=${movie.message_id}`
    }

    return response.json(posts)
  }

  async get({ request, response }: HttpContext) {
    const { id } = request.params()
    const getPostService = await app.container.make(GetPostService)
    const post = await getPostService.run(id)

    const host = request.header('host', 'localhost')
    const protocol = request.protocol()

    post.image_url = `${protocol}://${host}/posts/images?message_id=${post.message_id}`
    post.video_url = `${protocol}://${host}/posts/videos?document_id=${post.document.id.toString()}&size=${post.document.size}`

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
