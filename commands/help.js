const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Affiche la liste de toutes les commandes'),

  async execute(interaction) {

    // Returns the list of cmds
    const commands = interaction.client.commands
    if (!commands || commands.size === 0) {
      return interaction.reply({ content: '❌ Aucune commande trouvée.', ephemeral: true })
    }

    // Embed builder
    const embed = new EmbedBuilder()
      .setTitle('📜 Liste des commandes')
      .setColor('Blue')
      .setDescription('Voici toutes les commandes disponibles :')
      .setTimestamp() // Actual timestamp

    // Watch for all commands of the map
    for (const [name, cmd] of commands) {
      const description = cmd.data?.description || 'Pas de description'
      embed.addFields({ name: `/${name}`, value: description, inline: false })
    }

    // Replies the list to the user with an embed and mention
    // Using interaction.user instead of undefined user
    await interaction.reply({
        content: `<@${interaction.user.id}>`, // Mention to user if he changes a channel
        embeds: [embed],
        ephemeral: false
    })
  }
}
