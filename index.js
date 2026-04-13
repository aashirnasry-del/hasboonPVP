const mineflayer = require('mineflayer')
const { pathfinder, Movements } = require('mineflayer-pathfinder')
const minecraftData = require('minecraft-data')

const config = require('./settings.json')

const movement = require('./movement')
const combat = require('./combat')
const antiAfk = require('./antiAfk')
const leaveRejoin = require('./leaveRejoin')

const auth = require('./auth')
let bot

function startBot() {
  bot = mineflayer.createBot({
    host: config.server.ip,
    port: config.server.port,
    username: config.bot.username,
    version: config.server.version
  })

  bot.loadPlugin(pathfinder)

  bot.on('spawn', () => {
  console.log("🟢 Bot started")

  const mcData = minecraftData(bot.version)
  const moves = new Movements(bot, mcData)
  bot.pathfinder.setMovements(moves)

  setTimeout(() => {
    bot.chat(`/login ${config.bot.password}`)
  }, 3000)

  // 👉 ADD THIS LINE HERE
  auth(bot, config)

  // other modules
  if (config.modules.movement) movement(bot)
  if (config.modules.combat) combat(bot)
  if (config.modules.antiAfk) antiAfk(bot)

  leaveRejoin(bot, startBot)
})
  })

  bot.on('end', () => {
    console.log("🔄 Reconnecting...")
    setTimeout(startBot, 5000)
  })

  bot.on('error', console.log)
  bot.on('kicked', console.log)
}

startBot()
