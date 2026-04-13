module.exports = function antiAfk(bot) {
  console.log("💤 antiAfk loaded")

  setInterval(() => {
    try {
      if (!bot || !bot.entity) return

      const p = bot.nearestEntity(e => e.type === 'player')
      if (p && p.position) {
        bot.lookAt(p.position.offset(0, 1.6, 0))
      }

    } catch (err) {
      console.log("antiAfk error:", err.message)
    }
  }, 3000)
}
