import http from 'node:http'

const options = {
  timeout: 2000,
  host: 'localhost',
  port: process.env.PORT ?? 3000,
  path: '/healthz' // must be the same as HEALTHCHECK in Dockerfile
}

const request = http.request(options, (res) => {
  console.info(`STATUS: ${res.statusCode ?? 'UNKNOWN'}`)
  process.exitCode = res.statusCode === 200 ? 0 : 1
  process.exit()
})

request.on('error', (err) => {
  console.error('ERROR', err)
  process.exit(1)
})

request.end()
