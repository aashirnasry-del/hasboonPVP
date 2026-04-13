const { goals } = require('mineflayer-pathfinder')

module.exports = function movement(bot) {

  setInterval(() => {
    if (!bot.entity) return

    const player = bot.nearestEntity(e =>
      e.type === 'player' &&
      e.position.distanceTo(bot.entity.position) < 20
    )

    if (player) {
      bot.pathfinder.setGoal(new goals.GoalFollow(player, 2), true)
    } else {
      const x = bot.entity.position.x + (Math.random() * 10 - 5)
      const z = bot.entity.position.z + (Math.random() * 10 - 5)

      bot.pathfinder.setGoal(new goals.GoalXZ(x, z))
    }

  }, 3000)
}
