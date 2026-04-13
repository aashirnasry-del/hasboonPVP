module.exports = function leaveRejoin(bot, restart) {
  bot.on('kicked', () => {
    setTimeout(restart, 20000)
  })
}
