import router from '@adonisjs/core/services/router'

const MoviesController = () => import('#controllers/movies_controller')
router
  .group(() => {
    router.get('/', [MoviesController, 'paginate']).as('movies.paginate')
    router.get('/stream', [MoviesController, 'stream']).as('movies.stream')
  })
  .prefix('movies')
