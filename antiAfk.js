module.exports = function antiAfk(bot) {
  if (!bot) return

  console.log("💤 AntiAFK loaded")

  setInterval(() => {
    try {
      if (!bot.entity) return

      // SAFE ONLY (NO MOVEMENT CONTROL)
      const player = bot.nearestEntity(e => e.type === 'player')

      if (player) {
        bot.lookAt(player.position.offset(0, 1.6, 0))
      }

    } catch (err) {
      console.log("AntiAFK error:", err.message)
    }
  }, 3000)
}
