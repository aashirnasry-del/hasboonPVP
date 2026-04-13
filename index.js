const mineflayer = require('mineflayer')

const bot = mineflayer.createBot({
  host: 'PVPpracticeO.aternos.me',
  port: 60322,
  username: 'sepaispider'
})

const PASSWORD = "senpai67" // change this password

let registered = false

bot.on('spawn', () => {
  console.log("Bot joined server!")

  // Start armor + totem system
  setInterval(() => {
    autoEquipArmor()
    autoTotem()
  }, 1000)
})

// 🔐 AUTO REGISTER + LOGIN
bot.on('messagestr', (msg) => {
  const message = msg.toLowerCase()

  if (message.includes('/register') && !registered) {
    bot.chat(`/register ${PASSWORD}`)
    registered = true
    console.log("Registered!")
  }

  if (message.includes('/login')) {
    bot.chat(`/login ${PASSWORD}`)
    console.log("Logged in!")
  }
})

// 🛡️ AUTO ARMOR
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

// 💚 AUTO TOTEM
function autoTotem() {
  const offhand = bot.getEquipmentDestSlot('off-hand')
  const current = bot.inventory.slots[offhand]

  if (!current || current.name !== 'totem_of_undying') {
    const totem = bot.inventory.items().find(i => i.name === 'totem_of_undying')
    if (totem) {
      bot.equip(totem, 'off-hand').catch(() => {})
      console.log("Totem equipped!")
    }
  }
}
