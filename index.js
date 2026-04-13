const mineflayer = require('mineflayer')
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder')
const minecraftData = require('minecraft-data')
const fs = require('fs')

const HOST = 'PVPpracticeO.aternos.me'
const PORT = 60322
const USERNAME = 'AutoBot'
const PASSWORD = '676767'

// =====================
// SAVE REGISTER STATE
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

  // =====================
  // SPAWN
  // =====================
  bot.on('spawn', () => {
    console.log("🟢 Bot online")

    mcData = minecraftData(bot.version)
    movements = new Movements(bot, mcData)
    bot.pathfinder.setMovements(movements)

    // LOGIN (safe delay)
    setTimeout(() => {
      bot.chat(`/login ${PASSWORD}`)
    }, 3000)

    brain(bot)
  })

  // =====================
  // REGISTER + LOGIN HANDLER
  // =====================
  bot.on('messagestr', (msg) => {
    const m = msg.toLowerCase()

    // REGISTER ONLY ONCE
    if ((m.includes('register') || m.includes('reg')) && !data.registered) {
      setTimeout(() => {
        bot.chat(`/register ${PASSWORD} ${PASSWORD}`)
      }, 1500)

      data.registered = true
      saveData()
      console.log("📝 Registered once")
    }

    // LOGIN (always safe)
    if (m.includes('login')) {
      setTimeout(() => {
        bot.chat(`/login ${PASSWORD}`)
      }, 1500)
    }
  })

  // =====================
  // 🧠 STABLE AI BRAIN
  // =====================
  function brain(bot) {
    setInterval(() => {
      if (!bot.entity) return

      const player = bot.nearestEntity(e =>
        e.type === 'player' &&
        e.position.distanceTo(bot.entity.position) < 20
      )

      if (player) {
        bot.pathfinder.setGoal(new goals.GoalFollow(player, 2), true)
      } else {
        const x = bot.entity.position.x + (Math.random() * 10 - 5)
        const z = bot.entity.position.z + (Math.random() * 10 - 5)

        bot.pathfinder.setGoal(new goals.GoalXZ(x, z))
      }
    }, 2500)
  }

  // =====================
  // ⚡ HIT DODGE (SAFE)
  // =====================
  bot.on('entityHurt', (entity) => {
    if (entity !== bot.entity) return

    const attacker = bot.nearestEntity(e =>
      e.type === 'player' &&
      e.position.distanceTo(bot.entity.position) < 6
    )

    if (attacker) {
      const x = bot.entity.position.x + (Math.random() * 6 - 3)
      const z = bot.entity.position.z + (Math.random() * 6 - 3)

      bot.pathfinder.setGoal(new goals.GoalXZ(x, z))
    }
  })

  // =====================
  // LOOK SYSTEM
  // =====================
  setInterval(() => {
    const t = bot.nearestEntity(e => e.type === 'player')
    if (t) bot.lookAt(t.position.offset(0, 1.6, 0))
  }, 1200)

  // =====================
  // ERRORS
  // =====================
  bot.on('kicked', console.log)
  bot.on('error', console.log)

  bot.on('end', () => {
    console.log("🔄 Restarting...")
    setTimeout(startBot, 5000)
  })
}

startBot()
