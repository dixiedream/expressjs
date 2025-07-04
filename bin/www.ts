import { Socket } from 'node:net'
import app from '../app.js'
import { logger } from '../src/config/logger.js'

const PORT = process.env.PORT ?? 3000

const server = app.listen(PORT, () => {
  logger.info('SERVER_STARTED', { port: PORT })
})

//
// need this in docker container to properly exit since node doesn't handle SIGINT/SIGTERM
// this also won't work on using npm start since:
// https://github.com/npm/npm/issues/4603
// https://github.com/npm/npm/pull/10868
// https://github.com/RisingStack/kubernetes-graceful-shutdown-example/blob/master/src/index.js
// if you want to use npm then start with `docker run --init` to help, but I still don't think it's
// a graceful shutdown of node process
//

const sockets: Map<number, Socket> = new Map()

function waitForSocketsToClose (counter: number): true | NodeJS.Timeout {
  if (counter > 0) {
    logger.info(
      `Waiting ${counter} more ${
        counter === 1 ? 'seconds' : 'second'
      } for all connections to close...`
    )
    return setTimeout(waitForSocketsToClose, 1000, counter - 1)
  }

  logger.info('Forcing all connections to close now')
  sockets.forEach((socket) => {
    socket.destroy()
  })

  return true
}

// shut down server
function shutdown (): void {
  waitForSocketsToClose(10)

  server.close(function onServerClosed (err) {
    if (err != null) {
      logger.error(err)
      process.exitCode = 1
    }
    process.exit()
  })
}

// quit on ctrl-c when running docker in terminal
process.on('SIGINT', () => {
  logger.info('Got SIGINT (aka ctrl-c in docker). Graceful shutdown')
  shutdown()
})

// quit properly on docker stop
process.on('SIGTERM', () => {
  logger.info('Got SIGTERM (docker container stop). Graceful shutdown')
  shutdown()
})

let nextSocketId = 0
server.on('connection', (socket) => {
  const socketId = nextSocketId++
  sockets.set(socketId, socket)

  socket.once('close', () => {
    sockets.delete(socketId)
  })
})
