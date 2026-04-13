const mineflayer = require('mineflayer')
const { pathfinder, Movements } = require('mineflayer-pathfinder')
const minecraftData = require('minecraft-data')

const config = require('./settings.json')

// Modules
const movement = require('./movement')
const combat = require('./combat')
const antiAfk = require('./antiAFK')
const auth = require('./auth')
const leaveRejoin = require('./leaveRejoin')

let bot

// =====================
// START BOT FUNCTION
// =====================
function startBot() {
  bot = mineflayer.createBot({
    host: config.server.ip,
    port: config.server.port,
    username: config.bot.username,
    version: config.server.version
  })

  bot.loadPlugin(pathfinder)

  // =====================
  // SPAWN EVENT
  // =====================
  bot.once('spawn', () => {
    console.log("🟢 Bot spawned successfully")

    // Setup pathfinder
    const mcData = minecraftData(bot.version)
    const moves = new Movements(bot, mcData)
    bot.pathfinder.setMovements(moves)

    // =====================
    // AUTH SYSTEM (REGISTER / LOGIN / ARMOR / EAT / TOTEM)
    // =====================
    auth(bot, config)

    // Small delay login (safe servers)
    setTimeout(() => {
      bot.chat(`/login ${config.bot.password}`)
    }, 3000)

    // =====================
    // MODULES (ONLY AFTER SPAWN)
    // =====================
    movement(bot)
    combat(bot)
    antiAfk(bot)

    // Leave/Rejoin system
    leaveRejoin(bot, startBot)
  })

  // =====================
  // DISCONNECT HANDLING
  // =====================
  bot.on('end', () => {
    console.log("🔄 Bot disconnected, restarting...")
    setTimeout(startBot, 5000)
  })

  bot.on('kicked', (reason) => {
    console.log("❌ Kicked:", reason)
  })

  bot.on('error', (err) => {
    console.log("❌ Error:", err.message)
  })
}

// =====================
// BOOT BOT
// =====================
startBot()
