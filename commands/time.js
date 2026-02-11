const { SlashCommandBuilder } = require('discord.js')

module.exports = {
  // Build new cmd called "time"

  data: new SlashCommandBuilder()
    .setName('time')
    .setDescription("Envoie l'heure actuelle"),

  /**
   * 
   * @param {*} interaction
   * Vars with dates and reply current date 
   */
  async execute(interaction) {

    // Build new date
    const date = new Date()

    // hh:mm:ss format
    const hours   = date.getHours().toString().padStart(2, '0')     // Hours
    const minutes = date.getMinutes().toString().padStart(2, '0')   // Minutes
    const seconds = date.getSeconds().toString().padStart(2, '0')   // Seconds

    // Get the current time (e.g. 15:02)
    const currentTime = `${hours}:${minutes}:${seconds}`

    // Reply with current date (Paris)
    await interaction.reply(`⏰ Il est **${currentTime}**`)
  }
}
