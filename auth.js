module.exports = function auth(bot, config) {

  // =====================
  // REGISTER / LOGIN
  // =====================
  let loggedIn = false

  bot.on('messagestr', (msg) => {
    const m = msg.toLowerCase()

    if (m.includes('register')) {
      bot.chat(`/register ${config.bot.password} ${config.bot.password}`)
    }

    if (m.includes('login')) {
      setTimeout(() => {
        bot.chat(`/login ${config.bot.password}`)
      }, 1500)
    }
  })

  // =====================
  // AUTO ARMOR EQUIP
  // =====================
  function equipArmor() {
    const armorSlots = {
      head: 'helmet',
      torso: 'chestplate',
      legs: 'leggings',
      feet: 'boots'
    }

    for (const slot in armorSlots) {
      const item = bot.inventory.items().find(i =>
        i.name.includes(armorSlots[slot])
      )

      if (item) {
        bot.equip(item, slot).catch(() => {})
      }
    }
  }

  // =====================
  // AUTO EAT GOLDEN APPLE
  // =====================
  function autoEat() {
    if (bot.food < 16) {
      const apple = bot.inventory.items().find(i =>
        i.name.includes('golden_apple')
      )

      if (apple) {
        bot.equip(apple, 'hand')
          .then(() => bot.consume())
          .catch(() => {})
      }
    }
  }

  // =====================
  // AUTO TOTEM EQUIP
  // =====================
  function autoTotem() {
    const totem = bot.inventory.items().find(i =>
      i.name.includes('totem')
    )

    if (totem) {
      bot.equip(totem, 'off-hand').catch(() => {})
    }
  }

  // =====================
  // SURVIVAL LOOP (SAFE)
  // =====================
  setInterval(() => {
    if (!bot.entity) return

    equipArmor()
    autoEat()
    autoTotem()

  }, 2000)

}
