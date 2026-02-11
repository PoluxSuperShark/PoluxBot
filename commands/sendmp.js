const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
  ChannelType
} = require('discord.js')

const LOG_CHANNEL_ID = process.env.LOG_CHANNEL_ID

module.exports = {
  data: new SlashCommandBuilder()
    .setName('sendmp')
    .setDescription('Envoyer un message privé à un utilisateur')
    .addUserOption(option =>
      option
        .setName('utilisateur')
        .setDescription('Utilisateur à contacter')
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName('message')
        .setDescription('Message à envoyer')
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const user = interaction.options.getUser('utilisateur')
    const messageContent = interaction.options.getString('message')

    let dmSent = false

    // Tentative d'envoyer le MP
    try {
      await user.send(messageContent)
      dmSent = true
    } catch {
      dmSent = false
    }

    // Réponse au modérateur
    await interaction.reply({
      content: dmSent
        ? `✅ Message envoyé à **${user.tag}**`
        : `⚠️ Impossible d'envoyer le message à **${user.tag}** (DM fermés ou bloqués)`,
      // ephemeral: false
    })

    // Embed log
    try {
      const guild = interaction.guild
      if (!guild || !LOG_CHANNEL_ID) return

      const logChannel = await guild.channels.fetch(LOG_CHANNEL_ID).catch(() => null)

      if (logChannel && logChannel.type === ChannelType.GuildText) {
        const embed = new EmbedBuilder()
          .setTitle('📩 Commande /sendmp')
          .setColor(dmSent ? 'Green' : 'Red')
          .addFields(
            { name: 'Utilisateur', value: `${user.tag} (${user.id})`, inline: true },
            { name: 'Modérateur', value: `${interaction.user.tag}`, inline: true },
            { name: 'Message', value: messageContent },
            { name: 'DM envoyé ?', value: dmSent ? '✅ Oui' : '❌ Non', inline: true }
          )
          .setTimestamp()

        await logChannel.send({ embeds: [embed] })
      } else {
        console.warn('Le salon de logs est introuvable ou n’est pas un salon texte')
      }
    } catch (err) {
      console.error('Erreur lors de l’envoi du log embed :', err)
    }
  }
}
