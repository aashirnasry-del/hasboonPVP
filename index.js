const mineflayer = require('mineflayer')
const { pathfinder, Movements } = require('mineflayer-pathfinder')
const minecraftData = require('minecraft-data')

const config = require('./settings.json')

const movement = require('./movement')
const combat = require('./combat')
const antiAfk = require('./antiAfk')
const auth = require('./auth')
const leaveRejoin = require('./leaveRejoin')

let bot

function startBot() {

  try {
    bot = mineflayer.createBot({
      host: config.server.ip,
      port: config.server.port,
      username: config.bot.username,
      version: config.server.version
    })

    bot.loadPlugin(pathfinder)

    bot.once('spawn', () => {
      console.log("🟢 Bot spawned")

      const mcData = minecraftData(bot.version)
      const moves = new Movements(bot, mcData)
      bot.pathfinder.setMovements(moves)

      // AUTH
      auth(bot)

      setTimeout(() => {
        bot.chat(`/login ${config.bot.password}`)
      }, 3000)

      // MODULES
      movement(bot)
      combat(bot)
      antiAfk(bot)

      leaveRejoin(bot, startBot)
    })

    bot.on('end', () => {
      console.log("🔄 reconnecting...")
      setTimeout(startBot, 5000)
    })

    bot.on('error', err => {
      console.log("❌ Error:", err.message)
    })

  } catch (err) {
    console.log("❌ Index crash:", err.message)
  }
}

startBot()
