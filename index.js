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
// 📁 LOAD SAVE DATA
// =====================
let data = { registered: false }

if (fs.existsSync('bot_data.json')) {
  data = JSON.parse(fs.readFileSync('bot_data.json'))
}

function saveData() {
  fs.writeFileSync('bot_data.json', JSON.stringify(data, null, 2))
}

// =====================
// 🚀 START BOT FUNCTION
// =====================
function createBot() {
  const bot = mineflayer.createBot({
    host: HOST,
    port: PORT,
    username: USERNAME,
    version: false
  })

  // =====================
  // ✅ WHEN BOT JOINS
  // =====================
  bot.on('spawn', () => {
    console.log("✅ Bot joined server!")

    // 🔑 Force login after delay
    setTimeout(() => {
      bot.chat(`/login ${PASSWORD}`)
    }, 3000)

    // 🔁 Systems loop
    setInterval(() => {
      autoEquipArmor(bot)
      autoTotem(bot)
    }, 1000)
  })

  // =====================
  // 🔐 REGISTER + LOGIN
  // =====================
  bot.on('messagestr', (msg) => {
    const message = msg.toLowerCase()

    // ✅ REGISTER ONLY ONCE
    if (message.includes('register') && !data.registered) {
      bot.chat(`/register ${PASSWORD} ${PASSWORD}`)
      data.registered = true
      saveData()
      console.log("📝 Registered (saved)")
    }

    // 🔑 ALWAYS LOGIN
    if (message.includes('login')) {
      bot.chat(`/login ${PASSWORD}`)
      console.log("🔓 Logged in")
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
      for (let itemName of armorSlots[slot]) {
        const item = bot.inventory.items().find(i => i.name === itemName)
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
    const currentItem = bot.inventory.slots[offhandSlot]

    if (!currentItem || currentItem.name !== 'totem_of_undying') {
      const totem = bot.inventory.items().find(i => i.name === 'totem_of_undying')
      if (totem) {
        bot.equip(totem, 'off-hand').catch(() => {})
        console.log("💚 Totem equipped")
      }
    }
  }

  // =====================
  // ❌ ERROR + RECONNECT
  // =====================
  bot.on('kicked', (reason) => {
    console.log("❌ Kicked:", reason)
  })

  bot.on('error', (err) => {
    console.log("❌ Error:", err)
  })

  bot.on('end', () => {
    console.log("⚠️ Disconnected! Reconnecting in 5s...")

    setTimeout(() => {
      createBot()
    }, 5000)
  })
}

// =====================
// ▶️ START BOT
// =====================
createBot()
