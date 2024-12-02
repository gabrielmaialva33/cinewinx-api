/*
|--------------------------------------------------------------------------
| HTTP server entrypoint
|--------------------------------------------------------------------------
|
| The "server.ts" file is the entrypoint for starting the AdonisJS HTTP
| server. Either you can run this file directly or use the "serve"
| command to run this file and monitor file changes
|
*/

import 'reflect-metadata'
import cluster from 'node:cluster'
import { cpus } from 'node:os'

import { Ignitor, prettyPrintError } from '@adonisjs/core'

/**
 * URL to the application root. AdonisJS need it to resolve
 * paths to file and directories for scaffolding commands
 */
const APP_ROOT = new URL('../', import.meta.url)

/**
 * The importer is used to import files in context of the
 * application.
 */
const IMPORTER = (filePath: string) => {
  if (filePath.startsWith('./') || filePath.startsWith('../')) {
    return import(new URL(filePath, APP_ROOT).href)
  }
  return import(filePath)
}

if (cluster.isPrimary) {
  const numCPUs = cpus().length
  console.log(`master ${process.pid} is running`)

  for (let i = 0; i < numCPUs; i++) {
    cluster.fork()
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`worker ${worker.process.pid} died with code: ${code} and signal: ${signal}`)
  })
} else {
  new Ignitor(APP_ROOT, { importer: IMPORTER })
    .tap((app) => {
      app.booting(async () => {
        await import('#start/env')
      })
      app.listen('SIGTERM', () => app.terminate())
      app.listenIf(app.managedByPm2, 'SIGINT', () => app.terminate())
    })
    .httpServer()
    .start()
    .then(() => {
      console.log(`worker ${process.pid} started`)
    })
    .catch((error) => {
      process.exitCode = 1
      prettyPrintError(error)
    })
}

// new Ignitor(APP_ROOT, { importer: IMPORTER })
//   .tap((app) => {
//     app.booting(async () => {
//       await import('#start/env')
//     })
//     app.listen('SIGTERM', () => app.terminate())
//     app.listenIf(app.managedByPm2, 'SIGINT', () => app.terminate())
//   })
//   .httpServer()
//   .start()
//   .catch((error) => {
//     process.exitCode = 1
//     prettyPrintError(error)
//   })
