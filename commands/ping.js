const { SlashCommandBuilder } = require('discord.js')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Vérifie la latence du bot'),

  async execute(interaction) {
    // Gets the current ping
    const pingBot = interaction.client.ws.ping

    // Reply with the latence
    await interaction.reply(`🏓 La latence du bot est de : **${pingBot} ms** !`)
  }
}
