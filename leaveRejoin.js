module.exports = function leaveRejoin(bot, restart) {

  bot.on('end', () => {
    setTimeout(restart, 50000)
  })

}
