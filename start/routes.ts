/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'

router.get('/', async ({ view }) => {
  return view.render('doc')
})

router
  .get('/docs/api', async ({ response }) => {
    return response.download(app.publicPath(`docs/api.yaml`))
  })
  .as('api.docs')

import '#routes/index'
import app from '@adonisjs/core/services/app'
