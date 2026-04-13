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
// 📁 LOAD DATA
// =====================
let data = { registered: true }

if (fs.existsSync('bot_data.json')) {
  data = JSON.parse(fs.readFileSync('bot_data.json'))
}

function saveData() {
  fs.writeFileSync('bot_data.json', JSON.stringify(data, null, 2))
}

// =====================
// 🚀 START BOT
// =====================
function createBot() {
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
    console.log("✅ Bot joined!")

    setTimeout(() => {
      bot.chat(`/login ${PASSWORD}`)
    }, 3000)

    setInterval(() => {
      autoEquipArmor(bot)
      autoTotem(bot)
      autoGapple(bot)
    }, 1000)
  })

  // =====================
  // 🔐 REGISTER + LOGIN
  // =====================
  bot.on('messagestr', (msg) => {
    const m = msg.toLowerCase()

    if (m.includes('register') && !data.registered) {
      bot.chat(`/register ${PASSWORD} ${PASSWORD}`)
      data.registered = true
      saveData()
      console.log("📝 Registered")
    }

    if (m.includes('login')) {
      bot.chat(`/login ${PASSWORD}`)
      console.log("🔓 Logged in")
    }
  })

  // =====================
  // 🛡️ ARMOR
  // =====================
  function autoEquipArmor(bot) {
    const armorSlots = {
      head: ['netherite_helmet','diamond_helmet'],
      torso: ['netherite_chestplate','diamond_chestplate'],
      legs: ['netherite_leggings','diamond_leggings'],
      feet: ['netherite_boots','diamond_boots']
    }

    for (let slot in armorSlots) {
      for (let name of armorSlots[slot]) {
        const item = bot.inventory.items().find(i => i.name === name)
        if (item) {
          bot.equip(item, slot).catch(()=>{})
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
      if (totem) bot.equip(totem, 'off-hand').catch(()=>{})
    }
  }

  // =====================
  // 🍎 AUTO GAPPLE
  // =====================
  function autoGapple(bot) {
    if (bot.health <= 12) { // low HP
      const gapple = bot.inventory.items().find(i =>
        i.name === 'golden_apple' || i.name === 'enchanted_golden_apple'
      )

      if (gapple) {
        bot.equip(gapple, 'hand').then(() => {
          bot.activateItem()
          console.log("🍎 Eating gapple")
        }).catch(()=>{})
      }
    }
  }

  // =====================
  // 🏃 MOVE WHEN HIT
  // =====================
  bot.on('entityHurt', (entity) => {
    if (entity === bot.entity) {
      console.log("⚡ Got hit! Moving...")

      bot.setControlState('forward', true)
      bot.setControlState('jump', true)

      setTimeout(() => {
        bot.clearControlStates()
      }, 1000)
    }
  })

  // =====================
  // 🧱 BLOCK BREAK UNDER
  // =====================
  bot.on('physicsTick', () => {
    const below = bot.blockAt(bot.entity.position.offset(0, -1, 0))

    if (!below || below.type === 0) {
      // air under = falling
      bot.setControlState('jump', true)
      bot.setControlState('forward', true)
    }
  })

  // =====================
  // ❌ ERROR + RECONNECT
  // =====================
  bot.on('kicked', console.log)
  bot.on('error', console.log)

  bot.on('end', () => {
    console.log("🔄 Reconnecting in 5s...")
    setTimeout(createBot, 5000)
  })
}

// ▶️ START
createBot()
