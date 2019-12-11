const config = require('./utils/config')
const http = require('http')
const app = require('./app')

/**
 * @const {Server} server - Käynnistetyn express sovelluksen palvelin.
 */
const server = http.createServer(app)

const PORT = config.PORT || 3001
server.listen(PORT, () => {
  console.log(`server is running at port ${PORT} ${new Date}`)
})