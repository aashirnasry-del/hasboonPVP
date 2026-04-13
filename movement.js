const { goals } = require('mineflayer-pathfinder')

module.exports = function movement(bot) {
  console.log("🟢 movement loaded")

  setInterval(() => {
    try {
      if (!bot || !bot.entity) return

      const player = bot.nearestEntity(e => e.type === 'player')
      if (!player) return

      bot.lookAt(player.position.offset(0, 1.6, 0))

    } catch (e) {}
  }, 4000)
}
