import router from '@adonisjs/core/services/router'

const StreamsController = () => import('#controllers/streams_controller')
const PostsController = () => import('#controllers/posts_controller')
router
  .group(() => {
    router.get('/', [PostsController, 'paginate']).as('posts.paginate')
    router.get('/videos', [StreamsController, 'video']).as('posts.video')
    router.get('/images', [PostsController, 'images']).as('posts.images')
    router.get('/:id', [PostsController, 'get']).as('movies.get')
  })
  .prefix('posts')
