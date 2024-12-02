import router from '@adonisjs/core/services/router'

const StreamsController = () => import('#controllers/streams_controller')
const MoviesController = () => import('#controllers/movies_controller')
router
  .group(() => {
    router.get('/', [MoviesController, 'paginate']).as('movies.paginate')
    router.get('/videos', [StreamsController, 'video']).as('movies.video')
    router.get('/images', [MoviesController, 'images']).as('movies.images')
    router.get('/:id', [MoviesController, 'get']).as('movies.get')
  })
  .prefix('movies')
