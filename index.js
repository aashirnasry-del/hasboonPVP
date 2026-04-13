const mineflayer = require('mineflayer')
const fs = require('fs')

// =====================
// CONFIG (YOUR SERVER)
// =====================
const HOST = 'PVPpracticeO.aternos.me'
const PORT = 60322
const USERNAME = 'AutoBot'
const PASSWORD = '676767'

// =====================
// REGISTER SAVE
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

  // =====================
  // SPAWN
  // =====================
  bot.on('spawn', () => {
    console.log("🧠 Bot joined server")

    setTimeout(() => {
      bot.chat(`/login ${PASSWORD}`)
    }, 3000)

    startProMovement(bot)

    setInterval(() => {
      autoArmor(bot)
      autoTotem(bot)
      autoGapple(bot)
      lookAtPlayers(bot)
    }, 1000)
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
      console.log("📝 Registered once")
    }

    if (m.includes('login') || m.includes('l ')) {
      bot.chat(`/login ${PASSWORD}`)
    }
  })

  // =====================
  // 🧠 PRO MOVEMENT AI
  // =====================
  function startProMovement(bot) {
    const moves = ['forward', 'back', 'left', 'right']

    setInterval(() => {
      bot.clearControlStates()

      const move = moves[Math.floor(Math.random() * moves.length)]
      bot.setControlState(move, true)

      if (Math.random() < 0.3) {
        bot.setControlState('jump', true)
      }

      bot.look(
        bot.entity.yaw + (Math.random() - 0.5) * 0.6,
        bot.entity.pitch,
        true
      )
    }, 1100)
  }

  // =====================
  // ⚡ DODGE WHEN HIT
  // =====================
  let reacting = false

  bot.on('entityHurt', (entity) => {
    if (entity !== bot.entity || reacting) return

    reacting = true

    const attacker = bot.nearestEntity(e =>
      e.type === 'player' &&
      e.position.distanceTo(bot.entity.position) < 6
    )

    bot.clearControlStates()

    if (attacker) {
      const dx = bot.entity.position.x - attacker.position.x
      const dz = bot.entity.position.z - attacker.position.z

      const move = Math.abs(dx) > Math.abs(dz)
        ? (dx > 0 ? 'right' : 'left')
        : (dz > 0 ? 'back' : 'forward')

      bot.setControlState(move, true)
    }

    setTimeout(() => {
      bot.setControlState('jump', true)
    }, 100)

    setTimeout(() => {
      bot.clearControlStates()
      reacting = false
    }, 700)
  })

  // =====================
  // 👀 LOOK AT PLAYERS
  // =====================
  function lookAtPlayers(bot) {
    const target = bot.nearestEntity(e => e.type === 'player')

    if (target && bot.entity) {
      bot.lookAt(target.position.offset(0, 1.6, 0))
    }
  }

  // =====================
  // 🛡️ ARMOR
  // =====================
  function autoArmor(bot) {
    const armor = {
      head: ['netherite_helmet','diamond_helmet','iron_helmet'],
      torso: ['netherite_chestplate','diamond_chestplate','iron_chestplate'],
      legs: ['netherite_leggings','diamond_leggings','iron_leggings'],
      feet: ['netherite_boots','diamond_boots','iron_boots']
    }

    for (let slot in armor) {
      for (let item of armor[slot]) {
        const found = bot.inventory.items().find(i => i.name === item)
        if (found) {
          bot.equip(found, slot).catch(() => {})
          break
        }
      }
    }
  }

  // =====================
  // 💚 TOTEM
  // =====================
  function autoTotem(bot) {
    const off = bot.getEquipmentDestSlot('off-hand')
    const current = bot.inventory.slots[off]

    if (!current || current.name !== 'totem_of_undying') {
      const totem = bot.inventory.items().find(i => i.name === 'totem_of_undying')
      if (totem) bot.equip(totem, 'off-hand').catch(() => {})
    }
  }

  // =====================
  // 🍎 GAPPLE
  // =====================
  function autoGapple(bot) {
    if (bot.health <= 12) {
      const item = bot.inventory.items().find(i =>
        i.name === 'golden_apple' || i.name === 'enchanted_golden_apple'
      )

      if (item) {
        bot.equip(item, 'hand').then(() => {
          bot.activateItem()
        }).catch(() => {})
      }
    }
  }

  // =====================
  // ERROR HANDLING
  // =====================
  bot.on('kicked', console.log)
  bot.on('error', console.log)

  bot.on('end', () => {
    console.log("🔄 Reconnecting in 5s...")
    setTimeout(startBot, 5000)
  })
}

// START
startBot()
