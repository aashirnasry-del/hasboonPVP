module.exports = function combat(bot) {
  console.log("⚔️ combat loaded")

  setInterval(() => {
    try {
      if (!bot || !bot.entity) return

      const enemy = bot.nearestEntity(e => e.type === 'player')
      if (enemy && bot.entity.position.distanceTo(enemy.position) < 4) {
        bot.attack(enemy)
      }

    } catch (e) {}
  }, 1500)
}
