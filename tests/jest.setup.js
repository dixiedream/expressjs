const logger = require('../src/config/logger')

// Disables winston API logging
logger.transports.forEach((t) => {
  // eslint-disable-next-line no-param-reassign
  t.silent = true
})
