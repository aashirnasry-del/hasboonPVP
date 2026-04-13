module.exports = function antiAfk(bot) {

  setInterval(() => {
    if (!bot.entity) return

    // ONLY LOOK ACTION (SAFE)
    const t = bot.nearestEntity(e => e.type === 'player')
    if (t) bot.lookAt(t.position.offset(0, 1.6, 0))

  }, 2000)
}
