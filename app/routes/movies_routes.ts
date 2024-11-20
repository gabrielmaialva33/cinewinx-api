import router from '@adonisjs/core/services/router'

const MoviesController = () => import('#controllers/movies_controller')
router
  .group(() => {
    router.get('/', [MoviesController, 'index']).as('movies.index')
  })
  .prefix('movies')
