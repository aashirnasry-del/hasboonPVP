const mineflayer = require('mineflayer')
const fs = require('fs')

// =====================
// 🔧 CONFIG
// =====================
const HOST = 'PVPpracticeO.aternos.me'
const PORT = 60322
const USERNAME = 'AutoBot'
const PASSWORD = '676767'

// =====================
// 📁 SAVE DATA (REGISTER ONCE)
// =====================
let data = { registered: false }

if (fs.existsSync('bot_data.json')) {
  data = JSON.parse(fs.readFileSync('bot_data.json'))
}

function saveData() {
  fs.writeFileSync('bot_data.json', JSON.stringify(data, null, 2))
}

// =====================
// 🚀 CREATE BOT
// =====================
function startBot() {
  const bot = mineflayer.createBot({
    host: HOST,
    port: PORT,
    username: USERNAME,
    version: false
  })

  // =====================
  // ✅ SPAWN
  // =====================
  bot.on('spawn', () => {
    console.log("✅ Bot joined server!")

    // login after delay
    setTimeout(() => {
      bot.chat(`/login ${PASSWORD}`)
    }, 3000)

    // main loops
    setInterval(() => {
      autoEquipArmor(bot)
      autoTotem(bot)
      autoGapple(bot)
    }, 1000)

    // 🧠 always keep movement active (important fix)
    setInterval(() => {
      randomMovement(bot)
    }, 2000)
  })

  // =====================
  // 🔐 REGISTER + LOGIN
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
      console.log("🔓 Login sent")
    }
  })

  // =====================
  // 🛡️ AUTO ARMOR
  // =====================
  function autoEquipArmor(bot) {
    const armorSlots = {
      head: ['netherite_helmet', 'diamond_helmet', 'iron_helmet'],
      torso: ['netherite_chestplate', 'diamond_chestplate', 'iron_chestplate'],
      legs: ['netherite_leggings', 'diamond_leggings', 'iron_leggings'],
      feet: ['netherite_boots', 'diamond_boots', 'iron_boots']
    }

    for (let slot in armorSlots) {
      for (let name of armorSlots[slot]) {
        const item = bot.inventory.items().find(i => i.name === name)
        if (item) {
          bot.equip(item, slot).catch(() => {})
          break
        }
      }
    }
  }

  // =====================
  // 💚 AUTO TOTEM
  // =====================
  function autoTotem(bot) {
    const offhandSlot = bot.getEquipmentDestSlot('off-hand')
    const current = bot.inventory.slots[offhandSlot]

    if (!current || current.name !== 'totem_of_undying') {
      const totem = bot.inventory.items().find(i => i.name === 'totem_of_undying')
      if (totem) {
        bot.equip(totem, 'off-hand').catch(() => {})
      }
    }
  }

  // =====================
  // 🍎 AUTO GAPPLE
  // =====================
  function autoGapple(bot) {
    if (bot.health <= 12) {
      const item = bot.inventory.items().find(i =>
        i.name === 'golden_apple' || i.name === 'enchanted_golden_apple'
      )

      if (item) {
        bot.equip(item, 'hand').then(() => {
          bot.activateItem()
          console.log("🍎 Eating gapple")
        }).catch(() => {})
      }
    }
  }

  // =====================
  // 🏃 RANDOM MOVEMENT (FIXED REALISTIC)
  // =====================
  function randomMovement(bot) {
    const actions = ['forward', 'back', 'left', 'right', 'jump']

    // stop first
    bot.clearControlStates()

    // pick random move
    const move = actions[Math.floor(Math.random() * actions.length)]

    bot.setControlState(move, true)

    // small look change = looks like real player
    bot.look(
      bot.entity.yaw + (Math.random() - 0.5) * 0.5,
      bot.entity.pitch,
      true
    )

    // stop after short time
    setTimeout(() => {
      bot.clearControlStates()
    }, 800)
  }

  // =====================
  // 🧱 FALL / BLOCK UNDER CHECK
  // =====================
  bot.on('physicsTick', () => {
    const below = bot.blockAt(bot.entity.position.offset(0, -1, 0))

    if (!below || below.boundingBox === 'empty') {
      bot.setControlState('jump', true)
      bot.setControlState('forward', true)
    }
  })

  // =====================
  // ❌ ERROR HANDLING
  // =====================
  bot.on('kicked', console.log)
  bot.on('error', console.log)

  bot.on('end', () => {
    console.log("🔄 Reconnecting in 5s...")
    setTimeout(startBot, 5000)
  })
}

// =====================
// ▶️ START BOT
// =====================
startBot()
