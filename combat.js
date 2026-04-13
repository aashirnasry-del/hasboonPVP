module.exports = function combat(bot) {
  console.log("⚔️ combat loaded")

  bot.on('entityHurt', () => {
    try {
      if (!bot || !bot.entity) return

      const attacker = bot.nearestEntity(e =>
        e.type === 'player'
      )

      if (attacker) {
        bot.attack(attacker)
      }

    } catch (err) {
      console.log("combat error:", err.message)
    }
  })
}
