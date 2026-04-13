module.exports = function combat(bot) {

  bot.on('entityHurt', (entity) => {
    if (entity !== bot.entity) return

    const attacker = bot.nearestEntity(e =>
      e.type === 'player' &&
      e.position.distanceTo(bot.entity.position) < 6
    )

    if (attacker) {
      bot.attack(attacker)
    }
  })

}
