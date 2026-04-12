const mineflayer = require('mineflayer')
const pvp = require('mineflayer-pvp').plugin
const Vec3 = require('vec3')

const HOST = 'PVPpracticeO.aternos.me'
const PORT = 60322
const USERNAME = 'CrystalBot_Pro'
const PASSWORD = 'CrystalBot'

let bot
let loggedIn = false
let registered = false

function createBot() {
  bot = mineflayer.createBot({
    host: HOST,
    port: PORT,
    username: USERNAME
  })

  bot.loadPlugin(pvp)

  console.log('🤖 Bot starting...')

  bot.on('spawn', () => {
    console.log('✅ Spawned')

    setTimeout(() => {
      bot.chat(`/login ${PASSWORD}`)
    }, 5000)

    combatLoop()
    autoArmor()
    autoTotem()
  })

  // =====================
  // LOGIN + REGISTER (ONE TIME ONLY)
  // =====================
  bot.on('messagestr', (msg) => {
    const text = msg.toLowerCase()

    // REGISTER ONLY ONCE
    if (!registered && text.includes('register')) {
      bot.chat(`/register ${PASSWORD}`)
      registered = true
      console.log('📝 Registered once')
      return
    }

    // LOGIN SYSTEM
    if (text.includes('login')) {
      bot.chat(`/login ${PASSWORD}`)
      console.log('🔐 Login sent')
    }

    if (text.includes('logged')) {
      loggedIn = true
      console.log('✅ Logged in')
    }
  })

  // =====================
  // COMBAT SYSTEM ⚔️
  // =====================
  function combatLoop() {
    setInterval(() => {
      if (!loggedIn || !bot.entity) return

      const target = bot.nearestEntity(e =>
        e.type === 'player' && e.username !== bot.username
      )

      if (!target) return

      // aim
      bot.lookAt(target.position.offset(0, 1.6, 0), true)

      // attack
      bot.pvp.attack(target)

      // crystal break
      const crystal = bot.nearestEntity(e => e.name === 'end_crystal')
      if (crystal) bot.attack(crystal)

    }, 800)
  }

  // =====================
  // AUTO ARMOR 🛡️
  // =====================
  function autoArmor() {
    setInterval(() => {
      if (!loggedIn) return

      const helmet = bot.inventory.items().find(i => i.name.includes('helmet'))
      const chest = bot.inventory.items().find(i => i.name.includes('chestplate'))
      const legs = bot.inventory.items().find(i => i.name.includes('leggings'))
      const boots = bot.inventory.items().find(i => i.name.includes('boots'))

      if (helmet) bot.equip(helmet, 'head').catch(() => {})
      if (chest) bot.equip(chest, 'torso').catch(() => {})
      if (legs) bot.equip(legs, 'legs').catch(() => {})
      if (boots) bot.equip(boots, 'feet').catch(() => {})

    }, 3000)
  }

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
  // RECONNECT 🔁
  // =====================
  bot.on('end', () => {
    console.log('🔄 Reconnecting...')
    setTimeout(createBot, 10000)
  })

  bot.on('error', (err) => {
    console.log('⚠️ Error:', err.message)
  })

  bot.on('kicked', (reason) => {
    console.log('❌ Kicked:', reason)
  })
}

createBot()
