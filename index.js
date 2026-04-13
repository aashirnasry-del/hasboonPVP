const mineflayer = require('mineflayer')
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder')
const minecraftData = require('minecraft-data')
const fs = require('fs')

// =====================
// SERVER CONFIG
// =====================
const HOST = 'PVPpracticeO.aternos.me'
const PORT = 60322
const USERNAME = 'AutoBot'
const PASSWORD = '676767'

// =====================
// DATA SAVE
// =====================
let data = { registered: false }

if (fs.existsSync('bot_data.json')) {
  data = JSON.parse(fs.readFileSync('bot_data.json'))
}

function saveData() {
  fs.writeFileSync('bot_data.json', JSON.stringify(data, null, 2))
}

// =====================
// START BOT
// =====================
function startBot() {
  const bot = mineflayer.createBot({
    host: HOST,
    port: PORT,
    username: USERNAME,
    version: false
  })

  bot.loadPlugin(pathfinder)

  let mcData
  let movements
  let reacting = false

  // =====================
  // SPAWN
  // =====================
  bot.on('spawn', () => {
    console.log("🤖 Slobos-style AI online")

    mcData = minecraftData(bot.version)
    movements = new Movements(bot, mcData)
    bot.pathfinder.setMovements(movements)

    setTimeout(() => {
      bot.chat(`/login ${PASSWORD}`)
    }, 3000)

    brain(bot)
  })

  // =====================
  // REGISTER / LOGIN
  // =====================
  bot.on('messagestr', (msg) => {
    const m = msg.toLowerCase()

    if ((m.includes('register') || m.includes('reg')) && !data.registered) {
      bot.chat(`/register ${PASSWORD} ${PASSWORD}`)
      data.registered = true
      saveData()
    }

    if (m.includes('login')) {
      bot.chat(`/login ${PASSWORD}`)
    }
  })

  // =====================
  // 🧠 MAIN AI BRAIN (SLOBOS STYLE)
  // =====================
  function brain(bot) {
    setInterval(() => {
      if (!bot.entity || reacting) return

      const player = bot.nearestEntity(e =>
        e.type === 'player' &&
        e.position.distanceTo(bot.entity.position) < 20
      )

      if (player) {
        // follow smoothly (like PvP practice bots)
        bot.pathfinder.setGoal(new goals.GoalFollow(player, 2), true)
      } else {
        // roam randomly like survival player
        const x = bot.entity.position.x + (Math.random() * 16 - 8)
        const z = bot.entity.position.z + (Math.random() * 16 - 8)
        bot.pathfinder.setGoal(new goals.GoalXZ(x, z))
      }
    }, 2500)
  }

  // =====================
  // ⚡ REALISTIC DODGE SYSTEM
  // =====================
  bot.on('entityHurt', (entity) => {
    if (entity !== bot.entity || reacting) return

    reacting = true

    const attacker = bot.nearestEntity(e =>
      e.type === 'player' &&
      e.position.distanceTo(bot.entity.position) < 6
    )

    if (attacker) {
      const dx = bot.entity.position.x - attacker.position.x
      const dz = bot.entity.position.z - attacker.position.z

      const x = bot.entity.position.x + (dx > 0 ? 6 : -6)
      const z = bot.entity.position.z + (dz > 0 ? 6 : -6)

      bot.pathfinder.setGoal(new goals.GoalXZ(x, z))
    }

    setTimeout(() => {
      reacting = false
    }, 1200)
  })

  // =====================
  // 👀 LOOK SYSTEM (REALISTIC)
  // =====================
  setInterval(() => {
    const target = bot.nearestEntity(e => e.type === 'player')
    if (target) {
      bot.lookAt(target.position.offset(0, 1.6, 0))
    }
  }, 1000)

  // =====================
  // ERROR HANDLING
  // =====================
  bot.on('kicked', console.log)
  bot.on('error', console.log)

  bot.on('end', () => {
    console.log("🔄 Reconnecting...")
    setTimeout(startBot, 5000)
  })
}

startBot()
