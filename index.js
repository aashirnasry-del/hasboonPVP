const mineflayer = require('mineflayer')

// 🔧 CONFIG
const bot = mineflayer.createBot({
  host: 'YOUR_SERVER_IP', // e.g. play.server.com
  port: 25565,
  username: 'AutoBot',
  version: false // auto-detect version
})

const PASSWORD = "123456"

// =====================
// ✅ WHEN BOT JOINS
// =====================
bot.on('spawn', () => {
  console.log("✅ Bot joined server!")

  // 🔐 Force login after delay (IMPORTANT)
  setTimeout(() => {
    bot.chat(`/login ${PASSWORD}`)
  }, 3000)

  // 🔁 Run systems
  setInterval(() => {
    autoEquipArmor()
    autoTotem()
  }, 1000)
})

// =====================
// 🔐 AUTO REGISTER + LOGIN
// =====================
bot.on('messagestr', (msg) => {
  const message = msg.toLowerCase()

  if (message.includes('register')) {
    bot.chat(`/register ${PASSWORD} ${PASSWORD}`)
    console.log("📝 Register command sent")
  }

  if (message.includes('login')) {
    bot.chat(`/login ${PASSWORD}`)
    console.log("🔓 Login command sent")
  }
})

// =====================
// 🛡️ AUTO ARMOR
// =====================
function autoEquipArmor() {
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
function autoTotem() {
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
// ❌ ANTI-CRASH / DEBUG
// =====================
bot.on('kicked', (reason) => {
  console.log("❌ Kicked:", reason)
})

bot.on('error', (err) => {
  console.log("❌ Error:", err)
})

bot.on('end', () => {
  console.log("⚠️ Disconnected... trying to reconnect in 5s")

  // 🔁 AUTO RECONNECT
  setTimeout(() => {
    startBot()
  }, 5000)
})

// =====================
// 🔁 RECONNECT SYSTEM
// =====================
function startBot() {
  console.log("🔄 Reconnecting...")

  const newBot = mineflayer.createBot({
    host: 'YOUR_SERVER_IP',
    port: 25565,
    username: 'AutoBot',
    version: false
  })

  // Copy events again
  newBot.on('spawn', () => {
    setTimeout(() => {
      newBot.chat(`/login ${PASSWORD}`)
    }, 3000)

    setInterval(() => {
      autoEquipArmor()
      autoTotem()
    }, 1000)
  })

  newBot.on('messagestr', (msg) => {
    const message = msg.toLowerCase()

    if (message.includes('register')) {
      newBot.chat(`/register ${PASSWORD} ${PASSWORD}`)
    }

    if (message.includes('login')) {
      newBot.chat(`/login ${PASSWORD}`)
    }
  })

  newBot.on('kicked', console.log)
  newBot.on('error', console.log)
}
