import router from '@adonisjs/core/services/router'

const MoviesController = () => import('#controllers/movies_controller')
router
  .group(() => {
    router.get('/', [MoviesController, 'stream']).as('movies.stream')
  })
  .prefix('stream')