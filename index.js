const mineflayer = require('mineflayer')
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder')
const minecraftData = require('minecraft-data')

const HOST = 'PVPpracticeO.aternos.me'
const PORT = 60322
const USERNAME = 'AutoBot'
const PASSWORD = '676767'

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

  let state = {
    ready: false,
    moving: false
  }

  // =====================
  // SPAWN (ONLY ONCE)
  // =====================
  bot.on('spawn', () => {
    console.log("🟢 Bot fully spawned")

    mcData = minecraftData(bot.version)
    movements = new Movements(bot, mcData)
    bot.pathfinder.setMovements(movements)

    // LOGIN ONLY ONCE (IMPORTANT FIX)
    setTimeout(() => {
      bot.chat(`/login ${PASSWORD}`)
    }, 4000)

    state.ready = true
    startBrain(bot, state)
  })

  // =====================
  // REGISTER / LOGIN (SAFE)
  // =====================
  bot.on('messagestr', (msg) => {
    const m = msg.toLowerCase()

    if (m.includes('register')) {
      setTimeout(() => {
        bot.chat(`/register ${PASSWORD} ${PASSWORD}`)
      }, 2000)
    }

    if (m.includes('login')) {
      setTimeout(() => {
        bot.chat(`/login ${PASSWORD}`)
      }, 2000)
    }
  })

  // =====================
  // 🧠 CLEAN BRAIN (NO FREEZE)
  // =====================
  function startBrain(bot, state) {
    setInterval(() => {
      if (!state.ready || !bot.entity) return

      const player = bot.nearestEntity(e =>
        e.type === 'player' &&
        e.position.distanceTo(bot.entity.position) < 15
      )

      if (player) {
        // follow safely
        bot.pathfinder.setGoal(new goals.GoalFollow(player, 2), true)
      } else {
        // roam slowly (IMPORTANT: NOT FAST UPDATES)
        if (!state.moving) {
          state.moving = true

          const x = bot.entity.position.x + (Math.random() * 8 - 4)
          const z = bot.entity.position.z + (Math.random() * 8 - 4)

          bot.pathfinder.setGoal(new goals.GoalXZ(x, z))

          setTimeout(() => {
            state.moving = false
          }, 4000)
        }
      }
    }, 3000)
  }

  // =====================
  // ⚡ HIT REACTION (SAFE, NO FREEZE)
  // =====================
  bot.on('entityHurt', (entity) => {
    if (entity !== bot.entity) return
    if (!bot.entity) return

    const attacker = bot.nearestEntity(e =>
      e.type === 'player' &&
      e.position.distanceTo(bot.entity.position) < 6
    )

    if (attacker) {
      const x = bot.entity.position.x + (Math.random() * 5 - 2.5)
      const z = bot.entity.position.z + (Math.random() * 5 - 2.5)

      bot.pathfinder.setGoal(new goals.GoalXZ(x, z))
    }
  })

  // =====================
  // LOOK (VERY LOW FREQUENCY = NO FREEZE)
  // =====================
  setInterval(() => {
    if (!bot.entity) return

    const t = bot.nearestEntity(e => e.type === 'player')
    if (t) bot.lookAt(t.position.offset(0, 1.6, 0))
  }, 2000)

  // =====================
  // SAFETY HANDLERS
  // =====================
  bot.on('kicked', console.log)
  bot.on('error', console.log)

  bot.on('end', () => {
    console.log("🔄 Restarting bot...")
    setTimeout(startBot, 8000)
  })
}

startBot()
