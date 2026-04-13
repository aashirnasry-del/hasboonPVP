module.exports = function combat(bot) {
  if (!bot) return

  console.log("⚔️ Combat loaded")

  bot.on('entityHurt', (entity) => {
    try {
      if (entity !== bot.entity) return

      const attacker = bot.nearestEntity(e =>
        e.type === 'player' &&
        e.position.distanceTo(bot.entity.position) < 6
      )

      if (attacker) {
        bot.attack(attacker)
      }

    } catch (err) {
      console.log("Combat error:", err.message)
    }
  })
}
