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
  const videoUrl = '/stream?video=1'
  return view.render('stream', { videoUrl })
})

import '#routes/index'
