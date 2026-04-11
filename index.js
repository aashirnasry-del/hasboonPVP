const mineflayer = require('mineflayer')
const pvp = require('mineflayer-pvp').plugin

const HOST = 'PVPpracticeO.aternos.me'
const PORT = 60322
const USERNAME = 'CrystalBot_01'
const PASSWORD = 'hasboon99'

let bot
let loggedIn = false

function createBot() {
  bot = mineflayer.createBot({
    host: HOST,
    port: PORT,
    username: USERNAME
  })

  bot.loadPlugin(pvp)

  console.log('🤖 Starting Crystal PvP Bot...')

  bot.on('spawn', () => {
    console.log('✅ Spawned')

    setTimeout(() => {
      bot.chat(`/login ${PASSWORD}`)
    }, 5000)

    startCombat()
  })

  // =====================
  // LOGIN SYSTEM
  // =====================
  bot.on('messagestr', (msg) => {
    const text = msg.toLowerCase()

    if (text.includes('login')) {
      bot.chat(`/login ${PASSWORD}`)
    }

    if (text.includes('logged')) {
      loggedIn = true
      console.log('✅ Logged in')
    }
  })

  // =====================
  // COMBAT SYSTEM
  // =====================
  function startCombat() {
    setInterval(() => {
      if (!loggedIn || !bot.entity) return

      const target = bot.nearestEntity(entity =>
        entity.type === 'player' && entity.username !== bot.username
      )

      if (!target) return

      bot.lookAt(target.position.offset(0, 1.6, 0))
      bot.pvp.attack(target)

    }, 1500)
  }

  // =====================
  // CRYSTAL BREAK
  // =====================
  bot.on('physicsTick', () => {
    if (!loggedIn) return

    const crystal = bot.nearestEntity(e => e.name === 'end_crystal')

    if (crystal) {
      bot.attack(crystal)
    }
  })

  // =====================
  // RECONNECT
  // =====================
  bot.on('end', () => {
    console.log('🔄 Reconnecting...')
    setTimeout(createBot, 10000)
  })

  bot.on('error', (err) => {
    console.log('⚠️ Error:', err.message)
  })
}

createBot()
