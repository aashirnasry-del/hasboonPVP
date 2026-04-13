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
      console.log("🟢 Bot spawned")

      const mcData = minecraftData(bot.version)
      const moves = new Movements(bot, mcData)
      bot.pathfinder.setMovements(moves)

      auth(bot)

      setTimeout(() => {
        bot.chat(`/login ${config.bot.password}`)
      }, 6000)

      movement(bot)
      combat(bot)
      antiAfk(bot)

      leaveRejoin(bot, startBot)
    })

    bot.on('end', () => {
      console.log("🔄 disconnected")

      if (restarting) return
      restarting = true

      setTimeout(() => {
        restarting = false
        startBot()
      }, 20000) // IMPORTANT: prevents throttle kick
    })

    bot.on('kicked', (reason) => {
      console.log("❌ KICKED:", reason)
    })

    bot.on('error', (err) => {
      console.log("❌ ERROR:", err.message)
    })

  } catch (err) {
    console.log("❌ CRASH:", err.message)

    setTimeout(startBot, 20000)
  }
}

startBot()
