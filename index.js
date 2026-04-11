const mineflayer = require('mineflayer')
const pvp = require('mineflayer-pvp').plugin
const Vec3 = require('vec3')

const HOST = 'PVPpracticeO.aternos.me'
const PORT = 60322
const USERNAME = 'CrystalBot_Pro'
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

  bot.on('spawn', () => {
    console.log('🤖 Pro Crystal Bot Spawned')

    setTimeout(() => {
      bot.chat(`/login ${PASSWORD}`)
    }, 5000)

    combatLoop()
    autoTotem()
  })

  // =====================
  // LOGIN
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
  // MAIN COMBAT LOOP ⚔️
  // =====================
  function combatLoop() {
    setInterval(() => {
      if (!loggedIn || !bot.entity) return

      const target = bot.nearestEntity(e =>
        e.type === 'player' && e.username !== bot.username
      )

      if (!target) return

      // look at head
      bot.lookAt(target.position.offset(0, 1.6, 0), true)

      // attack with sword
      bot.pvp.attack(target)

      // crystal logic
      placeCrystalNear(target)

    }, 700) // faster reaction
  }

  // =====================
  // CRYSTAL PLACE 💎
  // =====================
  function placeCrystalNear(target) {
    const offsets = [
      new Vec3(1, 0, 0),
      new Vec3(-1, 0, 0),
      new Vec3(0, 0, 1),
      new Vec3(0, 0, -1)
    ]

    for (const offset of offsets) {
      const pos = target.position.floored().plus(offset)

      const block = bot.blockAt(pos)

      if (block && (block.name.includes('obsidian') || block.name.includes('bedrock'))) {
        const above = bot.blockAt(pos.offset(0, 1, 0))

        if (above && above.name === 'air') {
          const crystal = bot.inventory.items().find(i => i.name.includes('end_crystal'))

          if (crystal) {
            bot.equip(crystal, 'hand').then(() => {
              bot.placeBlock(block, new Vec3(0, 1, 0)).catch(() => {})
            })
          }
        }
      }
    }
  }

  // =====================
  // BREAK CRYSTALS 💥
  // =====================
  bot.on('physicsTick', () => {
    if (!loggedIn) return

    const crystal = bot.nearestEntity(e => e.name === 'end_crystal')

    if (crystal) {
      bot.attack(crystal)
    }
  })

  // =====================
  // AUTO TOTEM 🛡️
  // =====================
  function autoTotem() {
    setInterval(() => {
      if (!loggedIn) return

      const totem = bot.inventory.items().find(i => i.name.includes('totem'))

      if (totem) {
        bot.equip(totem, 'off-hand').catch(() => {})
      }
    }, 2000)
  }

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
