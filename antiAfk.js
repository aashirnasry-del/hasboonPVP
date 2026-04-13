module.exports = function antiAfk(bot) {
  console.log("💤 antiAfk loaded")

  setInterval(() => {
    try {
      if (!bot || !bot.entity) return

      bot.setControlState('jump', true)
      setTimeout(() => {
        bot.setControlState('jump', false)
      }, 300)

    } catch (e) {}
  }, 8000)
}
