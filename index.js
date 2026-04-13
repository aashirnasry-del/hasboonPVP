const mineflayer = require('mineflayer')
const fs = require('fs')

// =====================
// CONFIG
// =====================
const HOST = 'PVPpracticeO.aternos.me'
const PORT = 60322
const USERNAME = 'AutoBot'
const PASSWORD = '676767'

// =====================
// REGISTER DATA
// =====================
let data = { registered: false }

if (fs.existsSync('bot_data.json')) {
  data = JSON.parse(fs.readFileSync('bot_data.json'))
}

function saveData() {
  fs.writeFileSync('bot_data.json', JSON.stringify(data, null, 2))
}

// =====================
// BOT START
// =====================
function startBot() {
  const bot = mineflayer.createBot({
    host: HOST,
    port: PORT,
    username: USERNAME,
    version: false
  })

  // =====================
  // STATE SYSTEM (IMPORTANT FIX)
  // =====================
  let state = {
    move: 'forward',
    reacting: false
  }

  // =====================
  // SPAWN
  // =====================
  bot.on('spawn', () => {
    console.log("🧠 Bot online")

    setTimeout(() => {
      bot.chat(`/login ${PASSWORD}`)
    }, 3000)

    movementBrain(bot, state)

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
    }

    if (m.includes('login')) {
      bot.chat(`/login ${PASSWORD}`)
    }
  })

  // =====================
  // 🧠 SINGLE MOVEMENT BRAIN (NO FREEZE FIX)
  // =====================
  function movementBrain(bot, state) {
    const moves = ['forward', 'back', 'left', 'right']

    setInterval(() => {
      if (!bot.entity) return

      bot.clearControlStates()

      // if reacting → stronger escape movement
      if (state.reacting) {
        bot.setControlState(state.move, true)
        bot.setControlState('jump', true)
        return
      }

      // normal movement
      state.move = moves[Math.floor(Math.random() * moves.length)]

      bot.setControlState(state.move, true)

      if (Math.random() < 0.3) bot.setControlState('jump', true)

      bot.look(
        bot.entity.yaw + (Math.random() - 0.5) * 0.4,
        bot.entity.pitch,
        true
      )
    }, 900)
  }

  // =====================
  // ⚡ HIT DODGE (NO FREEZE FIX)
  // =====================
  bot.on('entityHurt', (entity) => {
    if (entity !== bot.entity) return
    if (state.reacting) return

    state.reacting = true

    const attacker = bot.nearestEntity(e =>
      e.type === 'player' &&
      e.position.distanceTo(bot.entity.position) < 6
    )

    if (attacker) {
      const dx = bot.entity.position.x - attacker.position.x
      const dz = bot.entity.position.z - attacker.position.z

      state.move =
        Math.abs(dx) > Math.abs(dz)
          ? (dx > 0 ? 'right' : 'left')
          : (dz > 0 ? 'back' : 'forward')
    }

    setTimeout(() => {
      state.reacting = false
    }, 800)
  })

  // =====================
  // 👀 LOOK
  // =====================
  function lookAtPlayers(bot) {
    const t = bot.nearestEntity(e => e.type === 'player')
    if (t && bot.entity) {
      bot.lookAt(t.position.offset(0, 1.6, 0))
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
        const f = bot.inventory.items().find(i => i.name === item)
        if (f) {
          bot.equip(f, slot).catch(()=>{})
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
    const cur = bot.inventory.slots[off]

    if (!cur || cur.name !== 'totem_of_undying') {
      const t = bot.inventory.items().find(i => i.name === 'totem_of_undying')
      if (t) bot.equip(t, 'off-hand').catch(()=>{})
    }
  }

  // =====================
  // 🍎 GAPPLE
  // =====================
  function autoGapple(bot) {
    if (bot.health <= 12) {
      const g = bot.inventory.items().find(i =>
        i.name === 'golden_apple' || i.name === 'enchanted_golden_apple'
      )

      if (g) {
        bot.equip(g, 'hand').then(() => bot.activateItem()).catch(()=>{})
      }
    }
  }

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
