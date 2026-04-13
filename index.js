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
let restarting = false

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
      console.log("Bot spawned")

      const mcData = minecraftData(bot.version)
      const moves = new Movements(bot, mcData)
      bot.pathfinder.setMovements(moves)

      auth(bot)

      setTimeout(() => {
        bot.chat(`/login ${config.bot.password}`)
      }, 5000)

      movement(bot)
      combat(bot)
      antiAfk(bot)

      leaveRejoin(bot, startBot)
    })

    bot.on('end', () => {
      if (restarting) return
      restarting = true

      setTimeout(() => {
        restarting = false
        startBot()
      }, 20000)
    })

    bot.on('error', err => {
      console.log("Error:", err.message)
    })

  } catch (e) {
    console.log("Crash:", e.message)
    setTimeout(startBot, 20000)
  }
}

startBot()
