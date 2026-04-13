const { goals } = require('mineflayer-pathfinder')

module.exports = function movement(bot) {
  console.log("🟢 movement loaded")

  setInterval(() => {
        try {
      if (!bot || !bot.entity) return
      if (!bot.pathfinder) return

      const player = bot.nearestEntity(e =>
        e.type === 'player'
      )

    } catch (err) {
      console.log("movement error:", err.message)
    }
    
  }, 4000)
}
