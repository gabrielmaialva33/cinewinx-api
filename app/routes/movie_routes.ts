import router from '@adonisjs/core/services/router'

const StreamsController = () => import('#controllers/streams_controller')
const MoviesController = () => import('#controllers/movies_controller')
router
  .group(() => {
    router.get('/', [MoviesController, 'paginate']).as('movies.paginate')
    router.get('/:id', [MoviesController, 'get']).as('movies.get')
    router.get('/stream', [StreamsController, 'stream']).as('movies.stream')
    router.get('/images', [MoviesController, 'images']).as('movies.images')
  })
  .prefix('movies')
